
var fractCanvas = document.getElementById("fract");
var dashCanvas = document.getElementById("dashboard");

var fractal = Fractal();

var viewportComplex = { w: 3, h: 3, centre: { Re: -0.5, Im:0.0 } };
var zoomportComplex = viewportComplex;
var clickCoords = {};
var canvasImageCopy;
fractal.draw(viewportComplex);



function Fractal() {

    var ctxFract = fractCanvas.getContext("2d");
    var ctxDash = dashCanvas.getContext("2d");

    var canvasRect = fractCanvas.getBoundingClientRect();

    fractCanvas.addEventListener("mousedown", doMouseDown, false);
    fractCanvas.addEventListener("mouseup", doMouseUp, false);
    fractCanvas.addEventListener("mousemove", doMouseMove, false);

    function draw(viewportComplex) {

        // amount of canvas that is used
        var viewWPix = canvasRect.width - 2;
        var viewHPix = canvasRect.height - 2;

        // number of rendered 'pixels'
        var numBlocks = { w: 100, h: 100};

        // calc size of block
        var sizeOfBlock = { w: viewWPix/numBlocks.w, h: viewHPix/numBlocks.h };
        var blockBorder = 1;

        console.log("f: draw");
        console.log('sizeOfBlock:' + sizeOfBlock);
        console.log(viewportComplex);
        ctxFract.fillStyle = 'green';
        ctxFract.fillRect(0, 0, viewWPix, viewHPix);

        for (row = 0; row < numBlocks.h; row++) {
            for (col = 0; col < numBlocks.w; col++) {
                complexCoords = getComplexCoords(viewportComplex, col * sizeOfBlock.w, row * sizeOfBlock.h);
                iterations = calcEscape(complexCoords.Re, complexCoords.Im);
                r = 255 - iterations;
                g = 255 - iterations;
                b = 255 - iterations;
                ctxFract.fillStyle = 'rgb(' + r + ', ' + g + ', ' + b + ')';
                ctxFract.fillRect(  
                    (col * sizeOfBlock.w) + blockBorder, 
                    (row * sizeOfBlock.h) + blockBorder, 
                    sizeOfBlock.h - blockBorder, 
                    sizeOfBlock.w - blockBorder 
                );
            }
        }

    }


    function getComplexCoords(viewportComplex, canvasX, canvasY) {          
        xval = (canvasX/canvasRect.width * viewportComplex.w) - viewportComplex.w/2 + viewportComplex.centre.Re;
        yval = viewportComplex.h/2 - (canvasY/canvasRect.height * viewportComplex.h) - viewportComplex.centre.Im;
        return {Re: xval, Im: yval};
    }

    function getMouseCanvasPos(canvas, event) {
        var rect = canvas.getBoundingClientRect();
        x = event.clientX - rect.left - 2;
        y = event.clientY - rect.top - 2;
        return({ x: x, y: y });
    }




    function calcEscape(Cx, Cyi) {
        // (x + yi)(x + yi) + x + yi
        // => x2 + 2xyi - y2 + x + yi
        // => R = x2 - y2 + x
        // => I = 2xyi + yi

        var maxIterations = 255;
        var escapeValue = 6;
        var iteration = 0;

        var x = Cx;
        var yi = Cyi;

        while (x*x+yi*yi <= escapeValue && iteration < maxIterations) {
            new_x = x*x - yi*yi + Cx;
            yi = 2*x*yi + Cyi;
            x = new_x;
            iteration++;
        }
        return iteration;
    }


    function doMouseDown(event) {
        canvasImageCopy = ctxFract.getImageData(0, 0, canvasRect.width, canvasRect.height); 
        clickPos = getMouseCanvasPos(fractCanvas, event);
        clickCoords.x = clickPos.x;
        clickCoords.y = clickPos.y;
        console.log("down", clickCoords);
        plotCoords(clickCoords.x, clickCoords.y, 100);
    }


    function doMouseUp(event) {
        clickPos = getMouseCanvasPos(fractCanvas, event);
        console.log("up", clickPos);
        // zoomport.w = clickPos.complexPos.x - zoomport.centre.x;
        // zoomport.h = clickPos.complexPos.y - zoomport.centre.y;
        // plotViewport(zoomport);
        // draw(zoomport);
        clickCoords = {};
        ctxFract.putImageData(canvasImageCopy, 0, 0);
    }


    function doMouseMove(event) {
        mousePos = getMouseCanvasPos(fractCanvas, event);
        // Q: we need to store the mousedown position - but in what context/scope? 
        // It needs to be outside of the scope of this function - so how do we create that variable if not already initialised?
        
        clear(dashCanvas);
        plotCoords(mousePos.x, mousePos.y, 0);
        if (clickCoords.x) {    // we can assume mouse is down
            ctxFract.putImageData(canvasImageCopy, 0, 0);

            dx = Math.abs(mousePos.x - clickCoords.x);
            dy = Math.abs(mousePos.y - clickCoords.y);

            dn = Math.max(dx, dy);

            ctxFract.fillStyle = 'rgba(255,0,0, 0.5)';
            ctxFract.fillRect(  
                clickCoords.x - dn, 
                clickCoords.y - dn, 
                dn * 2,
                dn * 2,
            );


            plotCoords(clickCoords.x, clickCoords.y, 100);
            plotCoords(mousePos.x - clickCoords.x, mousePos.y - clickCoords.y, 100, 150);

        }
    }



    
    function plotCoords(x, y, yPos, xPos=0) {
        ctxDash.font = "12px Arial";
        ctxDash.fillText("x: " + x, xPos + 10, yPos+20);
        ctxDash.fillText("y: " + y, xPos + 10, yPos+40);
    }

    function plotViewport(viewport) {
        ctxDash.font = "12px Arial";
        ctxDash.fillText("viewport.w: " + viewport.w,10,80);
        ctxDash.fillText("viewport.h: " + viewport.h,10,100);
    }


    function clear(myCanvas) {
        context = myCanvas.getContext("2d");
        context.clearRect(0,0,myCanvas.width, myCanvas.height);
    }


    return {
        draw
    };
}










var fractCanvas = document.getElementById("fract");
var dashCanvas = document.getElementById("dashboard");

var fractal = Fractal();

var viewport = { w: 2, h: 2, centre: { x: -0.5, y:0.0 } };
var zoomport = { centre: { x: 0.0, y: 0.0 }};
fractal.draw(viewport);



function Fractal() {

    var ctx = fractCanvas.getContext("2d");
    var ctxDash = dashCanvas.getContext("2d");

    fractCanvas.addEventListener("mousedown", doMouseDown, false);
    fractCanvas.addEventListener("mouseup", doMouseUp, false);
    fractCanvas.addEventListener("mousemove", doMouseMove, false);

    function draw(viewPort) {

        var rect = fractCanvas.getBoundingClientRect();

        // amount of canvas that is used
        var viewWPix = rect.width - 2;
        var viewHPix = rect.height - 2;

        // number of rendered 'pixels'
        var numBlocks = { w: 500, h: 500};

        // calc size of block
        var sizeOfBlock = viewWPix / numBlocks.w;
        var blockBorder = 0;

        console.log('sizeOfBlock:' + sizeOfBlock);
        ctx.fillStyle = 'green';
        ctx.fillRect(0, 0, viewWPix, viewHPix);

        ctx.fillStyle = 'red';
        for (y = 0; y < numBlocks.h; y++) {
            for (x = 0; x < numBlocks.w; x++) {
                complexCoords = getComplexCoords(viewPort, x, y, numBlocks);
                iterations = calcEscape(complexCoords.rVal, complexCoords.iVal);
                r = 255 - iterations;
                g = 255 - iterations;
                b = 255 - iterations;
                ctx.fillStyle = 'rgb(' + r + ', ' + g + ', ' + b + ')';
                ctx.fillRect( (x * sizeOfBlock) + blockBorder, (y * sizeOfBlock) + blockBorder, sizeOfBlock - blockBorder, sizeOfBlock - blockBorder );
            }
        }

    }


    function getComplexCoords(viewPort, x, y, numBlocks) {
        xval = (x/numBlocks.w * viewport.w) - viewport.w/2 + viewport.centre.x;
        yval = viewport.h/2 - (y/numBlocks.h * viewport.h) - viewport.centre.y;
        return {rVal: xval, iVal: yval};
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
        clickPos = getMouseCanvasPos(fractCanvas, event);
        console.log("down", clickPos.complexPos);
        zoomport.centre = clickPos.complexPos;
    }


    function doMouseUp(event) {
        clickPos = getMouseCanvasPos(fractCanvas, event);
        console.log("up", clickPos.complexPos);
        zoomport.w = clickPos.complexPos.x - zoomport.centre.x;
        zoomport.h = clickPos.complexPos.y - zoomport.centre.y;
        plotViewport(zoomport);
        draw(zoomport);
    }


    function doMouseMove(event) {
        mousePos = getMouseCanvasPos(fractCanvas, event);
        clear(dashCanvas);
        plotCoords(mousePos.complexPos);
    }


    function getMouseCanvasPos(canvas, event) {
        var rect = canvas.getBoundingClientRect();
        x = event.clientX - rect.left - 2;
        y = event.clientY - rect.top - 2;
        complexPos = {
            x: (x/rect.width * viewport.w) - viewport.w/2 + viewport.centre.x,
            y: ((y/rect.height * viewport.h) - viewport.h/2 + viewport.centre.y),
        };
        return({ x: x, y: y, complexPos });
    }


    function plotCoords(complexPos) {
        ctxDash.font = "12px Arial";
        ctxDash.fillText("x: " + complexPos.x,10,20);
        ctxDash.fillText("y: " + complexPos.y,10,40);
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









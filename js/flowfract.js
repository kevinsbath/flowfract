
var fractCanvas = document.getElementById("fract");
var dashCanvas = document.getElementById("dashboard");
var paletteCanvas = document.getElementById("palette");

var fractal = Fractal();
var palette = Palette();
var fType = "Mandelbrot";

var viewportComplex = { w: 4, h: 4, centre: { Re: 0.0, Im: 0.0 } };
var CRe = CIm = 0.0;
var zoomportComplex = viewportComplex;
var clickCoords = {};
var canvasImageCopy;
fractal.draw(viewportComplex);

var imageLink = "https://lh3.googleusercontent.com/h8ZODB7tOmzILu8-jeaBjEvz92Z-izgBaPeE99oifh1EDdigS5NXGHYz3XE_zt_qoZDGPVv8zOjXRs9Vge_NMrG0HSQsGiw4nUP-3Hf2pYe4oAsSox0mNJCzwp-7CyY6BQpgNHMLZduKxy-2Bd0LbVT1JGsqy_3gcm2JKYoUmLPshBkIMHoftAOSBs0oLwujDFD5Uj33UnZWJKWwNllhKu6B2UYWIpA78YSk6Lsl6PIPYqNBjLNa4x9uqNqPBIBFW5x1GOPwQZH9QI1EG-Ha0QNUyxiPDMHJPLuWssE2muPFyiABxXAUSbhQsooy-XWrc8PfcBpvpILza7D59FlBHyYACfd8wHoFk_vMh--OFJ1noTRII8NUSb0TrSQYI8u3a4-Van-9EiaUF2ws1gGZYbzoLKyB8oyvPSh9ooGnHrl8N5vLooyArCY8Tr5oBW99oFjGD0Bss5PEBT4BoIMGyS4uJmVBFvTZ6TQrixnlULm1k73zOlu5SKpdHNOVKKRgAWZUkRd9ACgG6LndjMP3EqJ54b7yg9GPtRUuDoVI-Ks1Rbuuifj7MdLnLISjHKX51oCNpEfM-3g_Imm1U31LCqbXveZuyzR3NbQRTA7dY3z73V3L0LuX5uXqyhA237MG=w1198-h1596-no";

palette.loadImage(imageLink);

window.onkeyup = function(e) {
    var key = e.keyCode ? e.keyCode : e.which;
    console.log(key);
    if (key=='74') {    // j
        fType = "Julia";
        juliaviewportComplex = { w: 4, h: 4, centre: { Re: 0.0, Im: 0.0 } };
        fractal.draw(juliaviewportComplex);
    }

    if (key=="77") {    // m
        fType = "Mandelbrot";
        fractal.draw(viewportComplex);
    }


}

function Fractal() {

    var ctxFract = fractCanvas.getContext("2d");
    var ctxDash = dashCanvas.getContext("2d");


    var canvasRect = fractCanvas.getBoundingClientRect();

    fractCanvas.addEventListener("mousedown", doMouseDown, false);
    fractCanvas.addEventListener("mouseup", doMouseUp, false);
    fractCanvas.addEventListener("mousemove", doMouseMove, false);

    // amount of canvas that is used
    var viewWPix = canvasRect.width - 2;
    var viewHPix = canvasRect.height - 2;

    // number of rendered 'pixels'
    var numBlocks = { w: 800, h: 800};
    // calc size of block
    var sizeOfBlock = { w: viewWPix/numBlocks.w, h: viewHPix/numBlocks.h };
    var blockBorder = 0;

    function draw(viewportComplex) {
        console.log("f: draw");
        console.log('sizeOfBlock:' + sizeOfBlock);
        console.log(viewportComplex);
        ctxFract.fillStyle = 'green';
        ctxFract.fillRect(0, 0, viewWPix, viewHPix);

        row = 0;

        function nextRow() {
            if (row < numBlocks.h) {
                drawRow(viewportComplex, row);  
                row++;
            } else {
                clearInterval(intvNextRow);
            }
        }
        var intvNextRow = setInterval(nextRow,1);
    }

    function drawRow(viewportComplex,row) {

        for (col = 0; col < numBlocks.w; col++) {
            complexCoords = getComplexCoords(viewportComplex, col * sizeOfBlock.w, row * sizeOfBlock.h);

            if (fType == "Mandelbrot") {
                iterations = calcEscape(complexCoords.Re, complexCoords.Im).iterations;
            } else {
                iterations = calcEscapeJulia(complexCoords.Re, complexCoords.Im, CRe, CIm).iterations;
            }
            
            r = g = b = 255 - iterations;
            // g = 255 - iterations;
            // b = 255 - iterations;

            ctxFract.fillStyle = 'rgb(' + r + ', ' + g + ', ' + b + ')';
            ctxFract.fillRect(  
                (col * sizeOfBlock.w) + blockBorder, 
                (row * sizeOfBlock.h) + blockBorder, 
                sizeOfBlock.h - blockBorder, 
                sizeOfBlock.w - blockBorder 
            );
        }

    }


    function getComplexCoords(viewportComplex, canvasX, canvasY) {          
        xval = (canvasX/canvasRect.width * viewportComplex.w) - viewportComplex.w/2 + viewportComplex.centre.Re;
        viewportHeightIm = 0 - viewportComplex.h; // we reverse this to account for Imaginary numberline be opposite orientation to canvas coords
        yval = viewportComplex.centre.Im + (canvasY/canvasRect.height * viewportHeightIm) - (viewportHeightIm/2);
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

        var maxIterations = 512;
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
        return { iterations: iteration, escapeValue: escapeValue };
    }

    function calcEscapeJulia(Re, Im, CRe, CIm) {
        // (Re + Im)(Re + Im) + CRe + CIm
        // => Re2 + 2Re.Im - Im2 + CRe + CIm
        // => Re = Re2 - Im2 + CRe
        // => Im = 2Re.Im + CIm

        var maxIterations = 512;
        var escapeValue = 6;
        var iteration = 0;

        // var x = Cx;
        // var yi = Cyi;

        while (Re*Re+Im*Im <= escapeValue && iteration < maxIterations) {
            new_Re = Re*Re - Im*Im + CRe;   // we set a new_Re so we can use the Re value in following calc with its original value
            Im = 2*Re*Im + CIm;
            Re = new_Re;
            iteration++;
        }
        return { iterations: iteration, escapeValue: escapeValue };
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
        console.log("up", zoomportComplex);

        
        viewportComplex = zoomportComplex;
        draw(viewportComplex);

        clickCoords = {};
        //ctxFract.putImageData(canvasImageCopy, 0, 0);
    }


    function doMouseMove(event) {
        
        // Q: we need to store the mousedown position - but in what context/scope? 
        // It needs to be outside of the scope of this function - so how do we create that variable if not already initialised?
        
        clear(dashCanvas);
        mousePos = getMouseCanvasPos(fractCanvas, event);
        plotCoords(mousePos.x, mousePos.y, 0);

        mouseComplexPos = getComplexCoords(viewportComplex, mousePos.x,  mousePos.y);
        plotCoords(mouseComplexPos.Re, mouseComplexPos.Im, 0, 60);
        CRe = mouseComplexPos.Re;
        CIm = mouseComplexPos.Im;

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

            zoomCentre = getComplexCoords(viewportComplex, clickCoords.x, clickCoords.y);
            zoomW = viewportComplex.w * (dn * 2 / canvasRect.width);

            zoomportComplex = {
                w: zoomW,
                h: zoomW,
                centre: { Re: zoomCentre.Re, Im: zoomCentre.Im },
            }

            plotCoords(clickCoords.x, clickCoords.y, 100);
            plotCoords(mousePos.x - clickCoords.x, mousePos.y - clickCoords.y, 100, 150);

        } else {
            calc = calcEscape(mouseComplexPos.Re, mouseComplexPos.Im);
            plotCoords(calc.iterations, calc.escapeValue, 180);
        }
    }

    
    function plotCoords(x, y, yPos, xPos=0) {
        ctxDash.font = "12px Arial";
        ctxDash.fillText("x: " + x, xPos + 10, yPos+20);
        ctxDash.fillText("y: " + y, xPos + 10, yPos+40);
    }


    function plotViewport(viewport) {
        // ctxDash.font = "12px Arial";
        // ctxDash.fillText("viewport.w: " + viewport.w,10,80);
        // ctxDash.fillText("viewport.h: " + viewport.h,10,100);
    }


    function clear(myCanvas) {
        context = myCanvas.getContext("2d");
        context.clearRect(0,0,myCanvas.width, myCanvas.height);
    }


    return {
        draw
    };

}

function Palette() {
    var ctxPalette = paletteCanvas.getContext("2d");
    function loadImage(imageLink) {
        var img = new Image;
        img.onload = function(){
            ctxPalette.drawImage(img,0,0); // Or at whatever offset you like
        };
        img.src = imageLink;
    }

    return {
        loadImage
    }


}









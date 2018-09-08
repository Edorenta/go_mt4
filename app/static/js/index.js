"use strict";

//interface colors tracker
var clrs = {
    white : "rgb(255,255,255)",
    black : "rgb(0,0,0)",
    light_grey : "rgb(150,150,150)",
    dark_grey : "rgb(45,45,45)",
    cyan : "rgb(0,255,255)",
    magenta : "rgb(255,0,255)",
    orange : "rgb(211,140,0)",
    red : "rgb(255,0,0)",
    green : "rgb(0,180,0)",
    blue : "rgb(0,0,255)",
};

var price_dom = document.getElementById("price");

//homemade captcha
async function init_typewriter() {
    var tw1 = new TypeWriter("core", 70, "▌");
    var tw2 = new TypeWriter("cookie_policy", 20, "▌");
    await tw1.Type("Are you human? Please Click on the cookie.")
    await tw2.Type("By doing so you also agree to our cookie policy [GDPR compliant].")
    // await sleep(2500);
    // await tw2.Flush();
    // document.getElementById("cookie_policy").classList.add("hidden");
    // await tw1.Flush();
    // document.getElementById("core").classList.add("hidden");
}

// var generator = QuoteGen
//     .arithmetic(Math.PI * 2 / 25)
//     .map(Math.sin)
//     .add(QuoteGen.randomWalk())
//     .add(QuoteGen.arithmetic(0.005));  
// var stock.Close = generator(240);

var stock = new StockQuote();

//min max of array as .self function
Array.prototype.max = function() {
    return Math.max.apply(null, this);
};

Array.prototype.min = function() {
    return Math.min.apply(null, this);
};

// var element = document.getElementById('graph');
// var context = graph.getContext('2d');

//viewport size tracker
var win = {
    w : Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
    h : Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
};

var core_buffer;
var right_buffer;
var bot_buffer;

var p5set = {
  core : { x: 0, y : 0, w: (win.w * 1) , h: (win.h * 1) },
  bot : { x: 0, y : (win.h * 0.9), w: (win.w * 0.9) , h: (win.h * 0.1) },
  right : { x: (win.w * 0.9), y : 0, w: (win.w * 0.1) , h: (win.h * 0.9) }
}

var canvas;

//change canvas origin
function set_origin() {
    // core_buffer.translate(0, -p5set.core.h); //set bottom left as origin
    // scale(2);
    background(color(clrs.dark_grey));
    // stroke(color(clrs.black));
    // strokeWeight(1);
    // line(-win.w / 2, 0, win.w / 2, 0); //draw origin
    // line(0, -win.h / 2, 0, win.h / 2);
}

function setup() {
    // 800 x 400 (double win.w to make room for each "sub-canvas")
    createCanvas(win.w, win.h);
    frameRate(60);
    // Create both of your off-screen graphics buffers
    core_buffer = createGraphics(p5set.core.w, p5set.core.h);
    right_buffer = createGraphics(p5set.right.w, p5set.right.h);
    bot_buffer = createGraphics(p5set.bot.w, p5set.bot.h);
    // other
    set_origin();
    // init_typewriter();
    price_dom = document.getElementById("price")
}

function draw() {
    // Draw on your buffers however you like
    draw_core_buffer();
    draw_right_buffer();
    draw_bot_buffer();
    // Paint the off-screen buffers onto the main canvas
    image(core_buffer, p5set.core.x, p5set.core.y);
    // image(right_buffer, p5set.right.x, p5set.right.y);
    // image(bot_buffer, p5set.bot.x, p5set.bot.y);
}

function draw_core_buffer() {
    core_buffer
      .background(0, 0, 0);
      // .fill(255, 255, 255)
      // .textSize(32)
      // .text("This is the main buffer!", 50, 50);
    update_quote(core_buffer);
}

function draw_right_buffer() {
    right_buffer
      .background(0, 255, 0)
      // .fill(255, 255, 255)
      // .textSize(32)
      // .text("This is the right buffer!", 50, 50);
}

function draw_bot_buffer() {
    bot_buffer
      .background(0, 0, 255)
      // .fill(255, 255, 255)
      // .textSize(32)
      // .text("This is the bot buffer!", 50, 50);
}

var n;
var min;
var max;
var range;
var step_x;
var scalar;

function update_quote(buf){
    min = stock.Min();
    max = stock.Max();
    range = max - min;
    step_x = p5set.core.w/stock.periods;
    scalar = p5set.core.h/range;

    // // Return the x pixel for a graph point
    // function getXPixel(val) {
    //     return step_x * val;
    // }
    // // Return the y pixel for a graph point
    // function getYPixel(val) {
    //     return win.h - ((val - min) * scalar);
    // }
    // buf.beginShape();
    buf.stroke(0,255,0);
    for (let i = 0; i < stock.periods - 2; i++) {
        // buf.vertex(i*step_x, map(stock.Close[i], min, max, p5set.core.y, p5set.core.y + p5set.core.h)); //y_step is automatic
        // buf.line(p5set.core.w - i*step_x, (max - stock.Close[i])*scalar/2, p5set.core.w - (i - 1)*step_x, (max - stock.Close[i - 1])*scalar/2);
        var x1 = i*step_x;
        var y1 = (max - stock.Close[i])*scalar;
        var x2 = (i+1)*step_x;
        var y2 = (max - stock.Close[i+1])*scalar;
        console.log(x1, y1/*, x2, y2*/);
        // buf.line(i*step_x, (max - stock.Close[i])*scalar, (i+1)*step_x, (max - stock.Close[i+1])*scalar);
        // buf.line(x1, y1, x2, y2);
        // buf.line(-win.w/2, 0, win.w/2, 0);
        // buf.line(0, -win.h/2, 0, win.h/2);
        // buf.line(-win.w/2, -win.h/2, win.w/2, win.h/2);
        // buf.line(-win.w/2, win.h/2, win.w/2, -win.h/2);
        buf.line(-win.w/4, 0, win.w/4, 0);
        buf.line(0, -win.h/4, 0, win.h/4);
        buf.line(-win.w/4, -win.h/4, win.w/4, win.h/4);
        buf.line(-win.w/4, win.h/4, win.w/4, -win.h/4);
    }
    // buf.endShape();
    // context.moveTo(getXPixel(0), getYPixel(stock.Close[0]));
    // for(var i = 1; i < n; i ++) {
    //     context.lineTo(getXPixel(i), getYPixel(stock.Close[i]));
    // }
    // context.stroke();
    price_dom.innerHTML = stock.Close[0];
    noLoop();
    stock.Generate();
    // ops++;
}

// ops = 0;
// setInterval(function(){
//     console.log(ops, "per second");
//     ops = 0;
// }, 1000);
// update();

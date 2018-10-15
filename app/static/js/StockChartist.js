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
    green : "rgb(0,255,0)",
    dark_green : "rgb(0,80,0)",
    blue : "rgb(0,0,255)",
};

//viewport size tracker
var win;
var p5set;
var canvas;
var core_buffer;
var right_buffer;
var bot_buffer;
// // var price_dom = document.getElementById("price");
var stock;
var tw;
var prev_timestamp = null;
var fill_chart = true;

function dim_ui() {
    // console.log("resized!");
    win = {
        w : Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        h : Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
    };
    let right_w = 70; // Math.max(win.w / 9, 70);
    let bot_h = 30; // Math.max(win.h / 15, 30);
    p5set = {
        y_margin : Math.max(win.h / 20, 15),
        core : { x: 0, y : 0, w: (win.w - right_w) , h: (win.h - bot_h) },
        bot : { x: 0, y : (win.h - bot_h), w: (win.w - right_w), h: bot_h },
        right : { x: (win.w - right_w), y : 0, w: right_w , h: win.h }
        // banner : { x: }
    };
}

function rescale() {
    dim_ui();
    if (canvas) {
        resizeCanvas(win.w, win.h); background(clrs.black); // can also use resizeCanvas(w,h)
        init_buffers();
    }
    // if (core_buffer) {
    //  core_buffer = createGraphics()
    //  // core_buffer.width = p5set.core.w; core_buffer.canvas.style.width = p5set.core.w + ' px';
    //  // core_buffer.height = p5set.core.h; core_buffer.canvas.style.height = p5set.core.h + ' px';
    // }
    // if (right_buffer) {
    //  // right_buffer.width = p5set.right.w; right_buffer.canvas.style.width = p5set.right.w + ' px';
    //  // right_buffer.height = p5set.right.h; right_buffer.canvas.style.height = p5set.right.h + ' px';
    // }
    // if (bot_buffer) {
    //  // bot_buffer.width = p5set.bot.w; bot_buffer.canvas.style.width = p5set.bot.w + ' px';
    //  // bot_buffer.height = p5set.bot.h; bot_buffer.canvas.style.height = p5set.bot.h + ' px';
    // }
}
// window.onresize = function(event) {};
window.addEventListener('resize', () => rescale(), true);

//homemade captcha
// async function init_typewriter() {
//     var tw1 = new TypeWriter("core", 70, "▌");
//     var tw2 = new TypeWriter("cookie_policy", 20, "▌");
//     await tw1.Type("Are you human? Please Click on the cookie.")
//     await tw2.Type("By doing so you also agree to our cookie policy [GDPR compliant].")
    // await sleep(2500);
    // await tw2.Flush();
    // document.getElementById("cookie_policy").classList.add("hidden");
    // await tw1.Flush();
    // document.getElementById("core").classList.add("hidden");
// }

var chart = function(p5) {
    p5.setup = function() { //p5js ready() function
        // console.log(win);
        // p5js related init
        dim_ui();
        canvas = p5.createCanvas(win.w, win.h);
        p5.frameRate(30);
        p5.background(clrs.black);
        init_buffers();

        // other calls
        stock = new StockSimulator();
        tw = new TypeWriter("core", 45, "▌");

        stock.interval = 2000;
        stock.periods = 0;
        stock.Start();
        // tw.Loop(["This chart is a vertex based representation of a generated Stock price.",
        //       "Both the Stock quote generator and the chart are pretty simple objects.",
        //       "They actually fit in 50 liners class... Each.",
        //       "Oh, and this Typewriter too is pretty tiny. Explore the DOM and see for yourself!"]);
    }
    p5.draw = function() {
        //Draw the offscreen buffer to the screen with image()
        // cursor(CROSS);
        if (canvas) { 
            if (stock && stock.Timestamp != prev_timestamp) {
                // draw_core_buffer();
                // draw_right_buffer();
                // draw_bot_buffer();
                // update_quote();
                prev_timestamp = stock.Timestamp;
            }
            core_buffer.background(clrs.black);
            right_buffer.background(clrs.black);
            bot_buffer.background(clrs.black);
            update_quote();
            if (core_buffer) { p5.image(core_buffer, p5set.core.x, p5set.core.y); }
            if (right_buffer) { p5.image(right_buffer, p5set.right.x, p5set.right.y); }
            if (bot_buffer) { p5.image(bot_buffer, p5set.bot.x, p5set.bot.y); }
        }
    }
};

var p5chart = new p5(chart);

function init_buffers() {
    //delete buffers DOM leftovers
    if (core_buffer) { core_buffer.remove(); }
    if (right_buffer) { right_buffer.remove(); }
    if (bot_buffer) { bot_buffer.remove(); }
    // recreate buffers with new dimensions
    core_buffer = p5chart.createGraphics(p5set.core.w, p5set.core.h);
    right_buffer = p5chart.createGraphics(p5set.right.w, p5set.right.h);
    bot_buffer = p5chart.createGraphics(p5set.bot.w, p5set.bot.h);
    // set init colors
    fill_chart ? core_buffer.fill(clrs.dark_green) : core_buffer.noFill(); 
    core_buffer
        .stroke(clrs.green)
    right_buffer
        // .fill(0,255,0)
        // .stroke(0,255,0)
        // .textSize(14)
        // .textStyle(p5chart.BOLD)
        .textFont("Courier New")
}

function update_quote(){
    let min = stock.AskMin();
    let max = stock.AskMax();
    let range = max - min;
    let periods = stock.Ask.length;
    let step_x = p5set.core.w / (periods - 1);
    let scalar = (p5set.core.h - p5set.y_margin * 2) / range;

    core_buffer.
        beginShape();
    //fill if necessary
    if (fill_chart) {
        core_buffer
            .vertex(0, p5set.core.h)
            .vertex(p5set.core.w, p5set.core.h)
    }
    for (let i = 0; i < periods; i++) {
        core_buffer.vertex(p5set.core.w - i * step_x, p5chart.map(stock.Ask[i], max, min, p5set.core.y + p5set.y_margin, p5set.core.y + p5set.core.h - p5set.y_margin)); //y_step is automatic
        // core_buffer.line(p5set.core.w - i*step_x, (max - stock.Ask[i])*scalar, p5set.core.w - (i - 1)*step_x, (max - stock.Ask[i - 1])*scalar);
    }
    core_buffer
        .endShape()
        // .noFill()
    right_buffer
        // min / max display >> white
        .stroke(clrs.white)
        .line(0, p5set.y_margin, 8, p5set.y_margin) // linechart
        .line(0, p5set.y_margin + range*scalar - 2, 8, p5set.y_margin + range*scalar - 2) // linechart
        .noStroke()
        .fill(clrs.white)
        .textSize(12)
        .text(max, 13, p5set.y_margin + 3)
        .text(min, 13, p5set.y_margin + range*scalar + 3)
        // Close[0] display (variation color)        
        .fill(stock.Ask[0] > stock.Ask[1] ? "#00ff00" : "#ff0000")
        .triangle(12, p5set.y_margin + (max - stock.Ask[0])*scalar - 8, 12, p5set.y_margin + (max - stock.Ask[0])*scalar + 8, 0, p5set.y_margin + (max - stock.Ask[0])*scalar) // linechart
        .rect(12, p5set.y_margin + (max - stock.Ask[0])*scalar - 8, 60, 16)
        .textSize(14)
        .fill(clrs.black)
        // .stroke(clrs.black)
        .textStyle(p5chart.BOLD)
        .text(stock.Ask[0], 13, p5set.y_margin + (max - stock.Ask[0])*scalar + 5)
    //pointer information
    if ((p5chart.mouseX > p5set.core.x && p5chart.mouseX < (p5set.core.x + p5set.core.w))
        && (p5chart.mouseY > p5set.core.y && p5chart.mouseY < (p5set.core.y + p5set.core.h))) {
        // mouse is inside core_buffer >> draw info box
        // core_buffer.stroke(clrs.white);
        // console.log("mouseX:", mouseX, "mouseY:", mouseY);
        p5chart.cursor(p5chart.CROSS);
        core_buffer
            .stroke(clrs.white)
            .line(0, p5chart.mouseY, p5set.core.w, p5chart.mouseY)
            .line(p5chart.mouseX, 0, p5chart.mouseX, p5set.core.h)
            .stroke(clrs.green)
        right_buffer
            .stroke(clrs.white)
            .line(0, p5chart.mouseY, 8, p5chart.mouseY) // linechart
            .noStroke()
            .textSize(12)
            .textStyle(p5chart.NORMAL)
            .fill(clrs.white)
            .text(p5chart.map(p5chart.mouseY + 3, 0, p5set.core.h, max + p5set.y_margin/scalar, min - p5set.y_margin/scalar), 13, p5chart.mouseY + 3)
    } else {
        // cursor(ARROW);
    }
        // .stroke(stock.Ask[0] > stock.Ask[1] ? "#00ff00" : "#ff0000")
        // .fill(stock.Ask[0] > stock.Ask[1] ? "#00ff00" : "#ff0000")
    // .text(stock.Ask[0], 10, stock.Ask[0]*scalar)
    // price_dom.innerHTML = stock.Ask[0];
    // noLoop();
    // stock.Generate();
}

"use strict";

var stock;

!function() { //self invoking function
	stock = new StockSimulator();
	stock.interval = 2000;
	stock.periods = 0;
	stock.Start();
}();

class StockChartist() {
	constructor(Tick, colors) {
		// var price_dom = document.getElementById("price");
		//interface colors tracker
		this.clrs = {
			ui : colors.ui || "rgb(255,255,255)",			//white
			back : colors.back || "rgb(0,0,0)",				//black
			range : colors.range || "rgb(211,140,0)",		//orange
			down_stroke : colors.down || "rgb(255,0,0)",	//red
			up_stroke : colors.up || "rgb(0,255,0)", 		//green
			down_fil : colors.down_fill || "rgb(80,0,0)", 	//dark red
			up_fill : colors.up_fill || "rgb(0,80,0)"		//dark green
		};
		this.canvas = null;
		this.core_buffer = null;
		this.right_buffer = null;
		this.bot_buffer = null;
		this.win = {};
		this.set = {};
		this.series = { Ask : [], Bid : [], Timestamp : [] };
		this.Tick = Tick; // { Ask: ..., Bid: ..., Timestamp: ... }
		this.min = Infinity;
		this.max = -Infinity;
		this.prev_timestamp = null;
		this.periods = 0;
		this.step_x = 0;
		this.scalar = 0;
		// if (typeof(Tick.Ask) === "undefined" || typeof(Tick.Bid) === "undefined" || typeof(Tick.Timestamp) === "undefined") return null;
		this.p5 = new p5(this.p5_mapping); //creating p5 instance answering to p5_maping functions
		// window.onresize = function(event) {};
		window.addEventListener('resize', () => this.rescale(), true);
	}
	get_size() {
		this.win = {
			w : Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
			h : Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
		};
		let right_w = 70; // Math.max(win.w / 9, 70);
		let bot_h = 30; // Math.max(win.h / 15, 30);
		this.set = {
			fill_chart : true,
			y_margin : Math.max(this.win.h / 20, 15),
			core : { x: 0, y : 0, w: (this.win.w - right_w) , h: (this.win.h - bot_h) },
			bot : { x: 0, y : (this.win.h - bot_h), w: (this.win.w - right_w), h: bot_h },
			right : { x: (this.win.w - right_w), y : 0, w: right_w , h: this.win.h }
			// banner : { x: }
		};
	}
	setup() {
		// console.log(win);
		// p5js related init
		this.get_size();
		this.canvas = p5.createCanvas(this.win.w, this.win.h);
		this.p5.frameRate(30);
		this.p5.background(this.clrs.back);
		this.init_buffers();
	}
	draw() {
		//Draw the offscreen buffer to the screen with image()
		// this.p5.cursor(CROSS);
		if (this.canvas) { 
			if (this.Tick && this.Tick.Timestamp != this.prev_timestamp) {
				// draw_core_buffer();
				// draw_right_buffer();
				// draw_bot_buffer();
				// update_quote();
				this.prev_timestamp = this.Tick.Timestamp;
			}
			this.core_buffer.background(this.clrs.back);
			this.right_buffer.background(this.clrs.back);
			this.bot_buffer.background(this.clrs.back);
			this.update_quote();
			if (this.core_buffer) { this.p5.image(this.core_buffer, this.set.core.x, this.set.core.y); }
			if (this.right_buffer) { this.p5.image(this.right_buffer, this.set.right.x, this.set.right.y); }
			if (this.bot_buffer) { this.p5.image(this.bot_buffer, this.set.bot.x, this.set.bot.y); }
		}
	}
	p5_mapping(p) {
		p.setup = function() { //p5js ready() function
			this.setup();
		}
		p.draw = function() {
			this.draw();
		}
	}
	rescale() {
		this.get_size();
		if (this.canvas) {
			this.p5.resizeCanvas(this.win.w, this.win.h); this.p5.background(this.clrs.back); // can also use resizeCanvas(w,h)
			this.init_buffers();
		}
	}
	range() {
		return (this.max - this.min);
	}
	init_buffers() {
		//delete buffers DOM leftovers
		if (this.core_buffer) { this.core_buffer.remove(); }
		if (this.right_buffer) { this.right_buffer.remove(); }
		if (this.bot_buffer) { this.bot_buffer.remove(); }
		// recreate buffers with new dimensions
		this.core_buffer = this.p5.createGraphics(this.set.core.w, this.set.core.h);
		this.right_buffer = this.p5.createGraphics(this.set.right.w, this.set.right.h);
		this.bot_buffer = this.p5.createGraphics(this.set.bot.w, this.set.bot.h);
		// this.set init colors
		this.set.fill_chart ? this.core_buffer.fill(this.clrs.up_fill) : this.core_buffer.noFill(); 
		this.core_buffer
			.stroke(this.clrs.up)
		this.right_buffer
			// .fill(0,255,0)
			// .stroke(0,255,0)
			// .textSize(14)
			// .textStyle(this.p5.BOLD)
			.textFont("Courier New")
	}
	update_quote(){
		// let min = this.AskMin();
		// let max = this.AskMax();
		// let range = max - min;
		//concatenate historical data with the incoming one:
	    this.series.Ask.unshift(this.Tick.Ask); // vs push()
	    this.series.Bid.unshift(this.Tick.Ask);
	    this.series.Timestamp.unshift(this.Tick.Timestamp);
	    if (this.periods && (this.Ask.length > this.periods)) { // this needs to be locked not to break RAM
	    	this.Ask.pop(); // vs shift()
	    	this.Bid.pop();
	    }
		this.periods = this.series.Ask.length;
		this.step_x = this.set.core.w / (periods - 1);
		this.scalar = (this.set.core.h - this.set.y_margin * 2) / this.range();
		this.core_buffer.
			beginShape();
		//fill if necessary
		if (this.set.fill_chart) {
			this.core_buffer
				.vertex(0, this.set.core.h)
				.vertex(set.core.w, this.set.core.h)
		}
		for (let i = 0; i < periods; i++) {
			this.core_buffer.vertex(this.set.core.w - i * this.step_x, this.p5.map(this.series.Ask[i], this.max, this.min, this.set.core.y + this.set.y_margin, this.set.core.y + this.set.core.h - this.set.y_margin)); //y_step is automatic
			// core_buffer.line(set.core.w - i*step_x, (max - stock.Ask[i])*scalar, this.set.core.w - (i - 1)*step_x, (max - stock.Ask[i - 1])*scalar);
		}
		this.core_buffer
			.endShape()
			// .noFill()
		this.right_buffer
			// min / max display >> white
			.stroke(this.clrs.ui)
			.line(0, this.set.y_margin, 8, this.set.y_margin) // linechart
			.line(0, this.set.y_margin + this.range*this.scalar - 2, 8, this.set.y_margin + this.range*this.scalar - 2) // linechart
			.noStroke()
			.fill(this.clrs.ui)
			.textSize(12)
			.text(this.max, 13, this.set.y_margin + 3)
			.text(this.min, 13, this.set.y_margin + this.range*this.scalar + 3)
			// Close[0] display (variation color)        
			.fill(this.series.Ask[0] > this.series.Ask[1] ? "#00ff00" : "#ff0000") //went up?
			.triangle(12, this.set.y_margin + (this.max - this.Tick.Ask)*this.scalar - 8, 12, this.set.y_margin + (max - stock.Ask[0])*scalar + 8, 0, this.set.y_margin + (max - stock.Ask[0])*scalar) // linechart
			.rect(12, this.set.y_margin + (this.max - this.Tick.Ask)*this.scalar - 8, 60, 16)
			.textSize(14)
			.fill(this.clrs.back)
			// .stroke(clrs.black)
			.textStyle(this.p5.BOLD)
			.text(this.Tick.Ask, 13, this.set.y_margin + (this.max - this.Tick.Ask)*this.scalar + 5)
		//pointer information
		if ((this.p5.mouseX > this.set.core.x && this.p5.mouseX < (this.set.core.x + this.set.core.w))
			&& (this.p5.mouseY > this.set.core.y && this.p5.mouseY < (this.set.core.y + this.set.core.h))) {
			// mouse is inside core_buffer >> draw info box
			// core_buffer.stroke(clrs.white);
			// console.log("mouseX:", mouseX, "mouseY:", mouseY);
			this.p5.cursor(this.p5.CROSS);
			core_buffer
				.stroke(this.clrs.ui)
				.line(0, this.p5.mouseY, this.set.core.w, this.p5.mouseY)
				.line(this.p5.mouseX, 0, this.p5.mouseX, this.set.core.h)
				.stroke(this.clrs.up)
			this.right_buffer
				.stroke(this.clrs.ui)
				.line(0, this.p5.mouseY, 8, this.p5.mouseY) // linechart
				.noStroke()
				.textSize(12)
				.textStyle(this.p5.NORMAL)
				.fill(this.clrs.ui)
				.text(this.p5.map(this.p5.mouseY + 3, 0, this.set.core.h, max + this.set.y_margin/scalar, min - this.set.y_margin/scalar), 13, this.p5.mouseY + 3)
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
}

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

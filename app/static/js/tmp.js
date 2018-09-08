//viewport size tracker
var win = {
	w : Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
	h : Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
};
var p5set = {
	core : { x: 0, y : 25, w: (win.w - 70) , h: (win.h  - 80) },
	bot : { x: 0, y : (win.h - 30), w: (win.w - 70), h: 30 },
	right : { x: (win.w - 70), y : 0, w: 70 , h: win.h }
};

class StockQuote {
	constructor(start, volatility, periods, trend, strength) {
	this.name = "Random Stock Ltd."; // random stock name would be fun, not time atm
	this.start = start || 100;
	this.Close = [];
	this.Close[0] = start || 100;
	this.volatility = volatility || 1.0; // stock var
	this.periods = periods || 500;
	this.trend = trend || 1; // 1/0/-1 = up/neutral/down
	this.strength = strength || 1;
	// while (this.Close.length < this.periods) {
	for (let i = 1; i < this.periods; i++) {
		this.Generate();
	}
	// console.log(this);
	}
	Generate() {
	let r1 = Math.random() * 2 - 1; // generate number, 0 <= x < 1.0
	let r2 = Math.random() * 2 - 1;
	let new_price = this.Close[0] * (1 + ((this.volatility/100) * r1) + ((this.trend * (this.strength/100)) * r2));
		this.Close.unshift(Math.round(100 * new_price) / 100); // vs push()
		if (this.Close.length > this.periods) {
			this.Close.pop(); // vs shift()
		}
	}
	Max() {
	  return Math.max.apply(null, this.Close);
	}
	Min() {
	  return Math.min.apply(null, this.Close);
	}
}

var core_buffer;
var right_buffer;
var bot_buffer;
// var price_dom = document.getElementById("price");
var stock = new StockQuote();

function setup(){
	// console.log(win);
	createCanvas(win.w, win.h);
	frameRate(2);
	core_buffer = createGraphics(p5set.core.w, p5set.core.h);
	right_buffer = createGraphics(p5set.right.w, p5set.right.h);
	bot_buffer = createGraphics(p5set.bot.w, p5set.bot.h);
	background(0,0,0);
	core_buffer
		.noFill() // no fill under the price chart
		.stroke(0,255,0)
	right_buffer
		// .fill(0,255,0)
		.stroke(0,255,0)
		// .textSize(14)
		.textStyle(BOLD)
		.textFont("Courier New")
}

function draw(){
	//Draw the offscreen buffer to the screen with image()
	draw_core_buffer();
	draw_right_buffer();
	draw_bot_buffer();
	update_quote();
	image(core_buffer, p5set.core.x, p5set.core.y);
	image(right_buffer, p5set.right.x, p5set.right.y);
	image(bot_buffer, p5set.bot.x, p5set.bot.y);
}

function draw_core_buffer() {
	core_buffer
		.background(0, 0, 0)
}

function draw_right_buffer() {
	right_buffer
		.background(25, 25, 25)
}

function draw_bot_buffer() {
	bot_buffer
		.background(25, 25, 25)
}

function update_quote(){
	let min = stock.Min();
	let max = stock.Max();
	let range = max - min;
	let step_x = p5set.core.w/stock.periods;
	let scalar = p5set.core.h/range;

	core_buffer.beginShape();
	for (let i = 0; i < stock.periods - 2; i++) {
		core_buffer.vertex(p5set.core.w - i*step_x, map(stock.Close[i], max, min, 0, p5set.core.h)); //y_step is automatic
		// core_buffer.line(p5set.core.w - i*step_x, (max - stock.Close[i])*scalar, p5set.core.w - (i - 1)*step_x, (max - stock.Close[i - 1])*scalar);
	}
	core_buffer.endShape();
	right_buffer
		// .line(0, (max - stock.Close[0])*scalar - 2, 10, (max - stock.Close[0])*scalar - 2) // linechart
		.fill(stock.Close[0] > stock.Close[1] ? "#00ff00" : "#ff0000")
		.textSize(14)
		.text(stock.Close[0], 20, 25 + (max - stock.Close[0])*scalar + 4)
		// .stroke(stock.Close[0] > stock.Close[1] ? "#00ff00" : "#ff0000")
		.triangle(12, 25 + (max - stock.Close[0])*scalar - 6, 12, 25 + (max - stock.Close[0])*scalar + 6, 0, 25 + (max - stock.Close[0])*scalar) // linechart
		.stroke(255,255,255)
		.line(0, 25, 10, 25) // linechart
		.line(0, 25 + range*scalar - 2, 10, 25 + range*scalar - 2) // linechart
		.noStroke()
		.fill(stock.Close[0] > stock.Close[1] ? "#00ff00" : "#ff0000")
		.fill(255,255,255)
		.textSize(12)
		// .fill(255,255,255)
		.text(max, 20, 25 + 4)
		.text(min, 20, 25 + range*scalar + 4)
  	// .text(stock.Close[0], 10, stock.Close[0]*scalar)
	// price_dom.innerHTML = stock.Close[0];
	// noLoop();
	stock.Generate();
}

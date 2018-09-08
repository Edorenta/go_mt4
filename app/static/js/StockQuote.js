"use strict";

class StockQuote {
	constructor(start, volatility, periods, trend, strength) {
		this.name = "Random Stock Ltd."; // random stock name would be fun, not time atm
		this.start = start || 100;
		this.Close = [];
		this.Close[0] = start || 100;
		this.volatility = volatility || 1.0; // stock var
		this.periods = periods || 200;
		this.trend = trend || 1; // 1/0/-1 = up/neutral/down
		this.strength = strength || 1;
		// while (this.Close.length < this.periods) {
		for (let i = 1; i < this.periods; i++) {
			this.Generate();
		}
		console.log(this);
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

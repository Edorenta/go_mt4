/*
 * StockSimulator is a temporal series emulator
 * it is designed to be light, self-sufficient and fast
 * it has no dependency
 * Copyright @ Paul de Renty (Edorenta) - 2018 
 */

"use strict";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class StockSimulator {
	constructor(inception_mid, spread, inception_epoch, volatility, periods, interval, trend, strength) {
		this.name = "Random Stock Ltd."; // random stock name would be fun, not time atm
		this.inception_mid = inception_mid || 100;
		this.spread = spread ? spread : 1.0;
		this.inception_epoch = inception_epoch || 1261440000;
		this.Timestamp = inception_epoch || 1261440000;
		this.interval = interval || 400;
		this.Ask = [];
		this.Bid = [];
		this.Ask[0] = (inception_mid && spread) ? inception_mid + spread / 2 : 100.5; //mid_price of 100
		this.Bid[0] = (inception_mid && spread) ? inception_mid - spread / 2 : 99.5;
		this.volatility = volatility || 1.0; // stock var
		this.periods = periods || 200;
		this.trend = trend || 1; // 1/0/-1 = up/neutral/down
		this.strength = strength || 1;
		this.Tick = {};
		// while (this.Ask.length < this.periods) {
		for (let i = 1; i < this.periods; i++) {
			this.NextQuote();
		}
		// this.running = true;
		// this.Generate(interval);
		// console.log(this);
	}
	NextQuote() {
		let r1 = Math.random() * 2 - 1; // generate number, 0 <= x < 1.0
		let r2 = Math.random() * 2 - 1;
		let move = (((this.volatility/100) * r1) + ((this.trend * (this.strength/100)) * r2)) * this.Mid(0);
	    this.Ask.unshift(Math.round(100 * (this.Ask[0] + move)) / 100); // vs push()
	    this.Bid.unshift(Math.round(100 * (this.Bid[0] + move)) / 100); // vs push()
	    this.Timestamp++;
	    if (this.periods && (this.Ask.length > this.periods)) {
	    	this.Ask.pop(); // vs shift()
	    	this.Bid.pop();
	    }
	    this.Tick = { Ask : this.Ask[0], Bid : this.Bid[0], Timestamp : this.Timestamp };
	}
	Stop() { this.running = false; }
	Start() { this.running = true; this.Generate(); }
	Reset() {
		this.Timestamp = this.inception_epoch;
		this.Ask = [];
		this.Bid = [];
		this.Ask[0] = this.inception_mid + this.spread / 2;
		this.Bid[0] = this.inception_mid - this.spread / 2;
		for (let i = 1; i < this.periods; i++) {
			this.NextQuote();
		}
	}
	Mid(i) { return (i > this.Ask.length ? -1 : ((this.Ask[i] + this.Bid[i]) / 2)); }
	AskMax() { return (Math.max.apply(null, this.Ask)); }
	AskMin() { return (Math.min.apply(null, this.Ask)); }
	BidMax() { return (Math.max.apply(null, this.Bid)); }
	BidMin() { return (Math.min.apply(null, this.Bid)); }
	// Hour() { return ((Math.floor(this.Timestamp / 3600)) % 24); }
	// Day() { return (Math.floor((this.Timestamp / 3600) / 24)); }
	// Minute() { return (this.Timestamp % 3600); }
	// Sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
	async Generate() {
		while (this.running) {
			await sleep(this.interval);
			await this.NextQuote();
		}
	}
}

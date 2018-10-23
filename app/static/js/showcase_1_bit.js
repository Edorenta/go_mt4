"use strict";

var scan;
var img = new Image();
var el_id = "p5_1_bit";
var win = [];

class Scan {
	constructor(p) {
		this.p = p;
		this.x = 0;
		this.y = 0;
		this.shift = 1*p.pixelDensity();
		// this.r = this.shift;
		this.p.noStroke();
		this.state = 0; //contour state
		this.step = 4*p.pixelDensity();
	}  
  	Update() {
		//HORIZONTAL REFRESH
		if ((this.x + this.shift) > win.w) {
			this.state == 0 ? (this.y += this.shift) : (this.y += this.shift*(this.step));
			this.x = 0;
		} else {
			this.x += this.shift;
		}
		if (this.y >= img.buffer.height) {
			this.state++;
			if (!(this.state == (this.step + 1))) {
				this.y = 0 + this.shift*this.state;
				this.x = 0;
			}
		}
		//VERTICAL REFRESH
		// if ((this.y + this.shift) > height) {
		// 	this.x += this.shift;
		// 	this.y = 0;
		// } else {
		// 	this.y += this.shift;
		// }
		// if (this.x >= img.buffer.width) {
		// 	this.done = true;
		// }
		// this.x = this.p.constrain(this.x, 0, this.p.windowWidth);
		// this.y = this.p.constrain(this.y, 0, this.p.windowHeight);
	}
	Unveil(n) {
		// this.p.noStroke();
		let iter = 0;
		let col = null;
		let r,g,b,a;
		while (iter < n && !(this.state == (this.step + 1))) {
			let px = Math.floor(this.x);
			let py = Math.floor(this.y);
			[r,g,b,a] = GetPixRGBA(img.buffer, px, py);
			if (this.state == 0) { [r,g,b] = [0,0,0]; }
			// console.log([r,g,b,a]);
			if (a == 255) {
				this.p.stroke(r, g, b, a);
				this.p.point(this.x, this.y);// this.p.ellipse(this.x, this.y, this.r, this.r);
				iter++;
			}
			this.Update();
		}
	}
}

var s = function(p) {
	img.src = "static/assets/images/1_bit_portrait.png";
	//console.log(img.width, img_b64.width);
	img.aspect_ratio = img.width/img.height || 1;
	img.loaded = false;
	win.w = document.getElementById(el_id).parentElement.clientWidth;
	win.h = document.getElementById(el_id).parentElement.clientHeight;
	var win_aspect_ratio = win.w/win.h;
	var ratio;
	img.buffer = p.createGraphics(win.w, win.h);
	img.buffer.clear();

	p.setup = function() {
		p.createCanvas(win.w, win.h);
		// p.createCanvas(p.windowWidth, p.windowHeight);
		p.frameRate(30);
		p.clear();
		img.p5 = p.loadImage(img.src,
		function(i) {
			// console.log('ok');
			p.UpdateImage();
		},
		function(i) {
		// console.log("profile picture not loaded");
		});
		p.pixelDensity(1);
		p.noLoop();
	};
	p.UpdateImage = function() {
		p.clear();
		ratio = win_aspect_ratio/img.aspect_ratio;
		if (ratio > 1) {
			//p.translate(p.windowWidth/2 - (p.windowWidth/ratio)/2, 0);
			img.buffer.image(img.p5, win.w/2 - (win.w/ratio)/2, 0, win.w/ratio, win.h);  
		} else {
			//p.translate(0, p.windowHeight/2 - (p.windowHeight/ratio)/2);
			img.buffer.image(img.p5, 0, win.h/2 - (win.h*ratio)/2, win.w, win.h*ratio);
		}
		img.buffer.loadPixels();
		scan = new Scan(p);
		img.loaded = true;
		p.loop();//CHANGE
	}
	p.windowResized = function() {
		win.w = document.getElementById(el_id).parentElement.clientWidth;
		win.h = document.getElementById(el_id).parentElement.clientHeight;
		p.resizeCanvas(win.w, win.h);
		p.redraw();
	}
	p.draw = function() {
		if (img.loaded && scan != undefined) {
			scan.Unveil(win.w);
		}
	};
};

!function(){ DocReady(init) }();

function init_showcase_1_bit() {
	var p5_1 = new p5(s, document.getElementById(el_id));	
}

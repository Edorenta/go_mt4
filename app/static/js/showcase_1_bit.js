"use strict";

var _env = {
	win : [],
	img : new Image(),
	scan : null,
	el_id : "p5_1_bit"
}

class Scan {
	constructor() {
		this.x = 0;
		this.y = 0;
		this.shift = 1*_env.p.pixelDensity();
		// this.r = this.shift;
		_env.p.noStroke();
		this.state = 0; //contour state
		this.step = 3*_env.p.pixelDensity();
	}
	Reinit() {
		this.x = 0;
		this.y = 0;
		this.shift = 1*_env.p.pixelDensity();
		_env.p.noStroke();
		this.state = 0; //contour state
		this.step = 3*_env.p.pixelDensity();
	}
  	Update() {
		//HORIZONTAL REFRESH
		if ((this.x + this.shift) > _env.win.w) {
			this.state == 0 ? (this.y += this.shift) : (this.y += this.shift*(this.step));
			this.x = 0;
		} else {
			this.x += this.shift;
		}
		if (this.y >= _env.img.buffer.height) {
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
		// this.x = _env.p.constrain(this.x, 0, _env.p.windowWidth);
		// this.y = _env.p.constrain(this.y, 0, _env.p.windowHeight);
	}
	Unveil(n) {
		// _env.p.noStroke();
		let iter = 0;
		let col = null;
		let r,g,b,a;
		while (iter < n && !(this.state == (this.step + 1))) {
			let px = Math.floor(this.x);
			let py = Math.floor(this.y);
			[r,g,b,a] = GetPixRGBA(_env.img.buffer, px, py);
			if (this.state == 0) { [r,g,b] = [0,0,0]; }
			// console.log([r,g,b,a]);
			if (a == 255) {
				_env.p.stroke(r, g, b, a);
				_env.p.point(this.x, this.y);// _env.p.ellipse(this.x, this.y, this.r, this.r);
				iter++;
			}
			this.Update();
		}
		if (this.state == (this.step + 1)) {
			_env.p.noLoop();
		}
	}
}

var s = function(p) {
	_env.p = p;
	_env.el_id = "p5_1_bit";
	_env.img.src = img_src;
	// img.src = "https://image.ibb.co/m4a1RL/image-ditherlicious.png";
	//console.log(_env.img.width, img_b64.width);
	_env.img.aspect_ratio = _env.img.width/_env.img.height || 1;
	_env.img.loaded = false;
	_env.win = {
		w : document.getElementById(_env.el_id).parentElement.clientWidth,
		h : document.getElementById(_env.el_id).parentElement.clientHeight
	}
	_env.win.aspect_ratio = _env.win.w/_env.win.h;
	_env.img.buffer = p.createGraphics(_env.win.w, _env.win.h);
	_env.img.buffer.clear();

	p.setup = function() {
		p.createCanvas(_env.win.w, _env.win.h);
		// p.createCanvas(p.windowWidth, p.windowHeight);
		p.frameRate(30);
		p.clear();
		_env.img.p5 = p.loadImage(_env.img.src,
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
		let ratio = _env.win.aspect_ratio/_env.img.aspect_ratio;
		if (ratio > 1) {
			//p.translate(p.windowWidth/2 - (p.windowWidth/ratio)/2, 0);
			_env.img.buffer.image(_env.img.p5, _env.win.w/2 - (_env.win.w/ratio)/2, 0, _env.win.w/ratio, _env.win.h);  
		} else {
			//p.translate(0, p.windowHeight/2 - (p.windowHeight/ratio)/2);
			_env.img.buffer.image(_env.img.p5, 0, _env.win.h/2 - (_env.win.h*ratio)/2, _env.win.w, _env.win.h*ratio);
		}
		_env.img.buffer.loadPixels();
		_env.scan = new Scan();
		_env.img.loaded = true;
		p.loop();//CHANGE
	}
	p.windowResized = function() {
		_env.win = {
			w : document.getElementById(_env.el_id).parentElement.clientWidth,
			h : document.getElementById(_env.el_id).parentElement.clientHeight
		}
		// win = {
		// 	w : Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
		// 	h : Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
		// };
		p.resizeCanvas(_env.win.w, _env.win.h);
		p.clear();
		_env.win.aspect_ratio = _env.win.w/_env.win.h;
		_env.img.buffer.remove();
		_env.img.buffer = p.createGraphics(_env.win.w, _env.win.h);
		p.UpdateImage();
		_env.img.buffer.clear();
		_env.scan.Reinit();
		p.draw();
	}
	p.draw = function() {
		if (_env.img.loaded && _env.scan != undefined) {
			_env.scan.Unveil(_env.win.w*4);
		}
	};
};

// !function(){ DocReady(init_showcase_1_bit) }();

// function init_showcase_1_bit() {
// 	var p5_1 = new p5(s, document.getElementById(_env.el_id));	
// }

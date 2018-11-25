"use strict";

var _env = {
	p : null,							// p5js instance
	id : "showcase_snake",				// game name
	el_id : "p5_snake",					// DOM game canvas container id
	overlay_id : "_overlay",			// DOM overlay id
	score_el_id : "_score",				// DOM score container id
	fps_el_id : "_fps",					// DOM fps container id
	game_over_el_id : "_game_over",		// DOM game_over container id
	canvas_el : null,					// DOM canvas pointer
	score_el : null,					// DOM score container pointer
	fps_el : null,						// DOM fps container pointer
	game_over_el : null,				// DOM game_over container pointer
	win : {},							// client window obj
	tile : {},							// game board tile obj
	board : {},							// game board obj
	boom : [],							// game explosions
	snake : {},							// game snake obj
	apple : {},							// game apple obj
	score : 0,							// game score
	fps : 30,							// game fps
};

class Explosion {
	constructor(i,x,y) {
		this.pc = [];
		(i && i > 10) ? 0 : i = 100;
		while(i--) {
			this.pc.push({
				color: _env.p.color(_env.p.color('hsl(' + Math.floor(Math.random()*349) + ', 100%, 50%)')),
				pos: _env.p.createVector(x, y),
				vel: p5.Vector.fromAngle(Math.random()*(2*_env.p.PI)).mult(Math.random()*10),
				size: Math.random()*_env.tile.full
			});
		}
	}
	Update() {
		for(let i = 0; i < this.pc.length; i++) {
			this.pc[i].pos.add(this.pc[i].vel);
			this.pc[i].size*=0.92;
			if(this.pc[i].size > 3) {
				_env.p.stroke(this.pc[i].color);
				_env.p.strokeWeight(this.pc[i].size);
				_env.p.point(this.pc[i].pos.x, this.pc[i].pos.y);
			} else {
				this.pc.splice(i, 1);
			}
		}
		if (this.pc.length == 0) {
			for (var i = _env.boom.length - 1; i >= 0; i--) {
			    if (_env.boom[i] == this) {
					_env.boom.splice(i,1);
			        break;
			    }
			}
		}
	}
}

class Snake {
	constructor(head_x, head_y, tail_len, speed, direction) {
		let factor = 40 / 40; // _env.p.frameRate(); //in case fps isn't as high as expected
		this.frame = 0;
		this.speed = speed || (2.5/factor); // frames to move
		this.head = {
			x : head_x || Math.round(_env.board.w/2),
			y : head_y || Math.round(_env.board.h/2)
		}
		this.tail = [];
		this.len = 0; // this.tail.length
		this.dir = direction || Math.round(Math.random()*3);
		for (let i = 0; i < (tail_len || 2); i++) {
			this.Grow();
		}
		this.skin = { head : [], body : _env.p.loadImage("../../static/assets/images/games/snake_body.png") };
		for (let dir = 0; dir < 4; dir++) {
			this.skin.head[dir] = _env.p.loadImage("../../static/assets/images/games/snake_head[" + dir + "].png");
		}
	}
	async Move() {
		this.frame++;
		if (this.frame >= this.speed) {
			// draw snake's body
			this.tail.unshift({ x: this.head.x, y: this.head.y });
			this.tail.pop();
			let _x = 0;
			let _y = 0;
			switch (this.dir) {
				case 0: _y--; break;
				case 1: _x++; break;
				case 2: _y++; break;
				case 3: _x--; break;
			}
			this.head.x += _x;
			this.head.y += _y;
			if ( this.tail.filter(t => t.x == this.head.x && t.y == this.head.y).length > 0
				|| this.head.x == -1 || this.head.y == -1
				|| this.head.x == _env.board.w || this.head.y == _env.board.h) {
				_env.p.GameOver();
				return ;
			}
			this.frame = 0;
		}
		for (var i = 0; i < this.len; i++) {
			// _env.p.fill('rgba(255, 200, 0, 1)');
			// _env.p.rect(this.tail[i].x*_env.tile.full, this.tail[i].y*_env.tile.full, _env.tile.inner, _env.tile.inner);
			_env.p.image(this.skin.body, (this.tail[i].x - 0.1)*_env.tile.full, (this.tail[i].y - 0.1)*_env.tile.full, 1.2*_env.tile.inner, 1.4*_env.tile.inner);
		}
		// _env.p.fill('rgba(255, 150, 0, 1)');
		// _env.p.rect(this.head.x*_env.tile.full, this.head.y*_env.tile.full, _env.tile.inner, _env.tile.inner);
		_env.p.image(this.skin.head[this.dir], (this.head.x - 0.33)*_env.tile.full, (this.head.y - 0.33)*_env.tile.full, 1.66*_env.tile.full, 1.66*_env.tile.full);
		// _env.p.image(this.skin.tail, this.tail[i].x*_env.tile.full, this.tail[i].y*_env.tile.full, _env.tile.inner, _env.tile.inner);
		if (this.head.x == _env.apple.x && this.head.y == _env.apple.y) {
			_env.score++;
			_env.score_el.innerHTML=/*"Score: " + */_env.score;
			this.Grow();
			_env.boom.push(new Explosion(40, (this.head.x + 0.5)*_env.tile.full, (this.head.y + 0.5)*_env.tile.full));
			_env.apple.Spawn();
		}
	}
	async Grow() {
		let _x = this.len ? this.tail[this.len - 1].x : this.head.x;
		let _y = this.len ? this.tail[this.len - 1].y : this.head.y;
		switch (this.dir) {
			case 0: _y--; break;
			case 1: _x++; break;
			case 2: _y++; break;
			case 3: _x--; break;
		}
		// this.tail.push({
		// 	x : _x,
		// 	y : _y
		// });
		this.tail[this.len] = { _x, _y };
		this.len++;
		if (this.len > 1) {
			console.log("x: " + _x + ", y: " + _y);
			console.log("tail x: " + this.tail[this.len - 1].x + ", tail y: " + this.tail[this.len - 1].y);
		}
		// console.log("length: " + this.tail.length);
	}
}

class Apple {
	constructor() {
		this.x = null;
		this.y = null;
		this.skin = [
			_env.p.loadImage("../../static/assets/images/games/red_apple.png"),
			_env.p.loadImage("../../static/assets/images/games/green_apple.png")
		];
	}
	Spawn() {
		this.skin[2] = this.skin[Math.floor(Math.random()*2)];
		this.x = Math.floor(Math.random()*(_env.p.width/_env.tile.full));
		this.y = Math.floor(Math.random()*(_env.p.height/_env.tile.full));
	}
	async Draw() {
		(!this.x || !this.y) ? this.Spawn() : 0;
		// _env.p.fill(255, 0, 0);
		// _env.p.ellipse(this.x*_env.tile.full + (_env.tile.full/2), this.y*_env.tile.full + (_env.tile.full/2), _env.tile.inner, _env.tile.inner);
		_env.p.image(this.skin[2], (this.x - 0.33)*_env.tile.full, (this.y - 0.33)*_env.tile.full, 1.66*_env.tile.inner, 1.66*_env.tile.inner);
	}
}

class Board {
	constructor(_w,_h) {
		this.img = null;
		this.w = _w || (_env.win.ratio >= 1 ? 40 : 30);
		this.h = _h || (_env.win.ratio >= 1 ? 30 : 40);
		this.ratio = this.w / this.h;
		this.frame = 0;
	}
	Generate() {
		this.img = _env.p.createGraphics(_env.p.width, _env.p.height);
		this.img.noStroke();
		this.img.background('rgba(0, 0, 0, 0.30)')
		this.img.fill('rgba(50, 50, 50, 0.30)')
		for (let i = 0; i < _env.board.w; i++) {
			for (let j = 0; j < _env.board.h; j++) {
				this.img.rect(i*_env.tile.full, j*_env.tile.full, _env.tile.inner, _env.tile.inner);
			}
		}	
	}
	async Draw() {
		_env.p.image(this.img, 0,0);
		this.frame++;
		if (this.frame > _env.fps*2) {
			_env.fps = Math.round(_env.p.frameRate());
			_env.fps_el.innerHTML="FPS: " + Math.round(_env.fps);
			this.frame = 0;
		}
	}
}

var s = function(p) {
	_env.p = p;
	// win = {
	// 	w : Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
	// 	h : Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
	// };
	_env.win = {
		w : document.getElementById(_env.el_id).parentElement.clientWidth,
		h : document.getElementById(_env.el_id).parentElement.clientHeight
	}
	_env.win.ratio = _env.win.w / _env.win.h;
	_env.board = new Board();
	Gesture.Listen("#" + _env.el_id);
	p.setup = function() {
		_env.fps_el = document.getElementById(_env.fps_el_id);
		_env.score_el = document.getElementById(_env.score_el_id);
		_env.game_over_el = document.getElementById(_env.game_over_el_id);
//	console.log(board.ratio, win.ratio);
		if (_env.board.ratio > _env.win.ratio) {
			_env.canvas_el = p.createCanvas(_env.win.w, _env.win.h*(_env.win.ratio/_env.board.ratio));
			_env.tile = {
				inner : p.width*0.9/_env.board.w,
				padding : p.width*0.1/_env.board.w
			};
		} else {
			_env.canvas_el = p.createCanvas(_env.win.w*(_env.board.ratio/_env.win.ratio), _env.win.h);
			_env.tile = {
				inner : p.height*0.9/_env.board.h,
				padding : p.height*0.1/_env.board.h
			};
		}
		let ctx = _env.canvas_el.canvas.getContext('2d');
		ctx.mozImageSmoothingEnabled = false;
		ctx.webkitImageSmoothingEnabled = false;
		ctx.msImageSmoothingEnabled = false;
		ctx.imageSmoothingEnabled = false;
		_env.tile.full = _env.tile.inner + _env.tile.padding;
		p.pixelDensity(1);
		p.frameRate(30);
		p.noLoop();
		p.NewGame();
//		textAlign(CENTER, CENTER);
	}
	p.NewGame = function() {
		if (!(_env.board.img)) { _env.board.Generate(); }
		_env.snake = new Snake();
		_env.apple = new Apple();
		_env.score = 0;
		_env.score_el.innerHTML = _env.score;
		_env.fps_el.innerHTML = "FPS: " + _env.fps;
	}
	p.keyPressed = async function() {
		if (p.keyCode == 38 && (_env.snake.dir != 2)) { _env.snake.dir = 0; }
		if (p.keyCode == 39 && (_env.snake.dir != 3)) { _env.snake.dir = 1; }
		if (p.keyCode == 40 && (_env.snake.dir != 0)) { _env.snake.dir = 2; }
		if (p.keyCode == 37 && (_env.snake.dir != 1)) { _env.snake.dir = 3; }
	}
	Gesture.Swipe = async function(_dir) { // create callback for touchscreen swipe event >> see generic.js
		console.log("swiped " + _dir);
		if (_dir == "up" && (_env.snake.dir != 2)) { _env.snake.dir = 0; }
		if (_dir == "right" && (_env.snake.dir != 3)) { _env.snake.dir = 1; }
		if (_dir == "down" && (_env.snake.dir != 0)) { _env.snake.dir = 2; }
		if (_dir == "left" && (_env.snake.dir != 1)) { _env.snake.dir = 3; }
	}
	p.windowResized = function() {
		_env.win = {
			w : document.getElementById(_env.el_id).parentElement.clientWidth,
			h : document.getElementById(_env.el_id).parentElement.clientHeight
		}
		if (_env.board.ratio > _env.win.ratio) {
			_env.tile = {
				inner : p.width*0.9/_env.board.w,
				padding : p.width*0.1/_env.board.w
			};
		} else {
			_env.tile = {
				inner : p.height*0.9/_env.board.h,
				padding : p.height*0.1/_env.board.h
			};
		}
	}
	p.draw = async function () {
		// p.draw_board();
		_env.board.Draw();
		_env.apple.Draw();
		_env.snake.Move();

		for (let i = 0; i < _env.boom.length; i++) {
			_env.boom[i].Update(); //update all axplosions occuring
		}
	}
	p.GameOver = function() {
		p.noLoop();
		PlayAgain();
	}
}

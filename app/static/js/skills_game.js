"use strict";

var n_stars = 150;
var starfield = null;
var starship = null;
var cross = null;
var boom = [];
var KEY_LEFT = false;
var KEY_RIGHT = false;
var KEY_FIRE = false;
var hit_lock = false;

function setup() {
	let canvas = createCanvas(windowWidth, windowHeight);
	canvas.parent(document.querySelector(".underlay"));
	let min_size = 1;//width > height ? width*0.01 : height*0.01;
	let max_size = width > height ? height*0.05 : width*0.05;
	starfield = new Starfield(n_stars, width/2, height/3, min_size, max_size);
//  genParticles(width / 2, height / 2);
    starship = new Starship();
	cross = new Crosshair(color("#1f2833"), width / 3, height / 50, (height * width) / 600000);
}

function draw() {
    // set_origin();
	background(starfield ? 'rgba(0,0,0,0.33)' : 'rgba(0,0,0,0.95)');
	starfield.Update(); //update all axplosions occuring
    if (KEY_LEFT) { starship.MoveLeft(); } else if (KEY_RIGHT) { starship.MoveRight(); };
    if (KEY_FIRE) { starship.Fire(); };
    translate(width / 2, height / 3);
    cross.PlotOrigin();
	starship.Plot();
	for (let i = 0; i < boom.length; i++) {
		boom[i].Update(); //update all axplosions occuring
	}
}

// void keyReleased(){
//   if(keyCode==LEFT)  left=false;
//   if(keyCode==RIGHT) right=false;
// }
function keyPressed() {
	// console.log(keyCode);
	switch(keyCode){
		case 37: KEY_LEFT = true; break;
		case 39: KEY_RIGHT = true; break;
		case 32: KEY_FIRE = true; break;
	}
    return (true); // false = prevent default behaviour
}
function keyReleased() {
	switch(keyCode){
		case 37: KEY_LEFT = false; break;
		case 39: KEY_RIGHT = false; break;
		case 32: KEY_FIRE = false; break;
	}
    return (true); // false = prevent default behaviour
}

class Explosion {
	constructor(i,x,y) {
		// console.log("explosion constructed");
		this.pc = [];
		(i && i > 10) ? 0 : i = 100;
		while(i--) {
			this.pc.push({
				color: color(color('hsl(' + Math.floor(Math.random()*349) + ', 100%, 50%)')),
				pos: createVector(x, y),
				vel: p5.Vector.fromAngle(Math.random()*(2*PI)).mult(Math.random()*10),
				size: Math.random()*((windowHeight + windowWidth) / 10)
			});
		}
	}
	Update() {
		// console.log("explosion up");
		for(let i = 0; i < this.pc.length; i++) {
			this.pc[i].pos.add(this.pc[i].vel);
			this.pc[i].size*=0.92;
			if(this.pc[i].size > 3) {
				stroke(this.pc[i].color);
				strokeWeight(this.pc[i].size);
				point(this.pc[i].pos.x, this.pc[i].pos.y);
			} else {
				this.pc.splice(i, 1);
			}
		}
		if (this.pc.length == 0) {
			for (var i = boom.length - 1; i >= 0; i--) {
			    if (boom[i] == this) {
					boom.splice(i,1);
			        break;
			    }
			}
		}
	}
}

class Crosshair {
	constructor(clr, crosshair_w, crosshair_h, crosshair_t) {
		this.clr = clr;
		this.w = crosshair_w;
		this.h = crosshair_h;
		this.t = crosshair_t;
	}
	PlotOrigin() {
		//console.log("width:" + width + " height:" + height);
		stroke(this.clr);
		strokeWeight(this.t); //thickeness in pixels
		line(-this.w, 0, this.w, 0);
		line(0, -this.h, 0, this.h);
	}
}

async function lock_hit() {
	hit_lock = true;
	await sleep(1000);
	hit_lock = false;
}

class Starship {
	constructor() {
		this.skin = [
			loadImage("../../static/assets/images/games/small_react.png"),
			loadImage("../../static/assets/images/games/big_react.png")
		];
		this.nw = Math.min(width/2.5,height/4); // ship size
		this.nh = this.nw;
		this.x = -(this.nw / 2);
		this.y = 1/3 * height;
		this.max_x = width / 2.80 - this.nw/2;
		this.min_x = -width / 2.80 + this.nw/2;
		this.max_y = height / 2 - this.nh;
		this.min_y = -height / 2;
		this.speed = 25; //dynamic fun: map(mouseX, 0, width, 0, 50);
		this.cross = new Crosshair(color("#fcad0f"), Math.max(width/70, height/70), Math.max(width/70, height/70), (height * width) / 1000000);
		this.lasers = [];
		this.fire_lock = false;
		this.moving = -1;
		this.target = null;
	}
	SetX(pos_x) {
		// console.log("pos_x:", pos_x, "%:", ((width/2) + pos_x + this.nw/2)/width);
		pos_x += this.nw/2;
		this.x = (pos_x > this.max_x ? this.max_x : //this.x :
		pos_x < this.min_x ? this.min_x : pos_x) - this.nw/2; //this.x : pos_x);
		// console.log(this.min_x,pos_x,this.max_x);
		if (typeof crosshair_hover === "function" && typeof crosshair_hover_reset === "function") {
			if (pos_x > (this.max_x*2/3)) {
				this.target = 2;
				if (pos_x > (this.max_x*5/6) && this.moving == this.target) { this.moving = -1; this.Fire(); KEY_LEFT = false; KEY_RIGHT = false; }
				crosshair_hover(this.target);
			} else if (pos_x < (this.min_x*2/3)) {
				this.target = 0;
				if (pos_x < (this.min_x*5/6) && this.moving == this.target) { this.moving = -1;; this.Fire(); KEY_LEFT = false; KEY_RIGHT = false; }
				crosshair_hover(this.target);
			} else if (pos_x > (this.min_x*1/3) && (pos_x < (this.max_x*1/3))) {
				this.target = 1;
				if ((pos_x > (this.min_x*0.2/3) && (pos_x < (this.max_x*0.2/3))) && this.moving == this.target) { this.moving = -1; this.Fire(); KEY_LEFT = false; KEY_RIGHT = false; }
				crosshair_hover(this.target);
			} else { this.target = null; crosshair_hover_reset(); }
		}
		// console.log("x:", this.x);
	}
	SetY(pos_y) {
		this.y = (pos_y > this.max_y ? this.max_y : //this.x :
		pos_y < this.min_y ? this.min_y : pos_y); //this.x : pos_x);
	}
	MoveTo(idx) {
		let pos_x = this.x + this.nw/2;
		if (this.target != idx) {
			this.moving = idx;
			if (idx < 1) { KEY_LEFT = true; /*console.log("movin left");*/ } else if (idx > 1) { KEY_RIGHT = true; /*console.log("movin right");*/ }
			else if (pos_x > 0) { KEY_LEFT = true; /*console.log("movin left");*/ } else { KEY_RIGHT = true; /*console.log("movin right");*/ }
			// KEY_RIGHT = true : KEY_LEFT = true;
		} else { this.Fire(); }
		// KEY_RIGHT = false;
		// KEY_LEFT = false;
	}
	Rot() {
		this.rad = Math.atan2(this.y + this.nh / 2, this.x + this.nw / 2);
		rotate(-PI / 2 + this.rad);
	}
	MoveLeft() {
		this.SetX(this.x -= Math.max(width / 80, 3));
	}
	MoveRight() {
		this.SetX(this.x += Math.max(width / 80, 3));
	}
	Plot() {
		// push();
		translate(this.x + this.nw / 2, 0);
		this.Rot();
		this.cross.PlotOrigin(); //draw pink rotation origin
		image(this.skin[Math.floor(Math.random()*2)], -(this.nw / 2), this.y, this.nw, this.nh);
		//this.w = this.img.width;
		//this.h = this.img.height;
		// pop();
		for (let i = 0; i < this.lasers.length; i++) {
			this.lasers[i].Update();
			// console.log("target:", this.target);
			if (this.target != null && this.lasers[i].pos.y < height/15) {
				if (typeof laser_hit == "function" && hit_lock == false) {
					lock_hit();
					laser_hit(this.target);
					this.lasers[i].Explode();
				}
				this.lasers.splice(i, 1);
			} else if (this.lasers[i].pos.y < height/50) {
				this.lasers.splice(i, 1);
			}
		}
		// pop();
	}
	async Fire() {
		if (!this.fire_lock) {
			this.fire_lock = true;
			// push();
			for (let i = 0; i < 10; i++) {
				await this.lasers.push(new Laser(this, "right", i));
				await this.lasers.push(new Laser(this, "left", i));
				await sleep(10);
			}
			// pop();
			await sleep(80);
			this.fire_lock = false;
		}
	}
}

class Laser {
	constructor(starship, side, idx) { // crl, x/y..
		this.ship = starship;
		// this.color = color(color('hsl(' + floor(random(349)) + ', 100%, 50%)'));
		this.color = ShadeBlend((idx+1)/10,"#66fcf1","#1f2833");
		let speed = height*0.015;
		// let rot_bias = 0;
		// let perspective_bias = 0;
		// if (this.ship.rad < (PI / 1.95)) {
		// 	rot_bias = (Math.abs(this.ship.rad - (PI/2))/(PI/2)) * 1.5;
		// 	// console.log("positive fire bias");
		// } else if (this.ship.rad > (PI / 2.05)) {
		// 	// console.log("negative fire bias");
		// 	rot_bias = -(Math.abs(this.ship.rad - (PI/2))/(PI/2)) * 1.5;
		// } else {
		// 	// console.log("no bias");
		// }
		// if (side == "right") {
		// 	// perspective_bias = (3*PI)*((width/height)/100);
		// 	perspective_bias = height > width ? (PI/24) : (PI/14);
		// } else {
		// 	// perspective_bias = -(3*PI)*((width/height)/100);
		// 	perspective_bias = height > width ? (-(PI/24)) : (-(PI/14));
		// }
		// let test_rad1 = GetAngle(width/2+this.ship.nw/3, height/3-this.ship.y, starfield.origin.x, starfield.origin.y); //- PI/2;
		// let test_rad2 = GetAngle(width/2-this.ship.nw/3, height/3-this.ship.y, starfield.origin.x, starfield.origin.y); //- PI/2;
		let test_rad1 = GetAngle(width/2+this.ship.nw/3, height/3-this.ship.y, starfield.origin.x, starfield.origin.y); //- PI/2;
		let test_rad2 = GetAngle(width/2-this.ship.nw/3, height/3-this.ship.y, starfield.origin.x, starfield.origin.y); //- PI/2;
		// console.log("rad:", this.ship.rad, "PI/1.8:", PI/1.8, "rad - PI/2:", this.ship.rad - PI/2);
		// console.log("rad:", this.ship.rad, "PI/1.8:", PI/1.8, "PI/2.2:", PI/2.2);
		// this.pos = createVector(0,0);
		this.pos = createVector(/*(this.ship.x + this.ship.nw/2) + */(side == "left" ? -this.ship.nw/2.5 : this.ship.nw/2.5), this.ship.y + (this.ship.nh/5));
		this.vel = p5.Vector.fromAngle(/*this.ship.rad + rot_bias + perspective_bias - PI*/ side == "left" ? test_rad1 : test_rad2).mult(speed);
		this.size = width/60 + height/80;
	}
	Update() {
		this.pos.add(this.vel);
		this.size*=0.93;
		stroke(this.color);
		strokeWeight(this.size);
		point(this.pos.x, this.pos.y);
	}
	Explode() {
		boom.push(new Explosion(60, (this.pos.x /*+ 0.5*/), (this.pos.y /*+ 0.5*/)));
		console.log(starship.target);
		if (starship.target != null && logo[starship.target]) { change_view(logo[starship.target].parent_id.substring(1, logo[starship.target].parent_id.length)); }
	}
}

class Starfield {
	constructor(i,x,y,min_size,max_size) {
		this.max_size = max_size;
		this.min_size = min_size;
		this.stars = [];
		this.origin = { x, y };
		this.i = i;
		(i && i >= 1) ? 0 : i = 100;
		while(i--) {
			this.NewStar();
		}
		// console.log(this.stars[0].pos); // how is the x,y vector made?
	}
	NewStar() {
		let speed = height*0.0005 + width*0.0005 + Math.random()*(width > height ? height*0.01 : width*0.01);
		let offset = (Math.random()*height*0.4) + (Math.random()*width*0.4);
		let scale = (Math.random()*(this.max_size/3000))*speed;
		if (Math.random() > 0.97) {
			var clr = "#fcad0f";
			scale *= 5;
		} else {
			var clr = "ffffff";
		}
		this.stars.push({
			color: color(clr),
			pos: new p5.Vector(this.origin.x, this.origin.y),
			vel: p5.Vector.fromAngle(random(2*PI)).mult(speed), //how does the vector velocity speed component work?
			size: 1,
			scale: scale,
			display_offset: offset
		});
		// console.log("offset:", offset);
	}
	Update() {
		for(let i = 0; i < this.stars.length; i++) {
			this.stars[i].pos.add(this.stars[i].vel);
			if (((this.stars[i].pos.x < width && this.stars[i].pos.x > 0)
				&& (this.stars[i].pos.y < height && this.stars[i].pos.y > 0))) {
				if ((((this.stars[i].pos.x > this.origin.x ? (this.stars[i].pos.x - this.origin.x) : (this.origin.x - this.stars[i].pos.x))
					+ (this.stars[i].pos.y > this.origin.y ? (this.stars[i].pos.y - this.origin.y) : (this.origin.y - this.stars[i].pos.y)))
					> this.stars[i].display_offset)) {
					this.stars[i].size += this.stars[i].scale;
					stroke(this.stars[i].color);
					strokeWeight(this.stars[i].size);
					point(this.stars[i].pos.x, this.stars[i].pos.y);
				// console.log("shift x:", (this.stars[i].pos.x > this.origin.x ? (this.stars[i].pos.x - this.origin.x) : (this.origin.x - this.stars[i].pos.x)), "shift y:", (this.stars[i].pos.y > this.origin.y ? (this.stars[i].pos.y - this.origin.y) : (this.origin.y - this.stars[i].pos.y)));
				}
			} else {
				this.stars.splice(i, 1);
			}
		}
		if (this.stars.length < this.i) {
			for (let i = this.stars.length; i < this.i; i++) {
				this.NewStar();
			}
		}
	}
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	draw();
}

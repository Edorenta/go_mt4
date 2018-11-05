var boom = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  min_size = width > height ? width*0.01 : height*0.01;
//  genParticles(width / 2, height / 2);
}

function draw() {
	background('rgba(0,0,0,0.15)');
	for (let i = 0; i < boom.length; i++) {
		boom[i].Update(); //update all axplosions occuring
	}
}

function mousePressed() {
	boom.push(new Explosion(100, mouseX, mouseY));
	console.log(boom.length);
}

class Explosion {
	constructor(i,x,y) {
		this.magic = floor(random(1000000));
		this.pc = [];
		(i && i > 10) ? 0 : i = 100;
		while(i--) {
			this.pc.push({
				color: color(color('hsl(' + floor(random(349)) + ', 100%, 50%)')),
				pos: createVector(x, y),
				vel: p5.Vector.fromAngle(random(2*PI)).mult(random(10)),
				size: random(50)
			});
		}
	}
	Update() {
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
			// boom.splice(this.idx-1,1);
		}
	}
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	draw();
}

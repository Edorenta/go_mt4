"use strict";
/*
	// example of linear gradient to add after this.transform in constructor
	var defs = document.createElementNS (xmlns, "defs");
	var grad = document.createElementNS (xmlns, "linearGradient");
	grad.setAttributeNS (null, "id", "gradient");
	grad.setAttributeNS (null, "x1", "0%");
	grad.setAttributeNS (null, "x2", "0%");
	grad.setAttributeNS (null, "y1", "100%");
	grad.setAttributeNS (null, "y2", "0%");
	var stopTop = document.createElementNS (xmlns, "stop");
	stopTop.setAttributeNS (null, "offset", "0%");
	stopTop.setAttributeNS (null, "stop-color", "#ff0000");
	grad.appendChild (stopTop);
	var stopBottom = document.createElementNS (xmlns, "stop");
	stopBottom.setAttributeNS (null, "offset", "100%");
	stopBottom.setAttributeNS (null, "stop-color", "#0000ff");
	grad.appendChild (stopBottom);
	defs.appendChild (grad);
	g.appendChild (defs);

	// example of border path to add after this.transform in constructor
	var coords = "M 0, 0";
	coords += " l 0, 300";
	coords += " l 300, 0";
	coords += " l 0, -300";
	coords += " l -300, 0";

	var path = document.createElementNS (xmlns, "path");
	path.setAttributeNS (null, 'stroke', "#000000");
	path.setAttributeNS (null, 'stroke-width', 10);
	path.setAttributeNS (null, 'stroke-linejoin', "round");
	path.setAttributeNS (null, 'd', coords);
	path.setAttributeNS (null, 'fill', "url(#gradient)");
	path.setAttributeNS (null, 'opacity', 1.0);
	g.appendChild (path);
*/
var TinySVG_n = 0;

class TinySVG {
	constructor(input) {
		//parent_id,id,w,h,vw,vh,scale,core,xmlns //core=path/gradients/shapes
		let xmlns = input.xmlns || "http://www.w3.org/2000/svg";
		let xmlns_link = input.xmlns_link || "http://www.w3.org/1999/xlink";
		this.parent_el = document.querySelector(input.parent_id);
		this.id = input.id || ("TinySVG_" + (TinySVG++));
		this.fill = input.fill || null;
		this.stroke = input.stroke || null;
		this.scale = input.scale || 1.0;
		this.angle = input.angle || 0;
		this.vw = input.vw || null;
		this.vh = input.vh || null;
		this.base_w = input.w || 100;
		this.base_h = input.h || 100;
		this.w = this.base_w * this.scale;
		this.h = this.base_h * this.scale;
		this.rotate = this.angle ? ("rotate(" + this.angle + " " + this.w/2 + " " + this.h/2 + ")") : "";
		this.mx = this.scale != 1.0 ? ("matrix(" + this.scale + ",0,0," + this.scale + ",0,0)") : "";
		this.transform = (this.mx ? this.mx : "") + (this.rotate ? (" " + this.rotate) : "");
		this.el = document.createElementNS(xmlns, "svg");
		this.el.setAttribute("id", this.id);
		this.el.setAttribute("xmlns", xmlns);
		this.el.setAttribute("xmlns:xlink", xmlns_link);
		if (this.vw && this.vh) { this.el.setAttributeNS(null, "viewBox", "0 0 " + this.vw + " " + this.vh); }
		if (this.w) { this.el.setAttributeNS(null, "width", this.w); }
		if (this.h) { this.el.setAttributeNS(null, "height", this.h); }
		//this.el.style.display = "block"; // recquired?
		this.g_el = document.createElementNS(xmlns, "g");
		this.el.appendChild(this.g_el);
		if (this.transform) { this.g_el.setAttributeNS(null, "transform", this.transform); }
		if (this.fill) { this.g_el.setAttributeNS(null, "fill", this.fill); }
		if (this.stroke) { this.g_el.setAttributeNS(null, "stroke", this.stroke); }
		this.core = input.core;
		this.g_el.innerHTML = this.core;
	}
	Spawn() {
		this.parent_el.appendChild(this.el);
	}
	Remove() {
		this.el.remove();
	}
    Sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async Fill(clr) {
    	this.fill = clr;
    	this.g_el.setAttributeNS(null, "fill", clr);
    }
    async Stroke(clr) {
    	this.stroke = clr;
    	this.g_el.setAttributeNS(null, "stroke", clr);
    }
    OnClick(f) { this.el.addEventListener('click', f); }
    OnMouseOver(f) { this.el.addEventListener('mouseover', f); }
    OnMouseOut(f) { this.el.addEventListener('mouseout', f); }
	async Rotate(angle, _cx, _cy) {
		let cx = _cx || (this.w/this.scale)/2;
		let cy = _cy || (this.h/this.scale)/2;
		this.angle = angle; //in degrees
		this.rotate = this.angle ? ("rotate(" + this.angle + " " + cx + " " + cy + ")") : "";
		this.Transform();
	}
	async Scale(factor, _ms_delay) {
		let ms_delay = _ms_delay || 0;
		let i = (ms_delay / 20) + 1;
		let step = ((this.scale*factor) - this.scale) / i;
		// console.log("scale:", this.scale, "factor:", factor, "step:", step, "n step:", i);
		while (i-- > 0) {
			this.scale += step;
			this.mx = ("matrix(" + this.scale + ",0,0," + this.scale + ",0,0)");
			if (this.w && this.h) {
				this.w = this.base_w * this.scale;
				this.h = this.base_h * this.scale;
				this.el.setAttributeNS(null, "width", this.w);
				this.el.setAttributeNS(null, "height", this.h);
			}
			this.Transform();
			if (i > 0) { await this.Sleep(30); }
		}
	}
	async Pulse(_min_scale, _max_scale) {
		let min_scale = _min_scale || this.scale * 0.92;
		let max_scale = _max_scale || this.scale * 1.08;
		this.is_pulsing = true;
		this.Scale(min_scale / this.scale, 1300);
		while (this.is_pulsing) {
			await this.Scale(max_scale / min_scale, 1300);
			await this.Scale(min_scale / max_scale, 1300);
		}
	}
	async Spin() {
		this.is_spinning = true;
		let i = 0;
		while (this.is_spinning) {
			this.Rotate(i);
			i == 359 ? i = 0 : i++;
			await this.Sleep(20);
		}
	}
	async Transform() {
		this.transform = (this.mx ? this.mx : "") + (this.rotate ? (" " + this.rotate) : "");
		if (this.transform) { this.g_el.setAttributeNS(null, "transform", this.transform); }
	}
}

// <svg id="svg_P" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="300" height="300">
// 	<g fill="#0B0C10" transform="matrix(3,0,0,3,0,0)">
// 		<path d="M26 97l-1-36h25q10 0 0 0c17 0 36-5 35-30C85 9 69 0 50 0H15a3 3 0 0 0-3 3v8h39c6 0 12 1 16 5s6 9 6 15c0 5-2 11-6 14-5 4-11 5-17 5H15c-2 0-3 1-3 3v44c0 2 1 3 3 3h8c1 0 3-1 3-3z"/>
// 	</g>
// </svg>

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
		this.parent_id = input.parent_id;
		this.parent_el = document.querySelector(input.parent_id);
		this.id = input.id || ("TinySVG_" + (TinySVG_n++));
		this.fill = input.fill || null;
		this.stroke = input.stroke || null;
		this.scale = input.scale || 1.0;
		this.angle = input.angle || 0;
		// this.vw = input.vw || null;
		// this.vh = input.vh || null;
		this.base_w = input.w || 100;
		this.base_h = input.h || 100;
		this.w = this.base_w * this.scale;
		this.h = this.base_h * this.scale;
		this.viewBox = input.viewBox || "0 0 " + this.w + " " + this.h;
		// this.viewBox = input.viewBox || "0 0 100 100";
		this.rotate = this.angle ? ("rotate(" + this.angle + " " + this.w/2 + " " + this.h/2 + ")") : "";
		this.mx = this.scale != 1.0 ? ("matrix(" + this.scale + ",0,0," + this.scale + ",0,0)") : "";
		this.transform = (this.mx ? this.mx : "") + (this.rotate ? (" " + this.rotate) : "");
		console.log(this.viewBox, this.transform);
		this.el = document.createElementNS(xmlns, "svg");
		this.el.setAttribute("id", this.id);
		this.el.setAttribute("xmlns", xmlns);
		this.el.setAttribute("xmlns:xlink", xmlns_link);
		this.el.setAttribute("style",`position: absolute; -webkit-transform: translate(-50%,-50%); transform: translate(-50%,-50%);`);
		if (!input.display || input.display != "grid") { console.log(input.display); this.el.style.left = "50%"; this.el.style.right = "50%"; }
		if (this.viewBox) { this.el.setAttributeNS(null, "viewBox", this.viewBox); }
		if (this.w) { this.el.setAttributeNS(null, "width", this.w); }
		if (this.h) { this.el.setAttributeNS(null, "height", this.h); }
		//this.el.style.display = "block"; // recquired?
		this.g_el = document.createElementNS(xmlns, "g");
		this.el.appendChild(this.g_el);
		// this.el.setAttribute("style", "position: absolute; inline-block; vertical-align: middle; text-align: center;");
		if (this.transform) { this.g_el.setAttributeNS(null, "transform", this.transform); }
		if (this.fill) { this.g_el.setAttributeNS(null, "fill", this.fill); }
		if (this.stroke) { this.g_el.setAttributeNS(null, "stroke", this.stroke); }
		// this.g_el.classList.add("center");
		this.awaits = false;
		if (input.core) {
			this.core = input.core;
		} else {
			// LoadSVG(input.id, this.core);
			this.Load(input.id);
		}
	}
	async Load(svg_id) {
		let promise = await fetch("/static/assets/svg/" + svg_id + ".svg");
		this.core = await promise.text(); //.json();
		if (this.awaits == true) { this.Spawn(); }
		// let obj = this;
		// let req = _API("xhr", "GET", "/static/assets/svg/" + svg_id + ".svg",
		// 	function(str) {
		// 		// console.log(str);
		// 		// let node = document.getElementById(el_id);
		// 		obj.core = str;
		// 		if (obj.awaits == true) { obj.Spawn(); }
		// 	},
		// 	function(str) {
		// 		console.log("LoadSVG error: " + str);
		// 	}
		// );
	}
	async Spawn() {
		if (!this.core) {
			this.awaits = true;
			// console.log("TinySVG.Spawn() error: svg file not loaded");
			return ;
		}
		this.g_el.innerHTML = this.core;
		if (!this.parent_el) {
			console.log("TinySVG.Spawn() error: " + this.parent_id + " does not exist");
		} else {
			this.parent_el.appendChild(this.el);
		}
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
		let j = i;
		let step = ((this.scale*factor) - this.scale) / i;
		// console.log("scale:", this.scale, "factor:", factor, "step:", step, "n step:", i);
		let base_w = this.w;
		let base_h = this.h;
		let base_scale = this.scale;
		let small_w = 0;
		let small_h = 0;
		let new_w = 0;
		let new_h = 0;
		let margin_left = 0;
		let margin_top = 0;
		let coef = 0;
		if (factor > 1) {
			coef = 1;
			small_w = this.w;
			small_h = this.h;
			this.ChangeWidth(Math.round(this.w*(factor+0.0)));
			this.ChangeHeight(Math.round(this.h*(factor+0.0)));
		} else {
			coef = -1;
			small_w = this.w*factor;
			small_h = this.h*factor;
		}
		// if eased, max scale maps to sin(90) => 1, min scale maps to sin(270) => -1
		while (i-- > 0) {
			this.scale = Math.round(1000*(this.scale + step))/1000;
			new_w = small_w + ((this.w - small_w)*(coef == 1 ? ((j-i)/j) : (i/j)));
			new_h = small_h + ((this.h - small_h)*(coef == 1 ? ((j-i)/j) : (i/j)));
			margin_left = (-(this.w - new_w) / 2);
			margin_top = (-(this.h - new_h) / 2);
			// console.log(i/j, small_w, new_w, small_h, new_h);
			this.mx = ("matrix(" + this.scale + ",0,0," + this.scale + ",0,0)");
			this.viewBox = (Math.round(1000*margin_left)/1000 /*- (coef == 1 ? small_w*2 : 0)*/) + " " //((this.w) * (1-factor) / i)/2
						+ (Math.round(1000*margin_top)/1000 /*- (coef == 1 ? small_h*2 : 0)*/) + " " 
						+ this.w + " "
						+ this.h;
			if (margin_left && margin_top) {
				this.UpdateViewBox();
				this.Transform();
			}
			if (i > 0) { await this.Sleep(20); }
		}
		this.ChangeWidth(Math.round(base_w*(factor)));
		this.ChangeHeight(Math.round(base_h*(factor)));
		this.mx = ("matrix(" + base_scale*factor + ",0,0," + base_scale*factor + ",0,0)");
		this.viewBox = "0 0 " + Math.round(base_w*(factor)) + " " + Math.round(base_h*(factor));
		this.Transform();
		this.UpdateViewBox();
	}
	async ChangeWidth(new_w) {
		this.w = new_w;
		await this.el.setAttributeNS(null, "width", this.w);
	}
	async ChangeHeight(new_h) {
		this.h = new_h;
		await this.el.setAttributeNS(null, "height", this.h);
	}
	async Pulse(_ms, _ease, _min_scale, _max_scale) {
		let ms = _ms || 3000;
		let min_scale = _min_scale || this.scale * 0.88;
		let max_scale = _max_scale || this.scale * 1.0;
		this.is_pulsing = true;
		this.Scale(max_scale / this.scale, ms/2);
		if (!_ease) {
			while (this.is_pulsing) {
				await this.Scale(min_scale / max_scale, ms/2);
				await this.Scale(max_scale / min_scale, ms/2);
			}
		} else {

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
	async UpdateViewBox() {
		// console.log(this.viewBox);
		if (this.viewBox) { this.el.setAttributeNS(null, "viewBox", this.viewBox); }
	}
}

// <svg id="svg_P" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="300" height="300">
// 	<g fill="#0B0C10" transform="matrix(3,0,0,3,0,0)">
// 		<path d="M26 97l-1-36h25q10 0 0 0c17 0 36-5 35-30C85 9 69 0 50 0H15a3 3 0 0 0-3 3v8h39c6 0 12 1 16 5s6 9 6 15c0 5-2 11-6 14-5 4-11 5-17 5H15c-2 0-3 1-3 3v44c0 2 1 3 3 3h8c1 0 3-1 3-3z"/>
// 	</g>
// </svg>

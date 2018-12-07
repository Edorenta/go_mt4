"use strict";

var Banner_n = 0;
var Banner_tot_height = 0;
var Banner_base_css_up = false;

class Banner {
	constructor(input) {
		this.parent_id = input.parent_id || ".main";
		this.parent_el = document.querySelector(this.parent_id);
		this.top = input.top || ((this.parent_el.offsetTop + Banner_tot_height) + "px");
		console.log(this.top, "Banner tot height: " + Banner_tot_height, "Parent top: " + this.parent_el.offsetTop);
		this.left = input.left || 0;
		this.h = (this.parent_el.offsetWidth >= this.parent_el.offsetHeight ? 0.07*this.parent_el.offsetHeight : 0.12*this.parent_el.offsetWidth);
		Banner_tot_height += this.h;
		console.log(this.h);
		this.w = input.width || (this.parent_el.offsetWidth + "px");
		this.id = input.id || ("Banner_" + (Banner_n++));
		this.type = input.type || "warning"; //primary/dark/light/warning/danger/success/red/green
		switch (this.type) {
			case "red": this.inner_clr = "rgba(216,34,34,0.75)"; break;
			case "green": this.inner_clr = "rgba(25,216,15,0.75)"; break;
			case "success": this.inner_clr = "rgba(25,216,15,0.75)"; break;
			case "warning": this.inner_clr = "rgba(252,173,15,0.75)"; break;
			case "danger": this.inner_clr = "rgba(216,34,34,0.75)"; break;
			case "info": this.inner_clr = "rgba(197,198,199,0.75)"; break;
			case "primary": this.inner_clr = "rgba(31,40,51,0.75)"; break;
			case "dark": this.inner_clr = "rgba(11,12,16,0.75)"; break;
			case "light": this.inner_clr = "rgba(216,34,34,0.75)"; break;
			case "link": this.inner_clr = "rgba(252,173,15,0.75)"; break;
			case "black": this.inner_clr = "rgba(255,255,255,0.75)"; break;
		}
        // this.inner_clr = input.inner_clr || "rgba(216,34,34,0.6)";
        this.txt_clr = input.txt_clr || "rgba(255,255,255,1)";
        this.font = input.font || "play-regular";
		this.el = document.createElement("div");
		this.el.setAttribute("id", this.id);
		this.el.classList.add("Banner", "text-h5");
		this.text = input.text;
		this.el.innerHTML = this.text;
		this.el.addEventListener('click', function() { Banner_tot_height -= this.offsetHeight; this.parentNode.removeChild(this); });
        if (!Banner_base_css_up) { this.AddBaseCSS(); Banner_base_css_up = true; }
        this.Spawn();
	}
	Spawn() {
		this.AddCustomCSS();
		this.el.appendAfter(this.parent_el/*.parentNode*/);
	}
	Remove() {
		Banner_tot_height -= this.el.offsetHeight;
		this.el.remove(); //el.remove()
		// this.el.parentNode.removeChild(this); //el.remove()
	}
	Text(str) {
		this.text = str;
		this.el.innerHTML = this.text;
	}
    AddBaseCSS() {
        CSS_Insert(".Banner",`
        {
            position: fixed;
            display: flex;
			align-items: center;
			justify-content: center;
			text-align: center;
            border: 0;
            border-radius: inherit;
            cursor: pointer;
        }`);
    }
    AddCustomCSS() {
        CSS_Insert("#" + this.id,`
        {
            width: ` + this.w + `;
            height: ` + this.h + `px;
            left: ` + this.left + `;
            top: ` + this.top + `;
            color: ` + this.txt_clr +/* `;
            font-size: ` + this.font_size +*/ `;
            font-family: ` + this.font + `;
            text-justify: none;
            background-color: ` + this.inner_clr + `;
        }`);
    }
}

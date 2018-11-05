"use strict";

var MsgBox_n = 0;
var MsgBox_base_css_up = false;
// var MsgBox_btn_css_up = false;
// var MsgBox_pulse_css_up = false;

class MsgBox {
    constructor(input) {
        //input = { parent_id, speed, pulse, btn, font_size, padding, inner_clr, txt_clr, border_clr, hover_inner_clr, hover_txt_clr, hover_border_clr, pulse_in_clr, pulse_out_clr)}
        this.speed = input.speed || 1500;
        this.pulse = input.pulse !== undefined ? input.pulse : true;
        this.btn = input.btn !== undefined ? input.btn : false;
        this.font_size = input.font_size ? input.font_size + "rem" : "1.2rem";
        this.padding = input.padding ? input.padding + "rem" : "0.7rem";
        this.min_height = input.padding ? (input.padding/2 + (input.font_size ? input.font_size : 1.2)) + "rem" : "1.55rem";//1.55 = font_size + padding/2
        this.inner_clr = input.inner_clr || "rgba(255,255,255,0.2)";
        this.txt_clr = input.txt_clr || "rgba(255,255,255,1)";
        this.border_clr = input.border_clr || "rgba(255,255,255,1)";
        this.pulse_in_clr = input.pulse_in_clr || "rgba(200,200,200,0.8)";
        this.pulse_out_clr = input.pulse_out_clr || "rgba(200,200,200,0)";
        this.hover_txt_clr = input.hover_txt_clr || "rgba(0,0,0,1)";
        this.hover_inner_clr = input.hover_inner_clr || "#fcad0f";
        this.hover_border_clr = input.hover_border_clr || "rgba(0,0,0,1)";
        if (!MsgBox_base_css_up) { this.AddBaseCSS(); MsgBox_base_css_up = true; }
        // if (this.pulse && !MsgBox_pulse_css_up) { this.AddPulseCSS(); MsgBox_pulse_css_up = true; }
        // if (this.btn && !MsgBox_btn_css_up) { this.AddBtnCSS(); MsgBox_btn_css_up = true; }
        this.el = document.getElementById(input.parent_id);
        this.el.classList.add("MsgBox");
        MsgBox_n++;
        console.log(this);
        return this.Spawn();
    }
    Sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    AddBaseCSS() {
        CSS_Insert(".MsgBoxOpen",`{ animation: ScaleXY `+ this.speed/1000 + `s forwards; }`);
        CSS_Insert(".MsgBoxClose",`{ animation: DeScaleXY `+ this.speed/1000 + `s forwards; }`);
        // if (this.pulse) {
            CSS_Insert(".MsgBoxPulse",`
            {
                min-height: ` + this.min_height + `;
                transform: translate(-50%, -50%);
                width: 80%;
                padding: ` + this.padding + `;
                animation: Pulse 2s infinite;
            }`);
            CSS_AddKeyFrames("Pulse",`
            {
                0% { box-shadow: 0 0 0 0 ` + this.pulse_in_clr + `; }
                70% { box-shadow: 0 0 0 ` + this.padding + ` ` + this.pulse_out_clr + `; }
            }`);
        // }
        // if (this.btn) {
            CSS_Insert(".MsgBoxHover",`
            {
                -webkit-transition-property: color;
                transition-property: color;
                -webkit-transition-duration: 0.6s;
                transition-duration: 0.6s;
            }`);
            CSS_Insert(".MsgBoxHover:before",`
            {
                content: "";
                position: absolute;
                z-index: -1;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                border-radius: 0.33rem;
                background-color: ` + this.hover_inner_clr + `;
                color: ` + this.txt_clr + `;
                -webkit-transform: scaleX(0);
                transform: scaleX(0);
                -webkit-transition-property: transform;
                transition-property: transform;
                -webkit-transition-duration: 0.6s;
                transition-duration: 0.6s;
                -webkit-transition-timing-function: ease-out;
                transition-timing-function: ease-out;
            }`);
            CSS_Insert(".MsgBoxHover:hover, .MsgBoxHover:focus, .MsgBoxHover:active",`
            {
                color: ` + this.hover_txt_clr + `;
                border-color: ` + this.hover_border_clr + `;
            }`);
            CSS_Insert(".MsgBoxHover:hover:before, .MsgBoxHover:focus:before, .MsgBoxHover:active:before",`
            {
                -webkit-transform: scaleX(1);
                transform: scaleX(1);
            }`);
        // }
        CSS_Insert(".MsgBox",`
        {
            width: 0.00rem;
            position: relative;
            left: 50%;
            top: 50%;
            color: ` + this.txt_clr + `;
            font-size: ` + this.font_size + `;
            text-align: justify;
            text-justify: inter-character;
            background-color: ` + this.inner_clr + `;
            border-radius: 0.33rem;
            border:1px solid ` + this.border_clr + `;
            transform: translate(-50%, -50%);`
            + (this.btn ? `cursor: pointer;` : '') + `
        }`);
        CSS_AddKeyFrames("ScaleXY",`
        {
            0% { min-height: 0.00rem; }
            20% {
                min-height: ` + this.min_height + `;
                width: 0.00rem;
            }
            70% {
                min-height: ` + this.min_height + `;
                width: 0.00rem;
                padding: 0;
            }
            100% {
                min-height: ` + this.min_height + `;
                width: 80%;
                padding: ` + this.padding + `;
            }
        }`);
        CSS_AddKeyFrames("DeScaleXY",`
        {
            100% {
                min-height: 0.00rem;
            }
            80% {
                min-height: ` + this.min_height + `;
                width: 0.00rem;
            }
            30% {
                min-height: ` + this.min_height + `;
                width: 0.00rem;
                padding: 0;
            }
            0% {
                min-height: ` + this.min_height + `;
                width: 80%;
                padding: ` + this.padding + `;
            }
        }`);
    }
    Spawn() {
        this.span = document.createElement("span");
        this.span.setAttribute("id", "mb_" + MsgBox_n);
        this.el.appendChild(this.span);
    }
    Sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async Open() {
        //await sleep(500);
        this.el.classList.add("MsgBoxOpen");
        await this.Sleep(this.speed);
        if (this.pulse) {
          this.el.classList.add("MsgBoxPulse");
          this.el.classList.remove("MsgBoxOpen");
        }
        if (this.btn) { this.el.classList.add("MsgBoxHover"); }
    }
    async Close() {
        this.el.classList.remove(this.pulse ? "MsgBoxPulse" : "MsgBoxOpen");
        this.el.classList.add("MsgBoxClose");
        await this.Sleep(this.speed);
        if (this.btn) { this.el.classList.remove("MsgBoxHover"); }
        this.el.classList.remove("MsgBoxClose");
    }
}

// !async function(){
//   var mb = new MsgBox("core_tw", 1000);
//   await mb.Spawn();
//   await mb.Open();
//   var tw = new TypeWriter(mb.span.id);
//   await tw.Type("Hello World! This is a tiny message box");
//   await tw.Sleep(1000);
//   await tw.Flush();
//   tw.DeleteBar();
//   mb.Close();
// }();

/*
 * TypeWriter is an HTML type writing machine
 * it is designed to be light, self-sufficient and fast
 * it has no dependency
 * Copyright @ Paul de Renty (Edorenta) - 2018 
 */

"use strict";

const ascii = "!“#$%‘()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\"";
var tw_n = 0;
var tw_css_up = false;

// .appendAfter(element) Prototype
Element.prototype.appendAfter = function (element) {
  element.parentNode.insertBefore(this, element.nextSibling);
},false;

// CSS insertion
var DynamicStyleSheet = document.createElement('style');
var addKeyFrames = null;

document.head.appendChild(DynamicStyleSheet);

if (CSS && CSS.supports && CSS.supports('animation: name')){
    // we can safely assume that the browser supports unprefixed version.
    var CSS_AddKeyFrames = function(name, s){
        CSS_Insert("@keyframes " + name, s);
    }
} else {
    var CSS_AddKeyFrames = function(name, s){
        // Ugly and terrible, but users with this terrible of a browser
        // *cough* IE *cough* don't deserve a fast site
        var str = name + s;
        var pos = DynamicStyleSheet.length;
        DynamicStyleSheet.sheet.insertRule("@-webkit-keyframes " + str, pos);
        DynamicStyleSheet.sheet.insertRule("@keyframes " + str, pos + 1); //not sure about that, need to test
    }
}

var CSS_Insert = function(name, s){ //use to insert class/id/keyframes to DynamicStyleSheet
    var pos = DynamicStyleSheet.length;
    DynamicStyleSheet.sheet.insertRule(name + s, pos);
}

class TypeWriter {
    constructor(id, delay, bar) {
        if (tw_css_up == false) { this.AddCSSClass(); tw_css_up = true; }
        this.bar = bar;
        this.id = id;
        this.delay = delay; //ms per char
        this.el = document.getElementById(id);
        this.AddBar();
        tw_n++;
    }
    // Bar() {
    //     return ((Math.round((new Date()).getTime() / 400)) % 2 ? this.bar : " ");
    // }
    Sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    AddCSSClass() {
        CSS_Insert(".tw_blink",`
        {
            diplay: inline;
            animation: blinker 1s linear infinite;
        }`);
        CSS_AddKeyFrames("blinker",`
        {
            50% { opacity: 0; }
        }`);
    }
    async AddBar() {
        var tw_el = document.createElement('span');
        tw_el.setAttribute("id", "tw_" + tw_n);
        tw_el.classList.add("tw_blink");
        tw_el.innerHTML = this.bar;
        tw_el.appendAfter(this.el);
    }
    async Type(str) {//async?
        let n = str.length;
        let s = "";
        for (let i = 0; i < n; i++) {
            s += str[i];
            this.el.innerHTML = s; //+ this.Bar();
            await this.Sleep(this.delay); //could also use setTimeout
        }
        this.el.innerHTML = str;
    }
    async DecodeType(str) {//async?
        let ascii_len = ascii.length;
        let x = 5; //random rounds
        let n = str.length;
        let s = "";
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < x; j++) {
                this.el.innerHTML = s + ascii[Math.floor(Math.random() * 94)];
                await this.Sleep(this.delay / 6);
            }
            s += str[i];
            this.el.innerHTML = s;// + this.Bar();
            await this.Sleep(this.delay / 6); //could also use setTimeout
        }
        this.el.innerHTML = str;
    }
    async Flush() {
        let str = this.el.innerHTML
        let n = str.length;
        let s = str;
        for (let i = 0; i < n + 1; i++) {
            s = str.substring(0, str.length - i);
            this.el.innerHTML = s;// + this.Bar();
            await this.Sleep(this.delay / 4); //could also use setTimeout
        }
        this.el.innerHTML = "";
    }
    async DecodeFlush() {
        let ascii_len = ascii.length;
        let x = 5; //random rounds
        let str = this.el.innerHTML
        let n = str.length;
        let s = str;
        for (let i = 0; i < n + 1; i++) {
            for (let j = 0; j < x; j++) {
                this.el.innerHTML = s + ascii[Math.floor(Math.random() * 94)];// + this.Bar();
                await this.Sleep(this.delay / 6);
            }
            s = str.substring(0, str.length - i);
            this.el.innerHTML = s;// + this.Bar();
            await this.Sleep(this.delay / 3); //could also use setTimeout
        }
        this.el.innerHTML = "";
    }
    async MultiType(str_array, loop_enabled) {
        while (true) {
            let n = str_array.length;
            for (let i = 0; i < n; i++) {
                await this.Type(str_array[i]);
                if (loop_enabled || (i != n - 1)) {
                    await this.Sleep(str_array[i].length * 50 + 500);
                    await this.Flush();
                }
                await this.Sleep(500);
            }
            if (!loop_enabled) {
                break;
            }
        }
    }
}

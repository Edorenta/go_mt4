/*
 * TypeFader is an HTML type writing machine
 * it is designed to be light, self-sufficient and fast
 * it has no dependency
 * Copyright @ Paul de Renty (Edorenta) - 2018 
 */

"use strict";

var TypeFader_css_up = false;
var fader_delay = null;

// // CSS insertion
// var DynamicStyleSheet = document.createElement('style');
// var addKeyFrames = null;

// document.head.appendChild(DynamicStyleSheet);

// if (CSS && CSS.supports && CSS.supports('animation: name')){
//     // we can safely assume that the browser supports unprefixed version.
//     var CSS_AddKeyFrames = function(name, s){
//         CSS_Insert("@keyframes " + name, s);
//     }
// } else {
//     var CSS_AddKeyFrames = function(name, s){
//         // Ugly and terrible, but users with this terrible of a browser
//         // *cough* IE *cough* don't deserve a fast site
//         var str = name + s;
// 		var pos = DynamicStyleSheet.length;
//         DynamicStyleSheet.sheet.insertRule("@-webkit-keyframes " + str, pos);
//         DynamicStyleSheet.sheet.insertRule("@keyframes " + str, pos + 1); //not sure about that, need to test
//     }
// }

// var CSS_Insert = function(name, s){ //use to insert class/id/keyframes to DynamicStyleSheet
//     var pos = DynamicStyleSheet.length;
//     DynamicStyleSheet.sheet.insertRule(name + s, pos);
// }

class TypeFader {
    constructor(id, delay) {
        if (fader_delay == null) { fader_delay = delay || 2000; }
        this.delay = fader_delay; //ms per char

      if (TypeFader_css_up == false) { this.AddCSSClass(); TypeFader_css_up = true; }
        this.id = id;
        this.el = document.getElementById(id);
    }
    // Bar() {
    //     return ((Math.round((new Date()).getTime() / 400)) % 2 ? this.bar : " ")
    // }
    Sleep(ms) {
    	return new Promise(resolve => setTimeout(resolve, ms));
	}
    AddCSSClass() {
        CSS_Insert(".fade_in",`
        {
            diplay: inline;
            animation: fade_in ` + this.delay / 1000 + `s;
        }`);
        CSS_AddKeyFrames("fade_in",`
        {
            from { opacity: 0; }
            to { opacity: 1; }
            0% { opacity: 0; }
            15% { opacity: 1; }
        }`);
        CSS_Insert(".fade_out",`
        {
            diplay: inline;
            animation: fade_out ` + this.delay / 1000 + `s;
        }`);
        CSS_AddKeyFrames("fade_out",`
        {
            from { opacity: 1; }
            to { opacity: 0; }
            0% { opacity: 1; }
            15% { opacity: 0; }
        }`);
    }
    async FadeIn() {
        this.el.classList.remove("fade_out");
        this.el.classList.add("fade_in");
    }
    async FadeOut() {
        this.el.classList.remove("fade_in");
        this.el.classList.add("fade_out");
    }
    async MultiType(str_array, loop_enabled) {
    	let looped = false;
        while (true) {
            let n = str_array.length;
            for (let i = 0; i < n; i++) {
                if (looped || i > 0) { this.FadeOut(); await this.Sleep(this.delay*0.15); }
                this.el.innerHTML = str_array[i];
                if (looped || i > 0) { this.FadeIn(); await this.Sleep(this.delay*0.85); }
                if (loop_enabled || (i != n - 1)) {
	                await this.Sleep(this.delay);
                }
            }
            if (!loop_enabled) {
                break;
            } else { looped = true; }
        }
    }
}

/*
 * TypeWriter is an HTML type writing machine
 * it is designed to be light, self-sufficient and fast
 * it has no dependency
 * Copyright @ Paul de Renty (Edorenta) - 2018 
 */

"use strict";

var TypeWriter_n = 0;
var TypeWriter_css_up = false;

// // .appendAfter(element) Prototype
// Element.prototype.appendAfter = function (element) {
//   element.parentNode.insertBefore(this, element.nextSibling);
// },false;

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
//         var pos = DynamicStyleSheet.length;
//         DynamicStyleSheet.sheet.insertRule("@-webkit-keyframes " + str, pos);
//         DynamicStyleSheet.sheet.insertRule("@keyframes " + str, pos + 1); //not sure about that, need to test
//     }
// }

// var CSS_Insert = function(name, s){ //use to insert class/id/keyframes to DynamicStyleSheet
//     var pos = DynamicStyleSheet.length;
//     DynamicStyleSheet.sheet.insertRule(name + s, pos);
// }

class TypeWriter {
    constructor(id, delay, bar) {
        if (TypeWriter_css_up == false) { this.AddCSSClass(); TypeWriter_css_up = true; }
        this.bar = bar || "▌";
        this.delay = delay || 60; //ms per char
        this.id = id;
        this.el = document.getElementById(id);
        this.focus = this.el;
        this.AddBar();
        TypeWriter_n++;
    }
    // Bar() {
    //     return ((Math.round((new Date()).getTime() / 400)) % 2 ? this.bar : " ");
    // }
    Sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    AddCSSClass() {
        CSS_Insert(".TypeWriter",`
        {
            diplay: inline;
            animation: TypeWriterBlinker 1s linear infinite;
        }`);
        CSS_AddKeyFrames("TypeWriterBlinker",`
        {
            50% { opacity: 0; }
        }`);
    }
    async AddBar() {
        this.bar_span = document.createElement('span');
        this.bar_span.setAttribute("id", "tw_" + TypeWriter_n);
        this.bar_span.classList.add("TypeWriter");
        this.bar_span.innerHTML = this.bar;
        this.bar_span.appendAfter(this.el);
    }
    async DeleteBar() {
      this.bar_span.remove();
    }
    async Type(str) {//async?
        let n = str.length;
        let s = this.focus.innerHTML;
        for (let i = 0; i < n; i++) {
            s += str[i];
            this.focus.innerHTML = s;
            await this.Sleep(this.delay);
        }
        // this.focus.innerHTML = str;
    }
    async Add(str) {
        this.focus.innerHTML += str;
    }
    async TypeSpan(str,style) {
        var style_span = document.createElement('span');
        style_span.setAttribute("style", style);
        this.el.appendChild(style_span);
        this.focus = style_span;
        await this.Type(str);
        this.focus = this.el;
    }
    async TypeClr(lst, bold) {
        for (let i = 0; i < lst.length; i++) {
            if (lst[i][0] !== undefined && lst[i][0] != null && lst[i][0] != "") {
                await this.TypeSpan(lst[i][1], ((bold == true ? "font-weight: bold;" : "") + "color:" + lst[i][0]));
            } else {
                await this.Type(lst[i][1]);
            }
        }
    }
    async Flush() {
        let str = this.focus.innerHTML
        let n = str.length;
        let s = str;
        for (let i = 0; i < n + 1; i++) {
            s = str.substring(0, str.length - i);
            this.focus.innerHTML = s;// + this.Bar();
            // await this.Sleep(10); //gets stuck in animation loop...
        }
        this.focus.innerHTML = "";
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

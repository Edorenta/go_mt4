"use strict";

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

// HTML insertion
// .appendBefore(element) Prototype
Element.prototype.appendBefore = function (element) {
  element.parentNode.insertBefore(this, element);
},false;

// .appendAfter(element) Prototype
Element.prototype.appendAfter = function (element) {
  element.parentNode.insertBefore(this, element.nextSibling);
},false;

// document.ready
  function DocReady(f) { //calling document.ready()
  if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
    f();
  } else {
    document.addEventListener("DOMContentLoaded", f);
  }
};
// JS utilities
//var browser = (navigator.userAgent.toLowerCase().match(/(chrome|safari|firefox)/) || [null])[0];
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//relies on SVGJS
async function svg_spin(s){
  var i = 0;
  while (true) {
    s.rotate(i, 0, 0);
    i == 359 ? i = 0 : i++;
    await sleep(20);
  }
}

//relies on SVGJS
async function svg_pulse(s, base_scale){
  var i = 0;
  while (true) {
    while (i < 0.2) {
      s.scale(base_scale + i, 0, 0); i += 0.005;
      await sleep(18);
    }
    while (i > 0) {
      s.scale(base_scale + i, 0, 0); i -= 0.005;
      await sleep(18);
    }
  }
}

function RemToPixels(rem) {    
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

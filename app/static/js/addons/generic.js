"use strict";

// document.ready
function DocReady(f) { //calling document.ready()
  if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
    f();
  } else {
    document.addEventListener("DOMContentLoaded", f);
  }
};

// edge svg transform fix: ????
void(new MutationObserver(function(muts) {
  for(var i = muts.length; i--;) {
    var mut = muts[i], objs = mut.target.querySelectorAll('foreignObject');
    for(var j = objs.length; j--;) {
        var obj = objs[j];
        var val = obj.style.display;
        obj.style.display = 'none';
        obj.getBBox();
        obj.style.display = val;
    }
  }
}).observe(document.documentElement, { attributes: true, attributeFilter: ['transform'], subtree: true }));

// browser detection (consistent / non usual)
var DomainName = window.location.hostname;
var BrowserName = function() {
  if (!!window.chrome && !!window.chrome.webstore) {
    return "chrome";
  } // Chrome 1+
  if (/constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification))) {
    return "safari";
  } // Safari 3.0+ "[object HTMLElementConstructor]"
  if (typeof InstallTrigger !== 'undefined') {
    return "firefox";
  } // Firefox 1.0+ 
  if ((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) {
    return "opera";
  } // Opera 8.0+
  if (!isIE && !!window.StyleMedia) {
    return "edge";
  } // Edge 20+
  if (/*@cc_on!@*/false || !!document.documentMode) {
    return "ie";
  } // Internet Explorer 6-11
  return undefined;
  ///if ((isChrome || isOpera) && !!window.CSS; // Blink engine detection
}

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

// JS utilities
//var browser = (navigator.userAgent.toLowerCase().match(/(chrome|safari|firefox)/) || [null])[0];
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var Overlay = {}; // Overlay
var Gesture = {
  // touch start / end
  start_x : 0,
  start_y : 0,
  end_x : 0,
  end_y : 0,
  Rec : ""
}; // Gesture
!function() {
  DocReady(function() {
    Overlay.el = document.querySelector(".overlay");
    if (Overlay.el) {
      Overlay.On = function() { Overlay.el.style.display = "block"; }
      Overlay.Off = function() { Overlay.el.style.display = "none"; }
      Overlay.Toggle = function() {
        if (Overlay.el.style.display() == "block") { Overlay.Off() } else { Overlay.On(); }
      }
      Gesture.el = Overlay.el; // link swipe detector to overlay zone (100vw x 100vh)
      Gesture.Handle = function(_x1, _x2, _y1, _y2) {
        const { _w, _h } = Gesture.el.getBoundingClientRect();
        let is_callback = (typeof Gesture.Swipe === 'function');
        let x_ratio = (Math.abs(_x2 - _x1) / _w);
        let y_ratio = (Math.abs(_y2 - _y1) / _h);
        if (x_ratio > y_ratio && x_ratio > 0.25) {
          // Gesture.Rec = "swipe-right";
            if (is_callback) Gesture.Swipe("right");
        }
        if (y_ratio > x_ratio && y_ratio > 0.25) {
          // Gesture.Rec = "swipe-down";
            if (is_callback) Gesture.Swipe("down");
        }
        if (x_ratio < y_ratio && x_ratio < -0.25) {
          // Gesture.Rec = "swipe-left";
            if (is_callback) Gesture.Swipe("left");
        }
        if (y_ratio < x_ratio && y_ratio < -0.25) {
          // Gesture.Rec = "swipe-up";
            if (is_callback) Gesture.Swipe("up");
        }
      }
      Gesture.el.addEventListener('touchstart', function(e) {
          Gesture.start_x = e.changedTouches[0].screenX;
          Gesture.start_y = e.changedTouches[0].screenY;
      }, false);
      Gesture.el.addEventListener('touchend', function(e) {
          Gesture.end_x = e.changedTouches[0].screenX;
          Gesture.end_y = e.changedTouches[0].screenY;
          Gesture.Handle(Gesture.start_x, Gesture.start_y, Gesture.end_x, Gesture.end_y);
      }, false); 
    }
  });
}();

//relies on SVGJS
async function svg_spin(s, speed){
  s.animate(speed || 5000,'-',0).rotate(360,0,0).loop(); //heavier than home made..
  // var i = 0;
  // while (true) {
  //   s.rotate(i, 0, 0);
  //   i == 359 ? i = 0 : i++;
  //   await sleep(20);
  // }
}

async function svg_pulse(s, base_scale, scale_factor, speed){
  var scale_f = (scale_factor && scale_factor > 1 && scale_factor < 5) ? scale_factor : 1.5;
  var _grow = function() { s.animate(speed || 2000,'<>',0).scale(base_scale*scale_f,0,0).after(_reduce); }
  var _reduce = function() { s.animate(speed || 2000,'<>',0).scale(base_scale,0,0).after(_grow); }
  _grow();
  // var i = 0;
  // while (true) {
  //   while (i < 0.2) {
  //     s.scale(base_scale + i, 0, 0); i += 0.005;
  //     await sleep(18);
  //   }
  //   while (i > 0) {
  //     s.scale(base_scale + i, 0, 0); i -= 0.005;
  //     await sleep(18);
  //   }
  // }
}

async function svg_blink(s, color, speed){
  var base_color = s.attr("fill"); console.log(base_color, color);
  var _color_in = function() { s.animate(speed || 2000, '<>', 0).fill(color).after(_color_out); }
  var _color_out = function() { s.animate(speed || 2000, '<>', 0).fill(base_color).after(_color_in); }
  color_in();
}

//graphical
function RemToPixels(rem) {    
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}
//p5.js specific
function SetPixRGBA(ctx, x, y, rgba) {
  var d = ctx.pixelDensity();
  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      let idx = 4 * ((y * d + j) * ctx.width * d + (x * d + i));
      ctx.pixels[idx] = rgba[0];
      ctx.pixels[idx+1] = rgba[1];
      ctx.pixels[idx+2] = rgba[2];
      ctx.pixels[idx+3] = rgba[3];
    }
  }
}

function GetPixRGBA(ctx, x, y) {
  // console.log(ctx.pixels);
  let d = ctx.pixelDensity();
  let idx = Math.floor(4 * ((y * d) * ctx.width * d + (x * d)));
  return ([ctx.pixels[idx],ctx.pixels[idx+1],ctx.pixels[idx+2],ctx.pixels[idx+3]]);
}

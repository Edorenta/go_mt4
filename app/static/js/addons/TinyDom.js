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
var VisitorID = "";
var QueryParams = null;

!function() {
  DocReady(function() {
    QueryParams = new URL(decodeURIComponent(document.location)).searchParams;
    VisitorID = document.getElementById("visitor_id").textContent;
    // console.log("visitor id: " + visitor_id)
    Overlay.el = document.querySelector(".overlay");
    if (Overlay.el) {
      Overlay.On = function() { Overlay.el.style.display = "block"; }
      Overlay.Off = function() { Overlay.el.style.display = "none"; }
      Overlay.Toggle = function() {
        if (Overlay.el.style.display() == "block") { Overlay.Off() } else { Overlay.On(); }
      }
      Gesture.Listen = function(el_id) {
        Gesture.el = document.querySelector(el_id);
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
      Gesture.Listen(".overlay");
      // let _dim = Gesture.el.getBoundingClientRect();
      // console.log("dim:",_dim);
      Gesture.Handle = async function(_x1, _y1, _x2, _y2) {
        let is_callback = (typeof Gesture.Swipe === 'function');
        let x_ratio = ((_x2 - _x1) / Gesture.el.offsetWidth);
        let y_ratio = -((_y2 - _y1) / Gesture.el.offsetHeight);
        // console.log(Gesture.w, Gesture.h, "xr:",x_ratio,"yr",y_ratio);
        if (Math.abs(x_ratio) > Math.abs(y_ratio) && x_ratio > 0.05) {
          // Gesture.Rec = "swipe-right";
            if (is_callback) Gesture.Swipe("right");
        }
        if (Math.abs(x_ratio) < Math.abs(y_ratio) && y_ratio > 0.05) {
          // Gesture.Rec = "swipe-down";
            if (is_callback) Gesture.Swipe("up");
        }
        if (Math.abs(x_ratio) > Math.abs(y_ratio) && x_ratio < -0.05) {
          // Gesture.Rec = "swipe-left";
            if (is_callback) Gesture.Swipe("left");
        }
        if (Math.abs(x_ratio) < Math.abs(y_ratio) && y_ratio < -0.05) {
          // Gesture.Rec = "swipe-up";
            if (is_callback) Gesture.Swipe("down");
        }
      }
    }
  });
}();

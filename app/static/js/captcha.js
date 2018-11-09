var win;
// var svg_bar_getter;
// var svg_P_getter;
// var svg_P;
// var svg_bar;
// var cookie_scale_factor;
// var cookie_getter;
// var svg_cookie;
// var logo_scale_factor;

!function(){ DocReady(init) }();

function init() {
  win = {
    w : Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
    h : Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
  };
  win.landscape = (win.w > win.h);
  init_logo();
}

async function init_captcha() {
  var cookie_scale_factor = 0.15 * (win.landscape ? win.h : win.w) / 100;

  var cookie_getter = SVG('cookie_div').size(100,100);
  var svg_cookie = cookie_getter.svg(
  `<path fill-rule="evenodd" d="M47.42 5.07C23.21 6.74 5.01 26.01 5 49.98c-.01 33.45 35.22 55.18 65.17 40.19 16.26-8.14 26.43-26.23 24.62-43.78-.21-2.06-1.65-2.75-3.62-1.73-4.2 2.16-8.59.73-10.55-3.45-.7-1.5-1.9-1.98-3.23-1.3-5.87 3.04-13.03 1.24-16.65-4.17-2.61-3.9-2.9-8.77-.79-13.01.78-1.55.39-2.62-1.25-3.41-4.12-1.98-5.55-6.26-3.47-10.38.86-1.72.66-2.87-.62-3.5-.67-.34-4.71-.55-7.19-.37zm29.35.06c-3.2.84-4.34 4.85-2.02 7.17 3.03 3.04 8.15.28 7.26-3.92-.49-2.3-2.97-3.84-5.24-3.25zM50.82 9.49c-.02.08-.19.53-.37.99-.52 1.38-.58 1.71-.47 2.89.3 3.31 2.26 6.45 5.25 8.43.42.28.42.22.08 1.12-2.73 7.25-.06 15.41 6.51 19.87 4.56 3.09 9.96 3.74 15.22 1.85.46-.17.85-.28.88-.25.03.03.23.3.44.59 2.06 2.84 4.84 4.58 7.9 4.96 1.33.16 1.89.07 3.44-.53.48-.18.89-.32.9-.31.05.05 0 2.88-.06 3.77-1.77 24.03-23.69 41.22-47.44 37.2C21.38 86.4 6.53 65.97 9.69 44.11 12.55 24.33 29.48 9.53 49.46 9.35l1.41-.01-.05.15zM73.6 22.31c-2.78.95-3.01 4.71-.36 5.96 1.92.92 4.24-.34 4.54-2.46.33-2.34-1.96-4.26-4.18-3.5zm-31.97 6.36c-2.06.55-3.05 3.04-1.91 4.81 1.81 2.82 6.06 1.47 5.93-1.88-.08-2.02-2.06-3.46-4.02-2.93zm50.42.03c-1.17.45-1.72 1.84-1.17 2.95.94 1.88 3.65 1.49 4.05-.58.3-1.58-1.37-2.95-2.88-2.37zM27.24 39.39c-5.59 1.2-7.01 8.51-2.26 11.67 4 2.67 9.37.16 9.95-4.65.51-4.26-3.5-7.92-7.69-7.02zm20.67 8.6c-2.29.73-3 3.64-1.3 5.34 1.56 1.57 4.26 1.09 5.19-.91 1.18-2.52-1.23-5.27-3.89-4.43zM31.79 62.93c-2.76.67-4.12 3.91-2.66 6.38 1.59 2.69 5.52 2.79 7.26.19 2.14-3.23-.83-7.48-4.6-6.57zm28.65 2.19c-4.9 1.31-5.52 7.96-.93 10.08 4.1 1.89 8.62-1.94 7.41-6.29-.77-2.77-3.76-4.52-6.48-3.79z"/>`).id("svg_cookie"); //add id?
  svg_cookie.fill("#66fcf1");
  // svg_cookie.cx = 50;
  // svg_cookie.cy = 50;
  svg_cookie.click(function() {
  	window.location.replace(/*URI + */"/home"); //redirect on click to homepage
  })
  svg_cookie.mouseover(function() {
    this.fill("#fcad0f"); //color to orange
  })
  svg_cookie.mouseout(function() {
    this.fill("#66fcf1"); //color back to blue
  })
  var cookie_div = document.getElementById("cookie_div");
  var max_x = (win.landscape ? (win.w / 2) : win.w)*0.98 - 100;//100*scale_factor; padding of 2%
  var max_y = (win.landscape ? win.h : (win.h / 2))*0.98 - 100;//100*scale_factor; padding of 2%
  var rnx = null;
  var rny = null;
  while ((rnx < (max_x * 15/100)) || ((rnx > max_x * 85/100))) {
    rnx = Math.floor(Math.random()*max_x);
  }
  while ((rny > max_y * 28/100 && rny < max_y * 72/100)
  			|| (rny < max_y * 2/100) || (rny > max_y * 92/100)) {
    rny = Math.floor(Math.random()*max_y);
  }
  cookie_div.style.left = (/*50 + */rnx + 'px');
  cookie_div.style.top = (/*50 + */rny + 'px');
  svg_cookie.scale(cookie_scale_factor*2, 0, 0);
  svg_cookie.animate(600, '>', 0).scale(cookie_scale_factor, 0, 0);
  // cookie_div.style.left = 50 + 'px';
  // cookie_div.style.top = 50 + 'px';
  svg_spin(svg_cookie);
  // svg_blink(svg_cookie, "#fcad0f");
//  svg_pulse(svg_cookie, cookie_scale_factor);
  console.log("rnx: " + rnx, "rny: " + rny, "max_x: " + max_x, "max_y: " + max_y, svg_cookie, cookie_scale_factor);
}

async function init_logo() {
  var logo_scale_factor = 0.45 * (win.landscape ? win.h : win.w) / 100;
  var svg_bar_getter = SVG('logo_div').size(100,100);
  var svg_P_getter = SVG('logo_div').size(100,100);
  var svg_P = svg_P_getter.svg(
  //`<g clip-path="url(#b)"><path fill="#0F0" fill-rule="evenodd" d="M47.42 5.07C23.21 6.74 5.01 26.01 5 49.98c-.01 33.45 35.22 55.18 65.17 40.19 16.26-8.14 26.43-26.23 24.62-43.78-.21-2.06-1.65-2.75-3.62-1.73-4.2 2.16-8.59.73-10.55-3.45-.7-1.5-1.9-1.98-3.23-1.3-5.87 3.04-13.03 1.24-16.65-4.17-2.61-3.9-2.9-8.77-.79-13.01.78-1.55.39-2.62-1.25-3.41-4.12-1.98-5.55-6.26-3.47-10.38.86-1.72.66-2.87-.62-3.5-.67-.34-4.71-.55-7.19-.37zm29.35.06c-3.2.84-4.34 4.85-2.02 7.17 3.03 3.04 8.15.28 7.26-3.92-.49-2.3-2.97-3.84-5.24-3.25zM50.82 9.49c-.02.08-.19.53-.37.99-.52 1.38-.58 1.71-.47 2.89.3 3.31 2.26 6.45 5.25 8.43.42.28.42.22.08 1.12-2.73 7.25-.06 15.41 6.51 19.87 4.56 3.09 9.96 3.74 15.22 1.85.46-.17.85-.28.88-.25.03.03.23.3.44.59 2.06 2.84 4.84 4.58 7.9 4.96 1.33.16 1.89.07 3.44-.53.48-.18.89-.32.9-.31.05.05 0 2.88-.06 3.77-1.77 24.03-23.69 41.22-47.44 37.2C21.38 86.4 6.53 65.97 9.69 44.11 12.55 24.33 29.48 9.53 49.46 9.35l1.41-.01-.05.15zM73.6 22.31c-2.78.95-3.01 4.71-.36 5.96 1.92.92 4.24-.34 4.54-2.46.33-2.34-1.96-4.26-4.18-3.5zm-31.97 6.36c-2.06.55-3.05 3.04-1.91 4.81 1.81 2.82 6.06 1.47 5.93-1.88-.08-2.02-2.06-3.46-4.02-2.93zm50.42.03c-1.17.45-1.72 1.84-1.17 2.95.94 1.88 3.65 1.49 4.05-.58.3-1.58-1.37-2.95-2.88-2.37zM27.24 39.39c-5.59 1.2-7.01 8.51-2.26 11.67 4 2.67 9.37.16 9.95-4.65.51-4.26-3.5-7.92-7.69-7.02zm20.67 8.6c-2.29.73-3 3.64-1.3 5.34 1.56 1.57 4.26 1.09 5.19-.91 1.18-2.52-1.23-5.27-3.89-4.43zM31.79 62.93c-2.76.67-4.12 3.91-2.66 6.38 1.59 2.69 5.52 2.79 7.26.19 2.14-3.23-.83-7.48-4.6-6.57zm28.65 2.19c-4.9 1.31-5.52 7.96-.93 10.08 4.1 1.89 8.62-1.94 7.41-6.29-.77-2.77-3.76-4.52-6.48-3.79z"/></g></g>
  //`).id('svg_P');
  `<path d="M26 97l-1-36h25q10 0 0 0c17 0 36-5 35-30C85 9 69 0 50 0H15a3 3 0 0 0-3 3v8h39c6 0 12 1 16 5s6 9 6 15c0 5-2 11-6 14-5 4-11 5-17 5H15c-2 0-3 1-3 3v44c0 2 1 3 3 3h8c1 0 3-1 3-3z" fill="#0B0C10"/>`).id('svg_P');
  //svg_P.cx = 50;
  //svg_P.cy = 50;
  svg_P.attr({ /*fill: "#0F0", */transform: "translate(-50,-50)" });
  svg_P.scale(logo_scale_factor*2, 0, 0);
  svg_P.animate(750, '>', 0).scale(logo_scale_factor, 0, 0);
//  svg_P.animate(2000, '<', 1000).attr({ fill: '#000' })
  init_core_tw();
  await sleep(1500);
  var svg_bar = svg_bar_getter.svg(
  `<linearGradient id="b" x1="0" y1="0" x2="0" y2="1" gradientTransform="matrix(77 0 0 89 12 11)" gradientUnits="userSpaceOnUse">
    <stop offset="5%" stop-opacity="0" stop-color="#0B0C10"/>
    <stop offset="50%" stop-opacity="0.5" stop-color="#0B0C10"/>
    <stop offset="65%" stop-opacity="0.8" stop-color="#0B0C10"/>
    <stop offset="80%" stop-opacity="1" stop-color="#0B0C10"/>
  </linearGradient><path d="M72.8 97.9L12 11h14.5l62.2 86.9c1 1.3.4 2.4-1.2 2.4H77.4c-1.6 0-3.7-1-4.6-2.4z" fill="url(#b)"/>`).id('svg_bar');
  //svg_bar.animate({ ease: '<', delay: '1.5s' }).attr({ fill: '#000' });
  //svg_logo.fill("rgb(0,255,0)");
  //svg_logo.stroke("rgb(0,255,0)");
  //svg_logo.width(200);
  //svg_logo.height(40);
  //svg_bar.cx = 50;
  //svg_bar.cy = 50;
  svg_bar.attr({ transform: "translate(-50,-50)" });
  svg_bar.scale(logo_scale_factor*2, 0, 0);
  svg_bar.animate(600, '>', 0).scale(logo_scale_factor, 0, 0);
  /*
  svg_bar.attr({
  viewBox: "0 0 200 200",
  preserveAspectRatio: "xMidYMid meet",
  width: 200,
  height: 200
})
*/
  await sleep(600);
  svg_pulse(svg_P, logo_scale_factor, 1.15);
  svg_pulse(svg_bar, logo_scale_factor, 1.15);
}

async function init_core_tw() {
  var tw1 = new TypeWriter("core", 20, "▌");
  // var tw1 = new TypeFader("core", 1500);
  await tw1.MultiType(["                                        Welcome."
  										,"Please click on the cookie to proceed.*"]
  										, false);
  init_captcha();
  init_cookie_policy_tw();
  // await sleep(2500);
  // await tw1.Flush();
  // document.getElementById("core").classList.add("hidden");
}

async function init_cookie_policy_tw() {
  var tw2 = new TypeFader("cookie_policy", 2000);
  await tw2.MultiType(["* By proceeding you agree to the site's cookie policy."
                      ,"* The data collected about visitors is anonymous."
                      ,"* This data helps me to know more about the site's audience."]
                      , true);
  // await sleep(2500);
  // await tw2.Flush();
  // document.getElementById("cookie_policy").classList.add("hidden");
}

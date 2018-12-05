"use strict";

const generic_style =
`   position: absolute;
    z_index: 20;
    height: 0%;
    width: 80%;
    left: 10%;
    top: 33%;
    margin: auto;
    display: grid;
    justify-items: center;
    align-items: center;`;
var spawn = null;
var win = null;
var mb = null;
var tw = null;
var hit_lock = false;
var logo = [];

!function(){ DocReady(init) }();

function init() {
    win = {
        w : Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        h : Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
    };
    win.landscape = (win.w > win.h);
	spawn = document.createElement("div");
	spawn.setAttribute("style", generic_style);
    Underlay.el.style.zIndex = "0";
    Underlay.el.appendChild(spawn);
    init_mb();
    pop_menu();
}	

async function init_mb() {
    mb = new MsgBox({
        parent_id : "_center",
        max_width : win.ratio > 1 ? "60%" : "90%",
        speed : 800,
        pulse : true,
        button : true,
        // inner_clr : "rgba(0,0,0,0.5)",
        txt_clr : "rgba(255,255,255,1)",
        font_size : 1
    });
    await mb.Open();
    tw = new TypeWriter(mb.span.id, 15);
    // await tw.TypeClr([ [, "Welcome "],["#00ffff", player_id],[, "!"] ], false);
    // await tw.Add("<br>");
    await tw.TypeClr([ [," Use "],["#ff0000", "←→"],[, " to control the plane and chose the side of me you want to "],["#00ff00", "explore"],
                      [, ". Else You can just "],["#ff0000", "click"],[, " to navigate!"] ], false);
    await tw.Add("<br>");
    await tw.TypeClr([ ["#00ffff","Click"],[," here to "],["#00ffff","hide"] ], false);
    // await tw.Sleep(3000);
    // tmp = mb.span.innerHTML;
    // console.log(tmp);
    mb.el.addEventListener('click', async function(){
        // Overlay.Off();
        await tw.Flush();
        tw.DeleteBar();
        await mb.Close();
        mb.span.innerHTML = "";
        // mb.el.classList.remove("MsgBox");
    });
}

async function pop_menu() {
    spawn.setAttribute("style", generic_style +
`   grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 100% 100% 100%;
    grid-column-gap: 5%;
    grid-row-gap: 5%;`);
    spawn.innerHTML =
`   <div id="interpersonal"></div>
    <div id="technical"></div>
    <div id="exotic"></div>`; // "what side of me do would you explore?"
    await sleep(1000);
    await init_logo("#interpersonal","interpersonal",100,100);
    await sleep(200);
    await init_logo("#technical","ui",100,100);
    await sleep(200);
    await init_logo("#exotic","analytics",100,100);
    item_hover(logo[1]);
}

async function init_logo(_div_id,_svg_id,_width,_height/*,_markup*/) {
  let _logo = new TinySVG({
    parent_id: _div_id,
    id: _svg_id,
    w: _width,
    h: _height,
    // scale: (0.075 * (win.landscape ? win.h : win.w) / 100)*3,
    scale: (0.05 * (win.h + win.w) / 100)*3,
    fill: "#ffffff",
    display : "grid",
    core: ""/*_markup*/
  });
  let n = logo.length;
  _logo.OnMouseOver(function() {
    // console.log("ok");
    item_hover(_logo);
  });
  _logo.OnMouseOut(function() {
    crosshair_hover_reset();
  });
  _logo.OnClick(async function() {
    if (starship.target != n) {
        await starship.MoveTo(n);
        await starship.Fire();
        // console.log("clicked on", n);
    }
    change_view(_logo.id);
  });
  _logo.Spawn();
  _logo.Scale(0.33, 300);
  _logo.hover = false;
  await sleep(500);
  logo[n] = _logo;
  // console.log("+1");
}

function item_hover(_logo) {
    if (!_logo.hover) {
        _logo.hover = true;
        _logo.Fill("#fcad0f");
        _logo.Scale(2/*, 100*/);
    }
    // console.log(idx);
}

function crosshair_hover(idx) {
    item_hover(logo[idx]);
    // console.log(idx);
}

function crosshair_hover_reset() {
    for (let i = 0; i < logo.length; i++) {
        if (logo[i].hover == true) {
            logo[i].Fill("#ffffff");
            logo[i].Scale(1/2/*, 100*/);
            logo[i].hover = false;
        }
    }
}

async function laser_hit(idx) {
    // console.log("hit_lock:", hit_lock);
    hit_lock = true;
    if (logo[idx]) {
        let click = logo[idx].el.dispatchEvent(MouseClick); // if false, click was canceled. here is simulated so no failure possible
    }
}

function change_view(id) {
    console.log("view change:", id);
}
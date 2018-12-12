"use strict";

const generic_logos_style =
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
const generic_caption_style =
`   font-family: "play-regular";
    position: absolute;
    z_index: 20;
    height: 0%;
    width: 100%;
    left: 0%;
    top: 12%;
    margin: auto;
    display: grid;
    justify-items: center;
    align-items: center;`;
var spawn = null;
var caption = null;
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
	caption = document.createElement("div");
    spawn.setAttribute("style", generic_logos_style);
	caption.setAttribute("style", generic_caption_style);
    caption.classList.add("text-h2");
    caption.classList.add("has-text-warning");
    caption.innerHTML = "- - -";
    Underlay.el.style.zIndex = "0";
    Underlay.el.appendChild(spawn);
    Underlay.el.appendChild(caption);
    //init_mb();
    starship.target = 1;
    change_view("home");
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

async function pop_items(item_names, svgs_names) {
    logo = [];
    spawn.setAttribute("style", generic_logos_style +
`   grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 100% 100% 100%;
    grid-column-gap: 5%;
    grid-row-gap: 5%;`);
    spawn.innerHTML =
`   <div id="` + item_names[0] + `"></div>
    <div id="` + item_names[1] + `"></div>
    <div id="` + item_names[2] + `"></div>`; // "what side of me do would you explore?"
    //await sleep(1000);
    // console.log(item_names, svgs_names);
    for (let i = 0; i < item_names.length; i++) {
        await init_logo("#" + item_names[i],svgs_names[i],100,100);
        // await sleep(200);
    }
    if (starship && starship.target != null) {
        item_hover(starship.target);
    }
}

async function init_logo(_div_id,_svg_id,_width,_height/*,_markup*/) {
    // console.log(_svg_id);
  let _logo = new TinySVG({
    parent_id: _div_id,
    id: _svg_id,
    w: _width,
    h: _height,
    // scale: (0.075 * (win.landscape ? win.h : win.w) / 100)*3,
    scale: (0.05 * (win.h + win.w) / 100)*3,
    fill: _svg_id.includes("flag") ? "#000000" : "#ffffff",
    display : "grid",
    core: ""/*_markup*/
  });
  let n = logo.length;
  _logo.OnClick(async function() {
    starship.MoveTo(n);
    change_view(_logo.parent_id.substring(1, _logo.parent_id.length));
  });
  await _logo.Spawn();
  await _logo.Scale(0.33, 300);
  _logo.hover = false;
  // await sleep(500);
  logo[n] = _logo;
  _logo.OnMouseOver(function() {
    // console.log("ok");
    item_hover(_logo);
  });

  _logo.OnMouseOut(function() {
    crosshair_hover_reset();
  });
  // console.log("+1");
}

function item_hover(_logo) {
    if (_logo) {
        if (!_logo.hover) {
            _logo.hover = true;
            if (!_logo.id.includes("flag")) { _logo.Fill("#fcad0f"); }
            _logo.Scale(2/*, 100*/);
        }
        console.log(_logo.parent_id);
        let tmp = _logo.parent_id.replace("_", " ");
        if (_logo.parent_id == "#CPP") { caption.innerHTML = "C/C++"; }
        else if (_logo.parent_id == "#CS") { caption.innerHTML = "C#"; }
        else { caption.innerHTML = tmp.substring(1,tmp.length).capitalize(); }
        // console.log(idx);
    }
}

function crosshair_hover(idx) {
    item_hover(logo[idx]);
    // console.log(idx);
}

function crosshair_hover_reset() {
    caption.innerHTML = "- - -";
    for (let i = 0; i < logo.length; i++) {
        if (logo[i] && logo[i].hover == true) {
            if (!logo[i].id.includes("flag")) { logo[i].Fill("#ffffff"); }
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

function change_view(view) {
    switch(view) {
        case "home": pop_items(["interpersonal","technical","other"],["interpersonal","code","address_card"]); break;
/*1   */case "interpersonal": pop_items(["teamwork","creative_force","peer-coding"],["teamwork","creative","interview"]); break;
/*11  */    case "teamwork": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break; // end of menu
/*12  */    case "creative_force": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*13  */    case "peer-coding": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2   */case "technical": pop_items(["web_development","software_development","general_scripting"],["website","software","script"]); break;
/*21  */    case "web_development": pop_items(["front-end","back-end","cloud"],["ui","server","cloud_computing"]); break;
/*211 */        case "front-end": pop_items(["HTML","CSS","JavaScript"],["html_logo2","css_logo2","js_logo2"]); break;
/*2111*/            case "HTML": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2112*/            case "CSS": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2113*/            case "JavaScript": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*212 */        case "back-end": pop_items(["deployment","core_development","database_management"],["deploy","core_development","database"]); break;
/*2121*/            case "deployment": pop_items(["Docker","Git","API"],["docker_logo2","git_logo2","api"]); break;
/*2121*/                case "Docker": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2121*/                case "Git": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2121*/                case "API": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2122*/            case "core_development": pop_items(["NodeJS","Golang","CPP"],["node_logo2","go_logo2","cpp_logo2"]); break;
/*2122*/                case "NodeJS": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2122*/                case "Golang": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2122*/                case "CPP": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2123*/            case "database_management": pop_items(["NoSQL","SQL","Blockchain"],["mongo_logo2","psql_logo2","blockchain"]); break;
/*2123*/                case "NoSQL": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break; //non structured data
/*2123*/                case "SQL": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break; //RDBM / ORDBM
/*2123*/                case "Blockchain": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*213 */        case "cloud": pop_items(["AWS","Google Cloud","Azure"],["aws_logo2","google_cloud_logo2","azure_logo2"]); break;
/*2131*/            case "AWS": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2132*/            case "google_cloud": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2133*/            case "Azure": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*22  */    case "software_development": pop_items(["user_interface","graphic_engines","core_development"],["ui","graphic_engine","core_development"]); break;
/*221 */        case "user_interface": pop_items(["Qt","Mono","Ncurses"],["qt_logo2","mono_logo2","gnu_bash"]); break;
/*2211*/            case "Qt": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2212*/            case "Mono": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2213*/            case "Ncurses": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*222 */        case "graphic_engines": pop_items(["Godot","Unity","Blender"],["godot_logo2","unity_logo2","blender_logo2"]); break;
/*2221*/            case "Godot": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2222*/            case "Unity": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2223*/            case "Blender": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*223 */        case "core_development": pop_items(["Python_3","CPP","CS"],["python_logo2","cpp_logo2","cs_logo2"]); break;
/*2231*/            case "Python_3": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2232*/            case "CPP": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2233*/            case "CS": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*23  */    case "general_scripting": pop_items(["Docker","Python_3","Bash"],["docker_logo2","python_logo2","gnu_bash"]); break;
/*231 */        case "Auto_HotKey": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*232 */        case "Python_3": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*233 */        case "Bash": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*3   */case "other": pop_items(["hardware","finance","languages"],["hardware","finance","languages"]); break;
/*31  */    case "hardware": pop_items(["Mobile","Desktop","Network"],["mobile_settings","graphic_card","ethernet"]); break;
/*311 */        case "Mobile": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*312 */        case "Desktop": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*313 */        case "Network": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*32  */    case "finance": pop_items(["Analysis","Trading","Execution"],["analytics2","analytics1","order_management"]); break;
/*321 */        case "Analysis": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*322 */        case "Trading": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*323 */        case "Execution": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*33  */    case "languages": pop_items(["French","English","German"],["fr_flag","uk_flag","ger_flag"]); break;
/*331 */        case "Understanding": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*332 */        case "Optimization": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*333 */        case "Maintenance": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break; //rig
/*33  */    //case "mining": pop_items(["Understanding","Optimization","Maintenance"],["","",""]); break;
/*331 */    //    case "Understanding": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*332 */    //    case "Optimization": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*333 */    //    case "Maintenance": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break; //rig
    }
    console.log("view change:", view);
}
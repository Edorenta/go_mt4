"use strict";

const logos_grid_style =
`   position: absolute;
    z_index: 20;
    height: 0%;
    width: calc(78vw + 5vh);
    max-width: 100%;
    left: 50%;
    -webkit-transform: translateX(-50%);
    transform: translateX(-50%);
    top: 33%;
    margin: auto;
    display: grid;
    justify-items: center;
    align-items: center;`;
const caption_grid_el_style =
`   font-family: "play-regular";
    position: absolute;
    z_index: 20;
    height: 0%;
    width: calc(78vw + 5vh);
    max-width: 100%;
    left: 50%;
    -webkit-transform: translateX(-50%);
    transform: translateX(-50%);    top: calc(37vh + 5vw);
    margin: auto;
    display: grid;
    justify-items: center;
    align-items: center;`;
const selection_grid_style =
`   font-family: "play-regular";
    position: absolute;
    z_index: 20;
    height: 0%;
    width: 100%;
    left: 0%;
    top: calc(15vh - 3vw);
    margin: auto;
    display: grid;
    justify-items: center;
    align-items: center;`;
var logos_grid_el = null;
var selection_grid_el = null;
var caption_grid_el = null;
var caption_grid = [];
var win = null;
var mb = null;
var tw = null;
var hit_lock = false;
var logo = [];

!function(){ DocReady(init) }();

async function init() {
    win = {
        w : Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        h : Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
    };
    win.landscape = (win.w > win.h);
    logos_grid_el = document.createElement("div");
    selection_grid_el = document.createElement("div");
	caption_grid_el = document.createElement("div");
    logos_grid_el.setAttribute("style", logos_grid_style);
	selection_grid_el.setAttribute("style", selection_grid_style);
    selection_grid_el.classList.add("text-h2");
    selection_grid_el.classList.add("has-text-warning");
    selection_grid_el.innerHTML = "- - -";
    caption_grid_el.setAttribute("style", caption_grid_el_style +
`   grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 100% 100% 100%;
    grid-column-gap: 0%;
    grid-row-gap: 0%;`);
    caption_grid_el.innerHTML =
`   <div id="caption_grid_0"></div>
    <div id="caption_grid_1"></div>
    <div id="caption_grid_2"></div>`; // "what side of me do would you explore?"
    caption_grid_el.classList.add("text-h5");
    caption_grid_el.classList.add("has-text-white");
    Underlay.el.style.zIndex = "0";
    Underlay.el.appendChild(logos_grid_el);
    Underlay.el.appendChild(selection_grid_el);
    Underlay.el.appendChild(caption_grid_el);
    for (let i = 0; i < 3; i++) {
        caption_grid[i] = document.getElementById("caption_grid_" + i);
    }
    //init_mb();
    await change_view("home");
    while (!starship) {
        await sleep(50);
    }
    if (starship.target == null) { starship.target = 1; }
    crosshair_hover(starship.target);
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
    logos_grid_el.setAttribute("style", logos_grid_style +
`   grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 100% 100% 100%;`/*
    grid-column-gap: 5%;
    grid-row-gap: 5%;`*/);
    logos_grid_el.innerHTML =
`   <div id="` + item_names[0] + `"></div>
    <div id="` + item_names[1] + `"></div>
    <div id="` + item_names[2] + `"></div>`; // "what side of me do would you explore?"
    //await sleep(1000);
    // console.log(item_names, svgs_names);
    for (let i = 0; i < item_names.length; i++) {
        await init_logo("#" + item_names[i],svgs_names[i],100,100);
        caption_grid[i].innerHTML = id_to_name(item_names[i]);
        // await sleep(200);
    }
    if (starship && starship.target != null) {
        crosshair_hover(starship.target);
    }
}

async function init_logo(_el_id,_svg_id,_width,_height/*,_markup*/) {
    // console.log(_svg_id);
  let _logo = new TinySVG({
    parent_id: _el_id,
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
    // change_view(_logo.parent_id.substring(1, _logo.parent_id.length));
  });
  await _logo.Spawn();
  await _logo.Scale(0.33, 300);
  _logo.hover = false;
  // await sleep(500);
  logo[n] = _logo;
  _logo.OnMouseOver(function() {
    // console.log("ok");
    crosshair_hover(n);
    // item_hover(_logo);
  });

  _logo.OnMouseOut(function() {
    crosshair_hover_reset();
  });
  // console.log("+1");
}

function id_to_name(id) {
    // console.log(id);
    // let tmp = id.replace("_", " ");
    if (id[0] == "." || id[0] == "#") { id = id.substring(1, id.length); }
    if (id == "CPP") { return "C/C++"; }
    if (id == "CS") { return "C#"; }
    return id.replace("_", " ").capitalize();
}

function item_hover(_logo) {
    if (_logo) {
        if (!_logo.hover) {
            _logo.hover = true;
            if (!_logo.id.includes("flag")) { _logo.Fill("#fcad0f"); }
            _logo.Scale(2/*, 100*/);
        }
        selection_grid_el.innerHTML = id_to_name(_logo.parent_id);
    }
}

function crosshair_hover(idx) {
    if (logo[idx]) {
        caption_grid[idx].classList.add("text-h3","has-text-warning");
        caption_grid[idx].setAttribute("style",
`       -webkit-transform: translateY(150%);
        transform: translateY(150%);`);
        caption_grid[idx].innerHTML = get_stars(logo[idx].parent_id.substring(1, logo[idx].parent_id.length));
        item_hover(logo[idx]);
        // console.log(idx);
    }
}

function crosshair_hover_reset() {
    for (let i = 0; i < logo.length; i++) {
        if (caption_grid[i].innerHTML.includes("☆")
            || caption_grid[i].innerHTML.includes("★")
            || caption_grid[i].innerHTML.includes("...")) {
            caption_grid[i].innerHTML = selection_grid_el.innerHTML;
            caption_grid[i].classList.remove("text-h3","has-text-warning");
            // caption_grid[i].setAttribute("style",``);
        }
        if (logo[i] && logo[i].hover == true) {
            if (!logo[i].id.includes("flag")) { logo[i].Fill("#ffffff"); }
            logo[i].Scale(1/2/*, 100*/);
            logo[i].hover = false;
        }
    }
    selection_grid_el.innerHTML = "- - -";
}

async function laser_hit(idx) {
    // console.log("hit_lock:", hit_lock);
    hit_lock = true;
    if (logo[idx]) {
        let click = logo[idx].el.dispatchEvent(MouseClick); // if false, click was canceled. here is simulated so no failure possible
    }
}

function get_stars(view) {//★☆
    switch(view) {
/*1   */case "interpersonal": return "..."; break;
/*11  */    case "teamwork": return "★★★★★"; break; // end of menu
/*12  */    case "creativity": return "★★★★★"; break;
/*13  */    case "peer-coding": return "★★★☆☆"; break;
/*2   */case "technical": return "..."; break;
/*21  */    case "web": return "..."; break;
/*211 */        case "front-end": return "..."; break;
/*2111*/            case "HTML": return "★★★☆☆"; break;
/*2112*/            case "CSS": return "★★☆☆☆"; break;
/*2113*/            case "JavaScript": return "★★★★☆"; break;
/*212 */        case "back-end": return "..."; break;
/*2121*/            case "deployment": return "★★☆☆☆"; break;
/*2121*/                case "Docker": return "★☆☆☆☆"; break;
/*2121*/                case "Git": return "★★☆☆☆";
/*2121*/                case "API": return "★★★★☆";
/*2122*/            case "languages": return "..."; break;
/*2122*/                case "NodeJS": return "★★★☆☆"; break;
/*2122*/                case "Golang": return "★★★★☆"; break;
/*2122*/                case "CPP": return "★★★☆☆"; break;
/*2123*/            case "databases": return "..."; break;
/*2123*/                case "NoSQL": return "★★☆☆☆"; break; //non structured data
/*2123*/                case "SQL": return "★★★☆☆"; break; //RDBM / ORDBM
/*2123*/                case "Blockchain": return "★★☆☆☆"; break;
/*213 */        case "cloud": return "..."; break;
/*2131*/            case "AWS": return "★☆☆☆☆"; break;
/*2132*/            case "google_cloud": return "★★★☆☆"; break;
/*2133*/            case "Azure": return "★☆☆☆☆"; break;
/*22  */    case "software": return "..."; break;
/*221 */        case "UI": return "..."; break;
/*2211*/            case "Qt": return "★★☆☆☆"; break;
/*2212*/            case "Mono": return "★★☆☆☆"; break;
/*2213*/            case "Ncurses": return "★☆☆☆☆"; break;
/*222 */        case "engines": return "..."; break;
/*2221*/            case "Godot": return "★★☆☆☆"; break;
/*2222*/            case "Unity": return "★★★☆☆"; break;
/*2223*/            case "Blender": return "★★☆☆☆"; break;
/*223 */        case "languages": return "..."; break;
/*2231*/            case "Python_3": return "★★★☆☆"; break;
/*2232*/            case "CPP": return "★★★☆☆"; break;
/*2233*/            case "CS": return "★★☆☆☆"; break;
/*23  */    case "scripting": return "..."; break;
/*231 */        case "Auto_HotKey": return "★★☆☆☆"; break;
/*232 */        case "Python_3": return "★★★☆☆"; break;
/*233 */        case "Bash": return "★★★☆☆"; break;
/*3   */case "other": return "..."; break;
/*31  */    case "hardware": return "..."; break;
/*311 */        case "Mobile": return "★★☆☆☆"; break;
/*312 */        case "Desktop": return "★★☆☆☆"; break;
/*313 */        case "Network": return "★★☆☆☆"; break;
/*32  */    case "finance": return "..."; break;
/*321 */        case "Analysis": return "★★★☆☆"; break;
/*322 */        case "Trading": return "★★★☆☆"; break;
/*323 */        case "Execution": return "★★★★☆"; break;
/*33  */    case "language": return "..."; break;
/*331 */        case "French": return "★★★★★"; break;
/*332 */        case "English": return "★★★★☆"; break;
/*333 */        case "German": return "★★☆☆☆"; break; //rig
/*33  */    //case "mining": pop_items(["Understanding","Optimization","Maintenance"],["","",""]); break;
/*331 */    //    case "Understanding": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*332 */    //    case "Optimization": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*333 */    //    case "Maintenance": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break; //rig
    }
    console.log("view change:", view);
}

function change_view(view) {
    switch(view) {
        case "home": pop_items(["interpersonal","technical","other"],["interpersonal","code","address_card"]); break;
/*1   */case "interpersonal": pop_items(["teamwork","creativity","peer-coding"],["teamwork","creative","interview"]); break;
/*11  */    case "teamwork": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break; // end of menu
/*12  */    case "creativity": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*13  */    case "peer-coding": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2   */case "technical": pop_items(["web","software","scripting"],["website","software","script"]); break;
/*21  */    case "web": pop_items(["front-end","back-end","cloud"],["ui","server","cloud_computing"]); break;
/*211 */        case "front-end": pop_items(["HTML","CSS","JavaScript"],["html_logo2","css_logo2","js_logo2"]); break;
/*2111*/            case "HTML": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2112*/            case "CSS": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2113*/            case "JavaScript": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*212 */        case "back-end": pop_items(["deployment","languages","databases"],["deploy","core_development","database"]); break;
/*2121*/            case "deployment": pop_items(["Docker","Git","API"],["docker_logo2","git_logo2","api"]); break;
/*2121*/                case "Docker": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2121*/                case "Git": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2121*/                case "API": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2122*/            case "languages": pop_items(["NodeJS","Golang","CPP"],["node_logo2","go_logo2","cpp_logo2"]); break;
/*2122*/                case "NodeJS": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2122*/                case "Golang": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2122*/                case "CPP": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2123*/            case "databases": pop_items(["NoSQL","SQL","Blockchain"],["mongo_logo2","psql_logo2","blockchain"]); break;
/*2123*/                case "NoSQL": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break; //non structured data
/*2123*/                case "SQL": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break; //RDBM / ORDBM
/*2123*/                case "Blockchain": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*213 */        case "cloud": pop_items(["AWS","google_cloud","Azure"],["aws_logo2","google_cloud_logo2","azure_logo2"]); break;
/*2131*/            case "AWS": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2132*/            case "google_cloud": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2133*/            case "Azure": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*22  */    case "software": pop_items(["UI","engines","languages"],["ui","graphic_engine","core_development"]); break;
/*221 */        case "UI": pop_items(["Qt","Mono","Ncurses"],["qt_logo2","mono_logo2","gnu_bash"]); break;
/*2211*/            case "Qt": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2212*/            case "Mono": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2213*/            case "Ncurses": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*222 */        case "engines": pop_items(["Godot","Unity","Blender"],["godot_logo2","unity_logo2","blender_logo2"]); break;
/*2221*/            case "Godot": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2222*/            case "Unity": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2223*/            case "Blender": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*223 */        case "languages": pop_items(["Python_3","CPP","CS"],["python_logo2","cpp_logo2","cs_logo2"]); break;
/*2231*/            case "Python_3": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2232*/            case "CPP": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*2233*/            case "CS": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*23  */    case "scripting": pop_items(["Docker","Python_3","Bash"],["docker_logo2","python_logo2","gnu_bash"]); break;
/*231 */        case "Auto_HotKey": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*232 */        case "Python_3": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*233 */        case "Bash": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*3   */case "other": pop_items(["hardware","finance","language"],["hardware","finance","languages"]); break;
/*31  */    case "hardware": pop_items(["Mobile","Desktop","Network"],["mobile_settings","graphic_card","ethernet"]); break;
/*311 */        case "Mobile": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*312 */        case "Desktop": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*313 */        case "Network": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*32  */    case "finance": pop_items(["Analysis","Trading","Execution"],["analytics2","analytics","order_management"]); break;
/*321 */        case "Analysis": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*322 */        case "Trading": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*323 */        case "Execution": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*33  */    case "language": pop_items(["French","English","German"],["fr_flag","uk_flag","ger_flag"]); break;
/*331 */        //case "French": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*332 */        //case "English": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*333 */        //case "German": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break; //rig
/*33  */    //case "mining": pop_items(["Understanding","Optimization","Maintenance"],["","",""]); break;
/*331 */    //    case "Understanding": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*332 */    //    case "Optimization": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break;
/*333 */    //    case "Maintenance": logo[starship.target].Fill('hsl(' + floor(random(349)) + ', 100%, 50%)'); break; //rig
    }
    console.log("view change:", view);
}

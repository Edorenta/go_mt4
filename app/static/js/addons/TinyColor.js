const ShadeBlend = function (p, from, to) {
    if(typeof(p)!="number"||p<-1||p>1||typeof(from)!="string"||(from[0]!='r'&&from[0]!='#')||(to&&typeof(to)!="string"))return null; //ErrorCheck
    if(!this.sbcRip)this.sbcRip=(d)=>{
        let l=d.length,RGB={};
        if(l>9){
            d=d.split(",");
            if(d.length<3||d.length>4)return null;//ErrorCheck
            RGB[0]=i(d[0].split("(")[1]),RGB[1]=i(d[1]),RGB[2]=i(d[2]),RGB[3]=d[3]?parseFloat(d[3]):-1;
        }else{
            if(l==8||l==6||l<4)return null; //ErrorCheck
            if(l<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(l>4?d[4]+""+d[4]:""); //3 or 4 digit
            d=i(d.slice(1),16),RGB[0]=d>>16&255,RGB[1]=d>>8&255,RGB[2]=d&255,RGB[3]=-1;
            if(l==9||l==5)RGB[3]=r((RGB[2]/255)*10000)/10000,RGB[2]=RGB[1],RGB[1]=RGB[0],RGB[0]=d>>24&255;
        }
    return RGB;}
    var i=parseInt,r=Math.round,h=from.length>9,h=typeof(to)=="string"?to.length>9?true:to=="c"?!h:false:h,b=p<0,p=b?p*-1:p,to=to&&to!="c"?to:b?"#000000":"#FFFFFF",f=this.sbcRip(from),t=this.sbcRip(to);
    if(!f||!t)return null; //ErrorCheck
    if(h)return "rgb"+(f[3]>-1||t[3]>-1?"a(":"(")+r((t[0]-f[0])*p+f[0])+","+r((t[1]-f[1])*p+f[1])+","+r((t[2]-f[2])*p+f[2])+(f[3]<0&&t[3]<0?")":","+(f[3]>-1&&t[3]>-1?r(((t[3]-f[3])*p+f[3])*10000)/10000:t[3]<0?f[3]:t[3])+")");
    else return "#"+(0x100000000+r((t[0]-f[0])*p+f[0])*0x1000000+r((t[1]-f[1])*p+f[1])*0x10000+r((t[2]-f[2])*p+f[2])*0x100+(f[3]>-1&&t[3]>-1?r(((t[3]-f[3])*p+f[3])*255):t[3]>-1?r(t[3]*255):f[3]>-1?r(f[3]*255):255)).toString(16).slice(1,f[3]>-1||t[3]>-1?undefined:-2);
}

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

function GetAngle(x1,y1,x2,y2) {
  // let dx = x1 - x2;
  // let dy = y1 - y2;
  return Math.atan2(y1 - y2, x1 - x2);
};

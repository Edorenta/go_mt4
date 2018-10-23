"use strict";

!function(){ DocReady(init) }();

function init() {
  init_tw();
}

async function init_tw() {
  var tw1 = new TypeWriter("caption", 50);
  // var tw1 = new TypeFader("core", 1500);
  await tw1.MultiType(["Hi! I'm Paul de Renty, developer."
                ,"I have fun coding, particularly in Javascript, Go, and C++."
                ,"Want to see me? Let's generate my 1-bit dithered portrait!"]
                ,false);
  init_showcase_1_bit();
  // await sleep(2500);
  // await tw1.Flush();
  // document.getElementById("core").classList.add("hidden");
}

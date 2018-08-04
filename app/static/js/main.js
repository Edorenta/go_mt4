//initialization function

// function preload(){
//     // img = loadImage("../assets/xxx.png");
//     // font = loadFont("../fonts/xxx.ttf");
//     init_socket();
//     // test_socket();
// }

var uri = "127.0.0.1";
var port = "8080";
var address = "ws://" + uri + ":" + port + "/ws";
var ws = init_socket();

function init_socket() {
    ws = new ReconnectingWebSocket(address);

    if (window.WebSocket === undefined)
        console.log("Error: WebSockets not supported");
    //callbacks:
    ws.onopen = function(event){
        console.log("Access to WebSocket " + address + " granted");
    };
    ws.onclose = function(){
        console.log("WebSocket " + address + " closed");
    };
    ws.onerror = function(event){
        console.log("Communication error with " + address);
        console.log(event);
    };
    ws.onmessage = function(event){
        console.log("Recd: " + event.data);
        let data = event.data;
        let type = data.slice(0, 5);
        //console.log(event.data);
        //console.log("Rec:" + type);
        switch (type){
            case "<001>":
                in_set = JSON.parse(data.slice(5, data.length));
                exec_001();
                break;
            case "<002>":
                in_set = JSON.parse(data.slice(5, data.length));
                exec_002();
                break;
            //...
        }
    };
    return ws;
}

function test_socket() {
    var msg = "301" //MSG_START_TERM_FEED
    let ret = ws.send(JSON.stringify(msg));
    //let ret = ws.send("ME");
	// if (ret > 0)
	// 	console.log("Successfully sent test_message to server");
	// else
	// 	console.log("Error sending test_message to server");
    console.log('Sent: "' + msg + '"');
}

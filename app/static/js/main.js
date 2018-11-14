//initialization function

// function preload(){
//     // img = loadImage("../assets/xxx.png");
//     // font = loadFont("../fonts/xxx.ttf");
//     init_socket();
//     // test_socket();
// }

var address = "ws://" + URI "/ws"; //wss once SSL is enabled
var ws_open = false;

function init_socket() {
    address = address + "?" + encodeURIComponent("visitor_id=" + VisitorID);
    var ws = new ReconnectingWebSocket(address);

    if (window.WebSocket === undefined)
        console.log("Error: WebSockets not supported");
    //callbacks:
    // ws.on("headers", function(headers) {
    //     headers["set-cookie"] = "go_mt4_session";
    // });
    ws.onopen = function(event){
        // ws_open = true;
        // send_test(ws)
        console.log("Access to WebSocket " + address + " granted");
    };
    ws.onclose = function(){
        // ws_open = false;
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
    return;
}

// function listCookies() {
//     var theCookies = document.cookie.split(';');
//     var aString = '';
//     for (var i = 1 ; i <= theCookies.length; i++) {
//         aString += i + ' ' + theCookies[i-1] + "\n";
//     }
//     return aString;
// }

function test_socket() {
    var x = document.cookie; 
    console.log(x); //alert(x)
    ws = init_socket();
}

function send_test(ws) {
    var msg = "301" //MSG_START_TERM_FEED not to be mistaken with http redirect
    let ret = ws.send(JSON.stringify(msg));
    //let ret = ws.send("ME");
    // if (ret > 0)
    //  console.log("Successfully sent test_message to server");
    // else
    //  console.log("Error sending test_message to server");
    console.log('Sent: "' + msg + '"');
}

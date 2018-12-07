"use strict";

// !function(){ DocReady(init_ws) }();

let _WebSocketWrapper = null;

class WebSocketWrapper {
    constructor(id, use) {// return null if contruction fails
        _WebSocketWrapper = this; //make generic point to the instance
        this.open = false;
        this.use = use;
        this.uri = WS_URI + "?" + encodeURIComponent("visitor_id=" + VisitorID +"&use=" + use);
        this.ws = new ReconnectingWebSocket(this.uri);
        if (window.WebSocket === undefined) {
            console.log("Error: WebSockets not supported");
        }
        // switch (this.use) {
        //     case "log_in" :
        //         this.OnMessage(function(e){
        //             // let data = JSON.parse(e.data);
        //             console.log("Server:", e.data);
        //         });
        //     break;
        // }
        console.log(this);
    }
    Send(msg) {
        this.ws.send(msg); //JSON.stringify(msg) ?
    }
    // OnHeaders(f) {
    //     /*HEADERS CALLBACK EXAMPLE*/
    //     this.ws.on("headers", f);
    // }
    OnOpen(f) {
        _WebSocketWrapper.ws.onopen = f;
        /* OPEN CALLBACK EXAMPLE
        ws.onopen = function(e){
            ws_open = true;
            ws.send(JSON.stringify("Hello from client to server"));
            console.log("Access to WebSocket " + this.uri + " granted");
        };
        */
    }
    OnClose(f) {
        _WebSocketWrapper.ws.onclose = f;
        /* CLOSE CALLBACK EXAMPLE
        ws.onclose = function(){
            ws_open = false;
            console.log("WebSocket " + this.uri + " closed");
        };
        */
    }
    OnError(f) {
        _WebSocketWrapper.ws.onerror = f;
        /* ERROR CALLBACK EXAMPLE
        ws.onerror = function(e){
            console.log("Communication error with " + this.uri);
            console.log(e);
        };
        */
    }
    OnMessage(f) {
        _WebSocketWrapper.ws.onmessage = f;
        /* REQ CALLBACK SAMPLE: 2 different callnack outputs
        ws.onmessage = function(e){
            console.log("Recd: " + e.data);
            let data = e.data;
            let type = data.slice(0, 5);
            //console.log(e.data);
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
        */
    }
    DefaultCallbacks() {
        // this.OnHeaders(function(headers){
            // headers["set-cookie"] = "paul-r_session";
        // });
        _WebSocketWrapper.OnOpen(function(e){
            _WebSocketWrapper.open = true;
            _WebSocketWrapper.ws.send(JSON.stringify("Client to Server >> OK"));
            console.log("Access to WebSocket " + _WebSocketWrapper.uri + " granted");
        });
        _WebSocketWrapper.OnClose(function(){
            _WebSocketWrapper.open = false;
            console.log("WebSocket " + _WebSocketWrapper.uri + " closed");
        });
        _WebSocketWrapper.OnError(function(e){
            console.log("Communication error with " + _WebSocketWrapper.uri);
            console.log(e);
        });
    }
    Test() {
        var msg = "How are you processing, server?"; //MSG_START_TERM_FEED not to be mistaken with http redirect
        let ret = this.ws.send(JSON.stringify(msg));
        //let ret = ws.send("ME");
        // if (ret > 0)
        //  console.log("Successfully sent test_message to server");
        // else
        //  console.log("Error sending test_message to server");
        console.log('Sent: "' + msg + '"');
    }
}

/* legacy code
function init_ws() {
    address = address + "?" + encodeURIComponent("visitor_id=" + VisitorID +"&use=" + use);
    var ws = new ReconnectingWebSocket(address);

    if (window.WebSocket === undefined)
        console.log("Error: WebSockets not supported");
    //callbacks:
    // ws.on("headers", function(headers) {
    //     headers["set-cookie"] = "go_mt4_session";
    // });
    ws.onopen = function(e){
        ws_open = true;
        ws.send(JSON.stringify("Hello from client to server"));
        console.log("Access to WebSocket " + address + " granted");
    };
    ws.onclose = function(){
        // ws_open = false;
        console.log("WebSocket " + address + " closed");
    };
    ws.onerror = function(e){
        console.log("Communication error with " + address);
        console.log(e);
    };
    ws.onmessage = function(e){
        console.log("Recd: " + e.data);
        let data = e.data;
        let type = data.slice(0, 5);
        //console.log(e.data);
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
*/
// function test_socket() {
//     var x = document.cookie; 
//     console.log(x); //alert(x)
//     ws = init_socket();
// }

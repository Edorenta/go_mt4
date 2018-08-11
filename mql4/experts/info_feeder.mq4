#property copyright "Paul de Renty"
#property link      ""
#property version   "1.00"
#property strict

#include <info_feed_conf.mqh>
#include <sockets.mqh>

ClientSocket    *client     = NULL; //client address is available on global scope
bool            timer_set   = false;
string          msg_in      = NULL;
string          msg_out     = NULL;
ushort          port        = 20001;

int		OnInit() {
    ushort attempt = 0;

    Comment("TCP Router: Expecting requests from server " + URI + ":" + IntegerToString(PORT));
    if (!(client = socket_connect(client, URI, PORT, 2))) {
        //return (INIT_FAILED);
    }
    timer_set = EventSetMillisecondTimer(100);
    return(INIT_SUCCEEDED);
}

void    OnDeinit(const int reason) {
    delete client;
}

void    OnTimer() {
    if (client != NULL && client.IsSocketConnected()) {
        msg_in = client.Receive("\n");
        if (msg_in != NULL && msg_in != "") {
            Print("Msg in: " + msg_in);
        	if ((msg_out = get_res(msg_in) + "\n") != NULL) {
    	        Print("Msg out: " + msg_out);
    	        if (!(client.SendStr(msg_out)))
                    Print("Error: Data push failed");
            }
            else
                Print("Error: Couldn't match the server's request");
    	}
    }
    else {
        // Print("Error: Socket uninitialized or disconnected");
        (client = socket_connect(client, URI, PORT, 2));
    }
}

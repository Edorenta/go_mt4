//caps lock for consts
const DOMAIN = "localhost";
const PORT = "8080";
const USE_PORT_URI = true;
const URI = DOMAIN + ((PORT && USE_PORT_URI) ? ":" + PORT : "");
const WS_URI = "ws://" + URI + "/ws"; //wss once SSL is enabled

"use strict";

!function(){ DocReady(init_ws) }();

function init_ws() {
	let wsw = new WebSocketWrapper(VisitorID, "log_in");
	wsw.DefaultCallbacks();
}

let log_in_banner = null;

function log_in_submit() {
	FormSubmit("log_in_form", "POST", "/post_log_in", "/post_log_in", "application/x-www-form-urlencoded", function() {
    	console.log("XHR status: " + this.status);
    	console.log("XHR response:" + this.response);
    	let data = JSON.parse(this.response);
    	if (data.access == "denied") {
    		if (log_in_banner) { log_in_banner.Remove(); }
    		log_in_banner = new Banner({ type: "danger", text: "Login " + data.status + ": " + data.reason });
    	}
		else if (data.ud == "denied") {
    		if (log_in_banner) { log_in_banner.Remove(); }
    		log_in_banner = new Banner({ type: "warning", text: "Please fill your profile's missing data." });
    	}
  		else if (data.access == "granted") {
    		if (log_in_banner) { log_in_banner.Remove(); }
    		log_in_banner = new Banner({ type: "success", text: "Login successful." });
    	}
	});
}

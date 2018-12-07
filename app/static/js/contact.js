"use strict";

!function(){ DocReady(init_ws) }();

function init_ws() {
	let wsw = new WebSocketWrapper(VisitorID, "contact");
	wsw.DefaultCallbacks();
}

let contact_banner = null;

function contact_submit() {
    if (contact_banner) { contact_banner.Remove(); }
    contact_banner = new Banner({ type: "warning", text: "Sending message..." });
	FormSubmit("contact_form", "POST", "/post_contact", "/post_contact", "application/x-www-form-urlencoded", function() {
    	console.log("XHR status: " + this.status);
    	console.log("XHR response:" + this.response);
    	let data = JSON.parse(this.response);
    	if (data.status == "failure") {
    		if (contact_banner) { contact_banner.Remove(); }
    		contact_banner = new Banner({ type: "danger", text: "Contact " + data.status + ": " + data.reason });
    	}
/*		else if (data.status == "denied") {
    		if (contact_banner) { contact_banner.Remove(); }
    		contact_banner = new Banner({ type: "warning", text: data.status + " please try again." });
    	}*/
  		else if (data.status == "success") {
    		if (contact_banner) { contact_banner.Remove(); }
    		contact_banner = new Banner({ type: "success", text: "Message received! You will be answered shortly." });
    	}
	});
}

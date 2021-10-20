let AlexaResponse = require("./alexaResponse");
'use strict';
class ErrorResponse {
    constructor(type,message) {
        this.type=type;
        this.message=message;
    }
    getResponse() {
        let aer = new AlexaResponse(
            {
                "name": "ErrorResponse",
                "payload": {
                    "type": this.type || "INTERNAL_ERROR",
                    "message": this.message ||  "This skill only supports Smart Home API version 3"
                }
            }
        );
        return aer.get();
    }
}
module.exports=ErrorResponse;
let AlexaResponse = require("./alexaResponse");
'use strict';
class AuthorizationResponse {
    getResponse() {
        let aar = new AlexaResponse({ "namespace": "Alexa.Authorization", "name": "AcceptGrant.Response" });
        return aar.get();
    }
}
module.exports=AuthorizationResponse;
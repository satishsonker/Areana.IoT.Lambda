'use strict';
const config = require('./config.json');
let AuthorizationResponse = require("./alexa/skills/smartHome/authorizationResponse");
let ErrorResponse = require("./alexa/skills/smartHome/errorResponse");
let DiscoveryResponse = require("./alexa/skills/smartHome/discoveryResponse");
const PowerControllerResponse = require('./alexa/skills/smartHome/powerControllerresponse');
exports.handler = async function (event, context) {
    //veriable initialization

    //

    if (context !== undefined) {
    }

    // Validate we have an Alexa directive
    if (!('directive' in event)) {
        let aer = new ErrorResponse("INVALID_DIRECTIVE", "Missing key: directive, Is request a valid Alexa directive?");
        return sendResponse(aer);
    }
    // Check the payload version
    if (event.directive.header.payloadVersion !== "3") {
        let aer = new ErrorResponse("INVALID_DIRECTIVE", "This skill only supports Smart Home API version 3");
        return sendResponse(aer);
    }
    let namespace = ((event.directive || {}).header || {}).namespace;
    let name = event.directive.header.name;

    if (namespace.toLowerCase() === 'alexa.authorization') {
        let aar = new AuthorizationResponse().getResponse();
        return sendResponse(aar);
    }

    if (namespace.toLowerCase() === 'alexa.discovery') {
        let adr = new DiscoveryResponse().getResponse();
        return sendResponse(adr);
    }
    if (namespace.toLowerCase() === 'alexa.powercontroller') {
        let apr = new PowerControllerResponse(event).getResponse();
        return sendResponse(apr);
    }
    
    function sendResponse(response) {
        return response
    }
}
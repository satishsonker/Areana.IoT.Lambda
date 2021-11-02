let AlexaResponse = require("./alexaResponse");
let ErrorResponse = require("./errorResponse");
let Dynamo = require('../../../dynamo');
const https = require('https');
let config = require("../../../config.json");
'use strict';
class DiscoveryrResponse {
    constructor() {
        this.db = new Dynamo();
    }
    async getResponse() {
        const devices = await this.getDeviceForDiscovery();
        if (devices?.length > 0) {
            let adr = new AlexaResponse({ "namespace": "Alexa.Discovery", "name": "Discover.Response" });
            let capability_alexa_various = adr.createPayloadEndpointCapability();
            devices.forEach((device, ind) => {
                this.db.addNewDevice(device.deviceKey);
                let capability_alexa = [];
                device["deviceType"]["deviceCapabilities"].forEach((deviceCap, indCap) => {
                    if (deviceCap["displayCategory"].toUpperCase() === 'DOORBELL') {
                        capability_alexa.push(adr.createPayloadEndpointCapability({
                            "proactivelyReported": deviceCap["proactivelyReported"],
                            'type': deviceCap['capabilityType'],
                            "version": deviceCap["version"],
                            "interface": deviceCap["capabilityInterface"]
                        }));
                    }
                    else {
                        capability_alexa.push(capability_alexa_various);
                        let obj = {};
                        obj.interface = deviceCap["capabilityInterface"];
                        obj.supported = [{ "name": deviceCap["supportedProperty"] }];
                        obj.proactivelyReported = deviceCap["proactivelyReported"];
                        obj.retrievable = deviceCap["retrievable"];
                        obj.type = deviceCap['capabilityType'];
                        obj.version = deviceCap["version"];
                        capability_alexa.push(adr.createPayloadEndpointCapability(JSON.parse(JSON.stringify(obj))));
                    }
                });
                adr.addPayloadEndpoint({
                    displayCategories: [device["deviceType"]["deviceTypeName"].toUpperCase()],
                    manufacturerName: device["manufacturerName"],
                    description: device["deviceDesc"],
                    "friendlyName": device["friendlyName"],
                    "endpointId": device?.deviceKey,
                    "capabilities": capability_alexa
                });
            });
            return adr.get();
        }
        else {
            let aer = new ErrorResponse("INVALID_DIRECTIVE", "device is not available to discovery");
            return aer.getResponse();
        }
    }

    async getDeviceForDiscovery() {
        return new Promise(((resolve, reject) => {

            const request = https.get(config.api.baseUrl + config.api.deviceDiscovery, (response) => {
                response.setEncoding('utf8');
                let returnData = '';

                response.on('data', (chunk) => {
                    returnData += chunk;
                });

                response.on('end', () => {
                    resolve(JSON.parse(returnData));
                });

                response.on('error', (error) => {
                    reject(error);
                });
            });
            request.end();
        }));
    }
}
module.exports = DiscoveryrResponse;
'use strict';
class AlexaResponse {
    //Constructor
    constructor(opts) {
        if (opts === undefined)
            opts = {};
        if (opts.context !== undefined)
            this.context = this.checkValue(opts.context, undefined);
        if (opts.event !== undefined)
            this.event = this.checkValue(opts.event, undefined);
        else
            this.event = {
                "header": {
                    "namespace": this.checkValue(opts.namespace, "Alexa"),
                    "name": this.checkValue(opts.name, "Response"),
                    "messageId": this.checkValue(opts.messageId, this.uuid()),
                    "correlationToken": this.checkValue(opts.correlationToken, undefined),
                    "payloadVersion": this.checkValue(opts.payloadVersion, "3")
                },
                "endpoint": {
                    "scope": {
                        "type": "BearerToken",
                        "token": this.checkValue(opts.token, "INVALID"),
                    },
                    "endpointId": this.checkValue(opts.endpointId, "INVALID")
                },
                "payload": this.checkValue(opts.payload, {})
            };

        // No endpoint in an AcceptGrant or Discover request
        if (this.event.header.name === "AcceptGrant.Response" || this.event.header.name === "Discover.Response")
            delete this.event.endpoint;
    }
    //end constructor

    //functions
    uuid() {
        var chars = '0123456789abcdef'.split('');
        var uuid = [], rnd = Math.random, r;
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4'; // version 4
        for (var i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | rnd() * 16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r & 0xf];
            }
        }
        return uuid.join('');
    }

    checkValue(value, defaultValue) {
        if (value === undefined || value === {} || value === "")
            return defaultValue;
        return value;
    }

    createContextProperty(opts) {
        return {
            'namespace': this.checkValue(opts.namespace, "Alexa.EndpointHealth"),
            'name': this.checkValue(opts.name, "connectivity"),
            'value': this.checkValue(opts.value, {"value": "OK"}),
            'timeOfSample': new Date().toISOString(),
            'uncertaintyInMilliseconds': this.checkValue(opts.uncertaintyInMilliseconds, 0)
        };
    }

    addPayloadEndpoint(opts) {
        if (this.event.payload.endpoints === undefined)
            this.event.payload.endpoints = [];
        this.event.payload.endpoints.push(this.createPayloadEndpoint(opts));
    }

    addContextProperty(opts) {
        if (this.context === undefined)
            this.context = {properties: []};
        this.context.properties.push(this.createContextProperty(opts));
    }

    createPayloadEndpoint(opts) {

        if (opts === undefined) opts = {};

        // Return the proper structure expected for the endpoint
        let endpoint =
            {
                "capabilities": this.checkValue(opts.capabilities, []),
                "description": this.checkValue(opts.description, "Sample Endpoint Description"),
                "displayCategories": this.checkValue(opts.displayCategories, ["OTHER"]),
                "endpointId": this.checkValue(opts.endpointId, 'endpoint-001'),
                "friendlyName": this.checkValue(opts.friendlyName, "Areana IoT"),
                "manufacturerName": this.checkValue(opts.manufacturerName, "Areana IoT")
            };

        if (opts.hasOwnProperty("cookie"))
            endpoint["cookie"] = this.checkValue('cookie', {});

        return endpoint
    }

    createPayloadEndpointCapability(opts) {

        if (opts === undefined) opts = {};

        let capability = {};
        capability['type'] = this.checkValue(opts.type, "AlexaInterface");
        capability['interface'] = this.checkValue(opts.interface, "Alexa");
        capability['version'] = this.checkValue(opts.version, "3");
        let supported = this.checkValue(opts.supported, false);
        if (supported) {
            capability['properties'] = {};
            capability['properties']['supported'] = supported;
            capability['properties']['proactivelyReported'] = this.checkValue(opts.proactivelyReported, true);
            capability['properties']['retrievable'] = this.checkValue(opts.retrievable, true);
        }
        if(opts.proactivelyReported!==undefined)
        {
            capability['proactivelyReported'] = this.checkValue(opts.proactivelyReported, true);
        }
        return capability
    }
    get() {
        return this;
    }
    //end functions
}

module.exports = AlexaResponse;

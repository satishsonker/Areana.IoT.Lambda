let AlexaResponse = require("./alexaResponse");
let Common = require('../../../common');
let Dynamo = require('../../../dynamo');
let config = require("../../../config.json");
const mqtt = require("async-mqtt");
'use strict';
class BrightnessResponse {
    constructor(event) {
        this.common = new Common();
        this.mqttClient = null;
        this.event = event;
        this.db = new Dynamo();
    }
    async getResponse() {
        this.mqttClient = await mqtt.connectAsync(`${config.mqtt.protocol}://${config.mqtt.host}:${config.mqtt.port}`);
        let brightnessValue = config.device.defaultBrightness;
        let endpoint_id = this.event.directive.endpoint.endpointId;
        let token = this.event.directive.endpoint.scope.token;
        let correlationToken = this.event.directive.header.correlationToken;
        let name = this.event.directive.header.name;

        if (name === "SetBrightness") {
            brightnessValue = this.event.directive.payload.brightness * 2.55;
        }
        if (name === 'AdjustBrightness') {
            let data = await this.db.getDeviceState(endpoint_id);
            brightnessValue = this.common.defaultIfEmpty(data[0].brightness, 255) - this.event.directive.payload.brightnessDelta * 2.55;
        }

        let pubData = {
            deviceId: endpoint_id,
            source: 'Alexa',
            value: {
                brightness: brightnessValue
            },
            action: 'action.devices.commands.BrightnessAbsolute'
        };

        let ar = new AlexaResponse(
            {
                "correlationToken": correlationToken,
                "token": token,
                "endpointId": endpoint_id
            }
        );
        ar.addContextProperty(this.common.endpointHealthContext);
        let brightnessContext = this.common.brightnessControllerContext;
        brightnessContext.value = brightnessValue;
        ar.addContextProperty(brightnessContext);
        // Check for an error when setting the state
        // let state_set = sendDeviceState(endpoint_id, "powerState", power_state_value);
        // let state_set = await this.db.updateDeviceState(endpoint_id,power_state_value);
        // if (!state_set) {
        //     return new ErrorResponse("ENDPOINT_UNREACHABLE","Unable to reach endpoint database.").getResponse();
        // }

        await this.mqttClient.publish(config.mqtt.pubTopic, JSON.stringify(pubData));
        await this.db.updateDeviceBrightness(endpoint_id, brightnessValue);
        return ar.get();
    }
}
module.exports = BrightnessResponse;
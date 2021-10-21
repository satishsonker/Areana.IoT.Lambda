let AlexaResponse = require("./alexaResponse");
let Common = require('../../../common');
let config = require("../../../config.json");
const mqtt = require("async-mqtt");
const DynamoDB = require("../../../dynamo");
'use strict';
class ColorResponse {
    constructor(event) {
        this.common = new Common();
        this.mqttClient = null;
        this.event = event;
        this.db = new DynamoDB();
    }
    async getResponse() {
        this.mqttClient = await mqtt.connectAsync(`${config.mqtt.protocol}://${config.mqtt.host}:${config.mqtt.port}`);
        let colorValue = {
            hue: 350.5,
            saturation: 0.7138,
            brightness: 0.6524
        };
        let endpoint_id = this.event.directive.endpoint.endpointId;
        let token = this.event.directive.endpoint.scope.token;
        let correlationToken = this.event.directive.header.correlationToken;
        let name = this.event.directive.header.name;

        if (name === "SetColor") {
            colorValue = this.event.directive.payload.color;
            let pubData = {
                deviceId: endpoint_id,
                source: 'Alexa',
                value: {
                    color: {
                        spectrumRGB: this.common.hsvToHex(colorValue.hue, colorValue.saturation, colorValue.brightness)
                    }
                },
                action: 'action.devices.commands.ColorAbsolute'
            };
            await this.mqttClient.publish(config.mqtt.pubTopic, JSON.stringify(pubData));
        }


        let ar = new AlexaResponse(
            {
                "correlationToken": correlationToken,
                "token": token,
                "endpointId": endpoint_id
            }
        );
        ar.addContextProperty(this.common.endpointHealthContext);
        let colorContext = this.common.colorControllerContext;
        colorContext.value = colorValue
        ar.addContextProperty(colorContext);
        await this.db.updateDeviceColor(endpoint_id, colorValue);
        return ar.get();
    }
}
module.exports = ColorResponse;
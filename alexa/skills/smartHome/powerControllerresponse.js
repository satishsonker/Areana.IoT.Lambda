let AlexaResponse = require("./alexaResponse");
let ErrorResponse = require("./errorResponse");
let config = require("../../../config.json");
const DynamoDB = require("../../../dynamo");
let Common = require('../../../common');
const mqtt = require("async-mqtt");
'use strict';
class PowerControllerResponse {
    constructor(event) {
        this.event = event;
        this.mqttClient = null;
        this.common = new Common();
        this.db = new DynamoDB();
    }

    async getResponse() {
        this.mqttClient = await mqtt.connectAsync(`${config.mqtt.protocol}://${config.mqtt.host}:${config.mqtt.port}`);
        let power_state_value = "OFF";
        let endpoint_id = this.event.directive.endpoint.endpointId;
        let token = this.event.directive.endpoint.scope.token;
        let correlationToken = this.event.directive.header.correlationToken;
        let name = this.event.directive.header.name;

        if (name === "TurnOn") {
            power_state_value = "ON";
        }

        let pubData = {
            deviceId: endpoint_id,
            source: 'Alexa',
            value: {
                on: power_state_value === "ON" ? "true" : "false"
            },
            action: 'action.devices.commands.OnOff'
        };
        await this.mqttClient.publish(config.mqtt.pubTopic, JSON.stringify(pubData));

        let ar = new AlexaResponse(
            {
                "correlationToken": correlationToken,
                "token": token,
                "endpointId": endpoint_id
            }
        );
        ar.addContextProperty(this.common.endpointHealthContext);
        let powerContext = this.common.powerControllerContext;
        powerContext.value = power_state_value;
        ar.addContextProperty(powerContext);
        // Check for an error when setting the state
        // let state_set = sendDeviceState(endpoint_id, "powerState", power_state_value);
        let state_set = await this.db.updateDeviceState(endpoint_id, power_state_value);
        if (!state_set) {
            return new ErrorResponse("ENDPOINT_UNREACHABLE", "Unable to reach endpoint database.").getResponse();
        }
        return ar.get();
    }
}
module.exports = PowerControllerResponse;
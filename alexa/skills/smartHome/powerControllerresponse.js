let AlexaResponse = require("./alexaResponse");
let ErrorResponse = require("./errorResponse");
let config = require("../../../config.json");
const DynamoDB = require("../../../dynamo");
const mqtt = require("async-mqtt");
'use strict';
class PowerControllerResponse {
    constructor(event) {
        this.event = event;
        this.mqttClient=null;
    }
    
  async  getResponse() {
      
    this.mqttClient = mqtt.connect(`${config.mqtt.protocol}://${config.mqtt.host}:${config.mqtt.port}`);
        let power_state_value = "OFF";
        let endpoint_id = this.event.directive.endpoint.endpointId;
        let token = this.event.directive.endpoint.scope.token;
        let correlationToken = this.event.directive.header.correlationToken;
        let name = this.event.directive.header.name;

        if (name === "TurnOn") {
            power_state_value = "ON";
        }


        console.log('publish mqtt');
        let pubData = {
            deviceId: endpoint_id,
            source: 'Alexa',
            value: {
                on: power_state_value === "ON" ? "true" : "false"
            },
            action: 'action.devices.commands.OnOff'
        }
        this.mqttClient.publish(config.mqtt.pubTopic, JSON.stringify(pubData));

        let ar = new AlexaResponse(
            {
                "correlationToken": correlationToken,
                "token": token,
                "endpointId": endpoint_id
            }
        );
        ar.addContextProperty(this.endpointHealthContext);
        this.powerControllerContext.value=power_state_value;
        ar.addContextProperty(this.powerControllerContext);
        // Check for an error when setting the state
        // let state_set = sendDeviceState(endpoint_id, "powerState", power_state_value);
        let db=new DynamoDB();
        let state_set = await db.updateDeviceState(endpoint_id,power_state_value);
        if (!state_set) {
            return new ErrorResponse("ENDPOINT_UNREACHABLE","Unable to reach endpoint database.").getResponse();
        }
        console.log('power controller response--');
        console.log(JSON.stringify(ar.get()));
        return ar.get();
    }

    endpointHealthContext = {
        namespace: "Alexa.EndpointHealth",
        name: "connectivity",
        value: {
            value: "OK"
        },
        timeOfSample: JSON.stringify(new Date()).replace(/"/gi, ''),
        uncertaintyInMilliseconds: 0
    };
    powerControllerContext={ 
        namespace: "Alexa.PowerController", 
        name: "powerState", 
        value: "", 
        timeOfSample: JSON.stringify(new Date()).replace(/"/gi, ''), 
        uncertaintyInMilliseconds: 0 }
}
module.exports = PowerControllerResponse;
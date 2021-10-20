let AlexaResponse = require("./alexaResponse");
let Common=require('../../../common');
const DynamoDB = require("../../../dynamo");
'use strict';
class ReportStateResponse {
    constructor(event) {
        this.event = event;
        this.common=new Common();
        this.db=new DynamoDB();
    }
  async  getResponse() {
        console.log('reportstate called');
        let endpoint_id = this.event.directive.endpoint.endpointId;
        let token = this.event.directive.endpoint.scope.token;
        let correlationToken = this.event.directive.header.correlationToken;
        let ar = new AlexaResponse(
            {
                "correlationToken": correlationToken,
                "token": token,
                "endpointId": endpoint_id,
                "name": "StateReport"
            }
        );
        ar.addContextProperty(this.common.endpointHealthContext);
        let powerContext=this.common.powerControllerContext;
        console.log('retrieve data from dynamo');
        let data=await this.db.getDeviceState(endpoint_id);
        console.log(data);
        powerContext.value=data[0].powerState;
        ar.addContextProperty(powerContext);
        console.log(JSON.stringify(ar.get()));
        return ar.get();
    }
}
module.exports=ReportStateResponse;
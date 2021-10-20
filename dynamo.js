var AWS = require("aws-sdk");
const config = require('./config.json');
'use strict';
class DynamoDB {
    awsConfig = {
        "region": config.region || "eu-west-1",
        "endpoint": config.dbEndpoint || "http://dynamodb.eu-west-1.amazonaws.com",
        "accessKeyId": config.accessKeyId,
        "secretAccessKey": config.secretAccessKey
    };

    async updateDeviceState(endpointId, powerState) {
          let docClient = new AWS.DynamoDB.DocumentClient();
        AWS.config.update(this.awsConfig);
        var params = {
            TableName: config.dbTableName,
            Key: { "endpointId": endpointId },
            UpdateExpression: "set powerState =:powerState,updated_on=:updated_on",
            ExpressionAttributeValues: {
                ':updated_on':new Date().toString(),
                ':powerState':powerState
            },
            ReturnValues: "UPDATED_NEW"
        };

        const result = await docClient.update(params).promise();
        return result.Items;
    }

    async getDeviceState(endpointId) {
        let docClient = new AWS.DynamoDB.DocumentClient();
        AWS.config.update(this.awsConfig);
        var params = {
            TableName: config.dbTableName || "AreanaIoTDb",
            Key: {
                "endpointId": endpointId
            },
            KeyConditionExpression: "endpointId = :endpointId",
            ExpressionAttributeValues: {
                ':endpointId': endpointId
            }
        };
        const result = await docClient.query(params).promise();
        return result.Items;
    }
    async addNewDevice(endpointId)
    {
        let docClient = new AWS.DynamoDB.DocumentClient();
        AWS.config.update(this.awsConfig);
        var input = {
            "endpointId": endpointId, 
            "powerState": "OFF",
            "created_on": new Date().toString(),
            "updated_on": new Date().toString()
        };
        var params = {
            TableName: config.dbTableName || "AreanaIoTDb",
            Item:  input
        };
        docClient.put(params, function (err, data) {
    
            if (err) {
                console.log("users::save::error Db Put - " + JSON.stringify(err, null, 2));                      
            } else {
                console.log("users::Db Put::success" );                      
            }
        });
    }
}
module.exports = DynamoDB;


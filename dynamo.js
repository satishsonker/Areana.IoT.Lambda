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
           // KeyConditionExpression: "endpointId = :endpointId",
            Key: { "endpointId": endpointId },
            UpdateExpression: "set powerState ="+powerState,
            ReturnValues: "UPDATED_NEW"
        };

        const result = await docClient.query(params).promise();
        return result.Items;
    }

    async getDeviceState(endpointId) {
        let docClient = new AWS.DynamoDB.DocumentClient();
        AWS.config.update(this.awsConfig);
        var params = {
            TableName: config.dbTableName || "AreanaIoTDb",
            Key: {
                "endpointId": "endpointId"
            },
            KeyConditionExpression: "endpointId = :endpointId",
            ExpressionAttributeValues: {
                ':endpointId': endpointId
            }
        };
        const result = await docClient.query(params).promise();
        return result.Items;
    }
}
module.exports = DynamoDB;


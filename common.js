class Common{
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
module.exports=Common;
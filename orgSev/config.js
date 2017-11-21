var defaultConfig = {
    "orgSevConfig": {
        "orgId": "H",
        "orgName": "HappyGo",
        "port": "5000"
    },
    "EX_ADDRESS":"http://localhost:5003",
    "issuerAddress":{
        "H":"http://localhost:5000",
        "F":"http://localhost:5001"
    },
    "gatewayAddress":"http://localhost:4001",
    "fabric":{
        "channelName":"mychannel",
        "ccName":"r0",
        "user": {
            "enrollID": "orgAdmin",
            "enrollSecret": "87654321"
     
        }
    }
}

var env = process.env
function replaceByEnv(configs, paramParentArray = []) {
    for (let config in configs) {

        let childParamParentArray = JSON.parse(JSON.stringify(paramParentArray))
        childParamParentArray.push(config)
        if (typeof configs[config] == 'object' && !Array.isArray(configs[config])) {
            replaceByEnv(configs[config], childParamParentArray)
        } else {
            let envName = ""
            for (let paramString of paramParentArray) {
                envName += paramString.toUpperCase()
                envName += "_"
            }
            envName += config.toUpperCase()
            console.log('find env')
            console.log(envName)
            console.log(env[envName])
            if (env[envName]) {

                console.log('env exist')
                configs[config] = env[envName]
            }
        }
    }

}
replaceByEnv(defaultConfig)

module.exports = defaultConfig
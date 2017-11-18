var defaultConfig = {
    "orgSevConfig": {
        "orgId": "H",
        "orgName": "HappyGo",
        "port": "5000"
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
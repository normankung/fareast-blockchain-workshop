var request = require('request');
var config = require('../config');
var constants = require('../constants')
var postRequest = (url, body) => {
    return new Promise((rs, rj) => {
        request.post({
            url,
            json: true,
            body
        }, (err, resp, body) => {
            if (err != null) {
                rj(err)
            } else {
                console.log(resp.statusCode)
                if (resp.statusCode != 200) {
                    // console.log(' result err') console.log(body)
                    rj(body)
                } else {
                    // console.log('result success') console.log(body)
                    rs(body)
                }
            }
        })
    })

}
module.exports.postRequest = postRequest
var makeChancodeInokeBody = (functionName, args) => {
    return {chaincodeName: config.fabric.ccName, channelName: config.fabric.channelName, functionName, args, user: config.fabric.user}
}

module.exports.invokeBlockchain = (url, functionName, args) => {
    invokeBody = makeChancodeInokeBody(functionName, args)
    console.log("invokeBody")
    // console.log(invokeBody)
    return postRequest(url, invokeBody)

}
class responseHelper {
    constructor(res) {
        this.res = res
    }
    resSuccess(result) {

        this
            .res
            .json({status: "ok", result: result})
    }
    resFail(e) {
        console.log(e instanceof Error)
        console.log(e)
        if (e instanceof Error) {
            e = e.toString()
        }
        this
            .res
            .json({status: "failed", result: e})

    }
}

module.exports.responseHelper = responseHelper
var utils = require('../utils')
var config = require('../config');
var constants = require('../constants')

var getRemainPoint = (userID, sourceOrgID) => {
    console.log('< getRemain Point >')
    let checkRemainPointRouter = constants.router.issuserServer.remainPoint
    let sourcerServerAddress = config.issuerAddress[sourceOrgID]
    let url = sourcerServerAddress + checkRemainPointRouter
    console.log('url')
    console.log(url)
    return utils.postRequest(url, {userID})
}
module.exports.getRemainPoint = getRemainPoint
var checkRemainPoint = (userID, sourceOrgID, pointAmount) => {
    console.log('< checkRemainPoint >')
    return getRemainPoint(userID, sourceOrgID).then((res) => {
        console.log(res)
        let result = res.result
        try {
            result = parseInt(result, 10)
        } catch (e) {
            console.log(e)
        }
        if (result < pointAmount) {
            console.log("point is not enough")
            return Promise.reject("point is not enough")

        } else {
            console.log("point is  enough")
            return Promise.resolve('ok')
        }
    })
}
module.exports.checkRemainPoint = checkRemainPoint

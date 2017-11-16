var router = require('./index');
var config = require('../config');
var fs = require('fs');
var utils = require('../utils')
var constants = require('../constants')
var userData = require('../userData')
var issuerService = require('../service/issuerServer')
function rewirte() {
    fs.writeFileSync(shopDataPath, shopData);
}

router.post('/exchange', (req, res) => {
    console.log("< exchange start >")
    let resHelper = new utils.responseHelper(res)
    let {userID, sourceOrgID, targetOrgID, pointAmount} = req.body;
    issuerService
        .checkRemainPoint(userID, sourceOrgID, pointAmount)
        .then((res) => {
            console.log("start trigger blockchain")
            let url = config.gatewayAddress + constants.router.gateway.chaincodeInvoke
            return utils.invokeBlockchain(url, "Invoke_Exchange_Point", [
                userID, sourceOrgID, targetOrgID, pointAmount.toString()
            ])
        })
        .then((result) => {
            resHelper.resSuccess(result)
        })
        .catch((e) => {
            resHelper.resFail(e)
        })
})

router.post("/settlement", (req, res) => {
    let resHelper = new utils.responseHelper(res)
    console.log(resHelper)
    let url = config.gatewayAddress + constants.router.gateway.chaincodeInvoke
    utils
        .invokeBlockchain(url, "Invoke_Generate_Settlement_Report", [])
        .then(resHelper.resSuccess.bind(resHelper), resHelper.resFail.bind(resHelper))
})

router.post("/user/points", (req, res) => {
    let resHelper = new utils.responseHelper(res)
    let {userID} = req.body;
    let orgID = userData[userID].orgID
    let url = config.gatewayAddress + constants.router.gateway.chaincodeQuery
    let p1 = utils.invokeBlockchain(url, "Query_Get_User_By_UserID", [userID])
    let p2 = issuerService.getRemainPoint(userID, orgID)
    return Promise
        .all([p1, p2])
        .then((result) => {
            let blockchainResult = JSON.parse(result[0].sdkResult)
            let blockChainPointMap = blockchainResult.Points
            console.log('points map ')
            console.log(blockChainPointMap)
            let issuerResult = result[1]

            let orgPoint = issuerResult.result
            console.log('issuser point')
            console.log(orgPoint)
            blockChainPointMap[orgID] = orgPoint
            return blockChainPointMap
        })
        .then((result) => {
            resHelper.resSuccess(result)
        }, (err) => {
            resHelper.resFail(err)
        })
})

router.post("/user/txHistory/exchange", (req, res) => {
    let resHelper = new utils.responseHelper(res)
    let {userID} = req.body;
    let orgID = userData[userID].orgID
    let url = config.gatewayAddress + constants.router.gateway.chaincodeQuery
    utils
        .invokeBlockchain(url, "Query_List_Tx_History_By_User", [userID])
        .then((result) => {
            let txHistoryList = JSON.parse(result.sdkResult)
            let finalTxHistory = []
            for (let txHistory of txHistoryList) {
                if (txHistory.TxType == 'EXCHANGE') {
                    finalTxHistory.push(txHistory)
                }
            }
            return finalTxHistory
        })
        .then((result) => {
            resHelper.resSuccess(result)
        }, (err) => {
            resHelper.resFail(err)
        })
})

router.post("/user/txHistory/redeem", (req, res) => {
    let resHelper = new utils.responseHelper(res)
    let {userID} = req.body;
    let orgID = userData[userID].orgID
    let url = config.gatewayAddress + constants.router.gateway.chaincodeQuery
    utils
        .invokeBlockchain(url, "Query_List_Tx_History_By_User", [userID])
        .then((result) => {
            let txHistoryList = JSON.parse(result.sdkResult)
            let finalTxHistory = []
            for (let txHistory of txHistoryList) {
                if (txHistory.TxType == 'REDEEM_POINT') {
                    finalTxHistory.push(txHistory)
                }
            }
            return finalTxHistory
        })
        .then((result) => {
            resHelper.resSuccess(result)
        }, (err) => {
            resHelper.resFail(err)
        })
})
var router = require('./index');
var config = require('../config');
var myParser = require("body-parser");
var fs = require('fs');
var path = require('path');
var rp = require("request-promise");
var utils = require('../utils')
var constants = require('../constants')
var dbPath = config.orgSevConfig.orgId;

// var shopID = config.shopSevConfig.shopId;
var shopDataPath = '../db/' + dbPath + '/shopData.json'
var ShopDataPath = path.join(__dirname, shopDataPath);
var shopData = require(ShopDataPath)

var userDataPath = '../db/' + dbPath + '/userData.json'
var UserDataPath = path.join(__dirname, userDataPath);
var userData = require(UserDataPath)

var orgID = config.orgSevConfig.orgId;
var orgDataPath = '../db/' + dbPath + '/orgData.json'
var OrgDataPath = path.join(__dirname, orgDataPath);
var orgData = require(OrgDataPath)

router.use(myParser.urlencoded({extended : true}));

function reWrite(db) {
    if (db == "shop") {
        fs.writeFileSync(ShopDataPath, JSON.stringify(shopData));
    }
    else if(db == "user"){
        fs.writeFileSync(UserDataPath, JSON.stringify(userData));
    }
    else if(db == "org"){
        fs.writeFileSync(OrgDataPath, JSON.stringify(orgData));
    }
}

function callAPI(urlAPI, postData){
    const options = {
        method: 'POST',
        uri: urlAPI,
        headers: {
            'content-type': 'application/json'
        },
        json: postData
    }
    

    return rp(options)
    .then(function (response) {
        return Promise.resolve(response)
    })
}

var io
setTimeout(function() {
    io = require('../io').getIo()
}, 2000);

// Give loyalty point to user
router.post("/receive/issue", (req, res) => {
    var shopId = req.body.shopId;
    var issuePoint = req.body.issuePoint;
    var userId = req.body.userId;

    // Update shopData, userData, orgData
    shopData.shop[shopId].issuePoint += issuePoint;
    userData.user[userId].point += issuePoint;
    orgData.issuePoint += issuePoint;

    // rewrite into db
    reWrite("shop");
    reWrite("user");
    reWrite("org");

    io.emit('shopIssuePoints')

    // response
    res.json({status: 'ok', api: 'receive/issue', reason: ''})
})

// Receive loyalty point from user
router.post("/receive/receive", (req, res) => {
    var shopId = req.body.shopId
    var holdPoint = req.body.holdPoint
    var userId = req.body.userId
    var redeemMetaData = req.body.redeemMetaData
    // var csArray = [userId, targetOrgID, holdPoint.toString(), JSON.stringify(redeemMetaData)]
    // console.log(csArray)


    // Check UserId
    if (!userData.user[userId]) {
        // If user belong to other org
        // Trigger BlockChain
        var targetOrgID = config.orgSevConfig.orgId// == "H" ? "H" : "F"
        let url = config.gatewayAddress + constants.router.gateway.chaincodeInvoke
        redeemMetaData = JSON.stringify(redeemMetaData)
        var csArray = [userId, targetOrgID, holdPoint.toString(), redeemMetaData]
        // console.log(typeof(redeemMetaData))
        console.log(csArray)
        utils
            .invokeBlockchain(url, "Invoke_Redeem_Point", csArray)
            .then((result) => {
                console.log(result)
                shopData.shop[shopId].holdPoint += holdPoint
    
                reWrite("shop");
                res.json({"status" : "ok"})
                io.emit('shopReceivePoints')
            })
            .catch((e) => {
                res.json({"status" : "fail", "reason":e})
            })
    }
    else{
        // If user belong to org
        // Check User Point
        if (userData.user[userId].point < holdPoint) {
            res.json({status: "Fail", reason: "User's issuePoint is no enough!"});
        }
        else{
            userData.user[userId].point -= holdPoint;        
        }

        // Update shopData
        shopData.shop[shopId].holdPoint += holdPoint;

        // rewrite into db
        reWrite("shop");
        reWrite("user");

        // response
        res.json({status: 'ok', api: 'receive/receive', reason: ''})
        io.emit('shopReceivePoints')
    }
})

router.post("/receive/settlementWithOrg", (req, res)=>{
    var balance = req.body.balance
    var seqNum = req.body.seqNum

    // 先到Blockchain查詢
    let reportID = parseInt(seqNum)
    let url1 = config.gatewayAddress + constants.router.gateway.chaincodeQuery
    utils
        .invokeBlockchain(url1, "Query_Settlement_Report", [reportID.toString()])
        .then((result) => {
            let blockchainResult = JSON.parse(result.sdkResult)
            let jsonFile = {}
            let me = blockchainResult[0].SettlementReports[config.orgSevConfig.orgId]
            let HaveSettle = blockchainResult[0].HaveSettle
            // 如果有值， balance一樣， 還沒settle
            if (blockchainResult[0] && me.Money == (balance*-1) && HaveSettle == "false") {            
                console.log("Confirm report")
                console.log(blockchainResult)
                
                // After confirm report
                // Start trigger blockchain
                console.log("Start trigger blockchain")
                let url2 = config.gatewayAddress + constants.router.gateway.chaincodeInvoke
                utils
                    .invokeBlockchain(url2, "Invoke_Settlement", [seqNum])
                    .then((result) => {
                        blockchainResult = result.sdkResult
                        console.log(blockchainResult)
                        if (blockchainResult != "") {
                            return {status : "ok"}
                        }
                    })
                    .then((result)=>{
                        if (result.status == "ok") {
                            // 伺服器資料庫修正
                            var point = parseInt(me.Point)
                            orgData.balance -= balance // Need to confirm
                            // orgData.issuePoint += point
                            reWrite("org");
                            res.json({status: "ok"}); 
                        }
                        else{
                            res.json({status: "fail"}); 
                        }
                    })
            }
            else{
                res.json({status: "fail", reason: "query error!"})
            }
        })
})

module.exports = router;
var express = require('express');
var router = express.Router();
var config = require('../config');
var myParser = require("body-parser");
var fs = require('fs');
var path = require('path');
var rp = require("request-promise");
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

// Give loyalty point to user
router.post("/issue", (req, res) => {
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

    // response
    res.json({status: 'ok', api: 'receive/issue', reason: ''})
})

// Receive loyalty point from user
router.post("/receive", (req, res) => {
    var shopId = req.body.shopId;
    var holdPoint = req.body.holdPoint;
    var userId = req.body.userId;
    var redeemMetaData = req.body.redeemMetaData;

    // Check UserId
    if (!userData.user[userId]) {
        // If user belong to other org
        // Trigger BlockChain
        config.orgSevConfig.orgId == "H" ? targetOrgID = "H" : targetOrgID = "F";

        var sendJson ={
            "chaincodeName": "r0",
            "channelName": "mychannel",
            "functionName": "Invoke_Redeem_Point",
            "args": [userId, targetOrgID, holdPoint.toString(), JSON.stringify(redeemMetaData)
            ],
            "user": {
              "enrollID": "orgAdmin",
              "enrollSecret": "87654321"
            }
        }
        // console.log(sendJson);
        var url = "http://localhost:4001/chaincode/invoke";
        var invoke = callAPI(url, sendJson)
        .then((resp)=>{
            // resp = JSON.parse(resp.sdkResult);
            console.log(resp);
            return Promise.resolve(resp); // 怎樣判斷有無問題？ Return感覺很亂
        });

        invoke.then((resp) => {
            // console.log(resp)
            shopData.shop[shopId].holdPoint += holdPoint;
            orgData.issuePoint -= holdPoint;

            reWrite("shop");
            reWrite("org");
            res.json({"status" : "ok"})
        })
        // res.json({"status" : "okZ"})
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
        reWrite("org");

        // response
        res.json({status: 'ok', api: 'receive/receive', reason: ''})
    }
})

// Query User's Point
router.post("/queryUser", (req, res) => {
    var userId = req.body.userId;
    var point = userData.user[userId].point;

    res.json({point: point})
})

// Query Users's Point
router.post("/queryUsers", (req, res) => {
    res.json(userData.user);
})

// User exchange Point and then reduce point
router.post("/reducePoint", (req, res) => {
    var userId = req.body.userId;
    var exchangePoint = req.body.exchangePoint;

    // Update userData
    userData.user[userId].point -= exchangePoint;

    //rewrite into db
    reWrite("user");

    res.json({"status": "ok"});
})

router.post("/settlementWithOrgReceive", (req, res)=>{
    var moneyNum = req.body.money;
    var reportIdString = req.body.reportId;

    // 收到錢的balance後，跟blockchain進行確認
    // Trigger Blockchain
    var sendJson = {
        "chaincodeName": "r0",
        "channelName": "mychannel",
        "functionName": "Invoke_Settlement",
        "args": [
            reportIdString
        ],
        "user": {
            "enrollID": "orgAdmin",
            "enrollSecret": "87654321"
        }
    }

    // console.log(sendJson);
    var url = "http://localhost:4001/chaincode/invoke";
    var invoke = callAPI(url, sendJson)
    .then((resp)=>{
        // 伺服器資料庫修正
        orgData.balance += moneyNum; // Need to confirm
        reWrite("org");
        
        resp.json({"status": "ok"});  
        // return Promise.resolve(resp)        
    });

    //改變blockchain record後回傳到另一個orgSev
    // invoke.then((res)=>{
    //     var sendJson = {"status": "ok"}
    //     var url = "http://localhost:5000/chaincode/invoke"; // 要修正port
    //     callAPI(url, sendJson)
    //     .then((resp)=>{
    //         orgData.balance += moneyNum; // Need to confirm
    //         reWrite("org");
    //         resp.json({"status": "ok"});      
    //     });
    // })
    // org balance 在這時候要先修改？
})

// router.get('/', function(req, res, next) {
//     res.render('trigger', { shopData: shopData.shop });
// });

module.exports = router;
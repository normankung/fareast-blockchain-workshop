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
        json: postData 
    }

    return rp(options)
    .then(function (response) {
        return Promise.resolve(response)
    })
   
}

router.post("/settlement", (req, res) => {
    var issuePointRate = 1;
    var holdPointRate = 1;
    var promisesArray = [];

    // i == shopId
    for (var i in shopData.shop) {
        var issueMoney = shopData.shop[i].issuePoint * issuePointRate;
        var holdMoney  = shopData.shop[i].holdPoint * holdPointRate;

        // The total money that Org should give to shop
        var total = holdMoney - issueMoney;

        // trigger API
        var url = "http://localhost:"+ shopData.shop[i].port +"/receive/settlement";
        var sendJson = {balance: total}
        // callAPI(url, sendJson);

        p = callAPI(url, sendJson).then((resp)=>{
            if (resp.status == "ok"){
                console.log(resp);
                // rewrite into db
                // reWrite("shop");
                // reWrite("org");

                return Promise.resolve('ok')
            }
            else{
                // res.json({status: 'fail', api: 'trigger/settlement', reason: ''})  
                return Promise.reject('failed')
            }
        });
        // Update Data
        orgData.issuePoint -= shopData.shop[i].holdPoint;
        shopData.shop[i].issuePoint = 0;
        shopData.shop[i].holdPoint = 0;
        orgData.balance -=  total;

        // Push Promise
        promisesArray.push(p);
    }
    return Promise.all(promisesArray).then(()=>{
        // rewrite into db
        reWrite("shop");
        reWrite("org");

        // response
        res.json({status: 'ok', reason: ''})        
    }).catch((err)=>{
        res.json({err})
    })
})

// exchangeSev 的 API, 這裡不會用到了
router.post("/generateReport", (req, res)=>{
    // Trigger Blockchain
    var sendJson ={
        "chaincodeName": "r0",
        "channelName": "mychannel",
        "functionName": "Invoke_Generate_Settlement_Report",
        "args": [],
        "user": {
          "enrollID": "orgAdmin",
          "enrollSecret": "87654321"
        }
    }

    // console.log(sendJson);
    var url = "http://localhost:4001/chaincode/invoke";
    var invoke = callAPI(url, sendJson)
    .then((resp)=>{
        console.log(resp);
        // return Promise.resolve(resp); // 怎樣判斷有無問題？ Return感覺很亂
        res.json({"status": "ok", api: 'trigger/generateReport'})
    });
})

// query report from blockchain
router.post("/queryReport", (req, res)=>{
    var version = req.body.version.toString(); // 輸入要查詢的版本

    // Trigger Blockchain
    var sendJson ={
        "chaincodeName": "r0",
        "channelName": "mychannel",
        "functionName": "Query_Settlement_Report",
        "args": [ version ],
        "user": {
          "enrollID": "orgAdmin",
          "enrollSecret": "87654321"
        }
    }

    // console.log(sendJson);
    var url = "http://localhost:4001/chaincode/invoke";
    var invoke = callAPI(url, sendJson)
    .then((resp)=>{
        var result = JSON.parse(resp.sdkResult);
        var orgId = config.orgSevConfig.orgId;
        console.log(result[0].HaveSettle);
        console.log(result[0].SettlementReports[orgId]); // Notice
        res.json(resp)
    });
})

// 結清balance
router.post("/settlementWithOrgTrigger", (req, res)=>{
    var moneyNum = req.body.money;
    // Trigger Blockchain
    var sendJson ={"balance": money}

    // console.log(sendJson);
    var url = "http://localhost:5001/receive/settlementWithOrgReceive"; // 要修正port
    var invoke = callAPI(url, sendJson)
    .then((resp)=>{
        // Trigger 成功後這裡的資料也做修正
        orgData.balance += moneyNum; // Need to be confirm
        reWrite("org");

        res.json(resp);
    });
})

router.get('/', function(req, res, next) {
    res.render('trigger', { shopData: shopData.shop });
});

module.exports = router;
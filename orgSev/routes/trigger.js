var router = require('./index');
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

var io
setTimeout(function() {
    io = require('../io').getIo()
}, 2000);

router.post("/trigger/settlement", (req, res) => {
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
        io.emit('settlementWithShops')  
        res.json({status: 'ok', reason: ''})    
    }).catch((err)=>{
        res.json({err})
    })
    
})

/* 傳送清算balance給另一台orgSev */
router.post("/trigger/settlementWithOrg", (req, res)=>{
    var Phase = req.body.Phase
    var balance = parseInt(req.body.balance)    

    // Trigger Blockchain
    var sendJson ={Phase: Phase, balance: balance}
    
    // console.log(sendJson);
    var target = (config.orgSevConfig.orgId === "H") ? "F" : "H"

    var url = config.issuerAddress[target] + "/receive/settlementWithOrg";
    var invoke = callAPI(url, sendJson)
    .then((result)=>{
        // Trigger 成功後這裡的資料也做修正
        if (result.status == "ok") {
            orgData.balance += balance // Need to be confirm
            reWrite("org")
            // io.emit('Settle_Finish')
            res.json({status: "ok"})
        }
        else{
            res.json({status: "fail"})
        } 
    });
})

router.get('/', function(req, res, next) {
    res.render('trigger', { shopData: shopData.shop });
});

module.exports = router;
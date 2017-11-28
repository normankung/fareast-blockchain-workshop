var router = require('./index');
var config = require('../config');
var myParser = require("body-parser");
var fs = require('fs');
var path = require('path');
var rp = require("request-promise");

// Link to DB json
var shopID = config.shopSevConfig.shopId;
var shopDataPath = '../db/' + shopID + '.json'
var DataPath = path.join(__dirname, shopDataPath);
var shopData = require(DataPath)

router.use(myParser.urlencoded({extended : true}));

// Update db Json File
function reWrite() {
    fs.writeFileSync(DataPath, JSON.stringify(shopData));
}

// Call API
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

// Shop give User Point
router.post("/trigger/issue", (req, res) => {
    // Input data
    var userId = req.body.userId
    var issuePoint = parseInt(req.body.issuePoint)

    // Trigger orgSev
    var url = "http://localhost:"+ config.shopSevConfig.orgPort +"/receive/issue";
    var sendJson = {
        shopId: config.shopSevConfig.shopId,
        issuePoint: issuePoint,
        userId: userId
    }

    // var returnAPI = "";
    callAPI(url, sendJson).then((resp)=>{
        if (resp.status == "ok"){
            console.log(resp);
            // Calculate data
            shopData.issuePoint += issuePoint;
            // Update DB's Json File
            reWrite();
            res.json({status: 'ok', issuePoint: shopData.issuePoint, api: 'trigger/issue', reason: ''});      
        }
        else{
            res.json({status: 'fail', api: 'trigger/issue', reason: ''})  
        }
    });
})

// Shop receive User Point
router.post("/trigger/receive", (req, res) => {
    // Input data
    var userId = req.body.userId
    var itemId = req.body.itemId
    var point = shopData.items[itemId].point
    var cash = shopData.items[itemId].cash
    var summary = "Nothing"

    var redeemMetaData = {
        "ProductID" : itemId,
        "Price" : point.toString(),
        "Point" : cash.toString(),
        "Summary" : summary
    }

    // Trigger orgSev
    var url = "http://localhost:"+ config.shopSevConfig.orgPort +"/receive/receive";
    var sendJson = {
        shopId: config.shopSevConfig.shopId,
        holdPoint: point,
        userId: userId,

        redeemMetaData: redeemMetaData
    }
    
    callAPI(url, sendJson).then((resp)=>{
        if (resp.status == "ok"){
            console.log(resp);
            // Calculate data
            shopData.holdPoint += point;
            // Update DB's Json File
            reWrite();
            res.json({status: 'ok', holdPoint: shopData.holdPoint, api: 'trigger/receive', reason: ''});      
        }
        else{
            res.json({status: 'fail', reason: resp.reason})  
        }
    });
})

module.exports = router;
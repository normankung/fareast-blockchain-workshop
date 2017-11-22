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

// ShopId Data
router.post("/", (req, res) => {
    var resJson = {    
        shopId : config.shopSevConfig.shopId,
        orgId : config.shopSevConfig.orgId
    }
    res.json(resJson)
})

// Shop Data
router.post("/shopData", (req, res) => {
    var resJson = {    
        issuePoint : shopData.issuePoint,
        holdPoint : shopData.holdPoint,
        balance :shopData.balance
    }
    res.json(resJson)
})

//orgId
router.post("/orgId", (req, res) => {
    res.json({orgId: config.shopSevConfig.orgId})
})

// items Data
router.post("/items", (req, res) => {

    res.json({items : shopData.items})
})
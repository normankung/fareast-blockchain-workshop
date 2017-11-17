var express = require('express');
var router = express.Router();
var config = require('../config');
var myParser = require("body-parser");
var fs = require('fs');
var path = require('path');

// Link to DB json
var shopID = config.shopSevConfig.shopId;
var shopDataPath = '../db/' + shopID + '.json'
var DataPath = path.join(__dirname, shopDataPath);
var shopData = require(DataPath)

router.use(myParser.urlencoded({extended : true}));

// rewrite db's json
function reWrite() {
    fs.writeFileSync(DataPath, JSON.stringify(shopData));
}

router.post("/settlement", (req, res) => {
    var balance = req.body.balance;
    shopData.balance += balance;
    shopData.issuePoint = 0;
    shopData.holdPoint = 0;
    reWrite();
    res.json({status: 'ok', api: 'receive/settlement', port: config.shopSevConfig.port, reason: ''})
})

module.exports = router;
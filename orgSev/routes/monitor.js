var express = require('express');
var router = express.Router();
var config = require('../config');
var myParser = require("body-parser");
var fs = require('fs');
var path = require('path');
var request = require("request-promise");
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

function callAPI(urlAPI, postData){
    const options = {
        method: 'POST',
        uri: urlAPI,
        json: postData 
    }

    request(options)
    .then(function (response) {
        console.log(response)
    })
    .catch(function (err) {
        console.log(err)
        res.render('error')
    })
}

router.post("/refrestData", (req, res) => {
    // trigger API Send Data to monitor
    var url = "http://localhost:5000/monitor/orgData";
    var sendJson = orgData;
    callAPI(url, sendJson);

    var url = "http://localhost:5000/monitor/shopData";
    var sendJson = shopData;
    callAPI(url, sendJson);

    var url = "http://localhost:5000/monitor/userData";
    var sendJson = userData;
    callAPI(url, sendJson);

    // response
    res.json({status: 'ok', reason: ''})
})

router.get('/', function(req, res, next) {
    res.render('trigger', { 
        shopData: shopData.shop,
        userData: userData.user,
        orgData: orgData,
        orgId: config.orgSevConfig.orgId,
        orgName: config.orgSevConfig.orgName
    });
});

module.exports = router;
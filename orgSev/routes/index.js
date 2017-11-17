var express = require('express');
var router = express.Router();
var config = require('../config');
var path = require('path');

var dbPath = config.orgSevConfig.orgId;

var shopDataPath = '../db/' + dbPath + '/shopData.json'
var ShopDataPath = path.join(__dirname, shopDataPath);
var shopData = require(ShopDataPath)

var userDataPath = '../db/' + dbPath + '/userData.json'
var UserDataPath = path.join(__dirname, userDataPath);
var userData = require(UserDataPath)

var orgDataPath = '../db/' + dbPath + '/orgData.json'
var OrgDataPath = path.join(__dirname, orgDataPath);
var orgData = require(OrgDataPath)

/* GET OrgName */
router.post('/', function(req, res) {
  var orgName = config.orgSevConfig.orgName;
  console.log(orgName)
  res.json({orgName:orgName});
});

/* GET Shops's Data */
router.post('/shopsData', function(req, res) {
  res.json({shopData: shopData.shop});
});

/* GET Users's Data */
router.post('/usersData', function(req, res) {
  res.json({userData: userData.user});
});

/* GET Org's Data */
router.post('/orgData', function(req, res) {
  var orgID = config.orgSevConfig.orgId;  
  res.json({
    orgId: orgID,
    issuePoint: orgData.issuePoint,
    balance: orgData.balance
  });
});

module.exports = router;

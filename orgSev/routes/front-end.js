var router = require('./index');
var config = require('../config');
var path = require('path');
var utils = require('../utils')
var constants = require('../constants')


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

/* GET Users's Data */
router.post('/user/point', function(req, res) {
  var userId = req.body.userID
  var point = userData.user[userId].point
  res.json({result: point});
});

/* Query Report by seqNum */
router.post('/query/report', (req, res) => {
  let reportID = req.body.seqNum
  let url = config.gatewayAddress + constants.router.gateway.chaincodeQuery
  // let p1 = utils.invokeBlockchain(url, "Query_Settlement_Report", [reportID])
  utils
    .invokeBlockchain(url, "Query_Settlement_Report", [reportID])
    .then((result) => {
      let blockchainResult = JSON.parse(result.sdkResult)
      let jsonFile = {}
      if (blockchainResult[0]) {
        let seqNum = blockchainResult[0].SeqNum
        let me = blockchainResult[0].SettlementReports[config.orgSevConfig.orgId]
        let HaveSettle = blockchainResult[0].HaveSettle
        
        console.log(blockchainResult)
        jsonFile = {
          seqNum : seqNum,
          me : me,
          HaveSettle: HaveSettle
        }
        // return result
        res.json({status: "ok", jsonFile});
      }
      else{
        res.json({status: "fail"});
      }
    }, (err) => {
      res.json({status: "fail", err});
    })
})

module.exports = router;
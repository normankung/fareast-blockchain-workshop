var router = require('./index');
var config = require('../config');
var path = require('path');
var utils = require('../utils')
var constants = require('../constants')
var promiseLoop = require('promise-loop');


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

/* Query Reports */
router.post('/query/reports', (req, res) => {  
  let tmp = '{"result":[]}'
  let resultArray = JSON.parse(tmp);
  let url = config.gatewayAddress + constants.router.gateway.chaincodeQuery
  let me = config.orgSevConfig.orgId

  let target = me == "H" ? "F" : "H";

  var loopingPromise = function(value) {
    reportID = value.toString()
    return new Promise(function(resolve, reject) {
      utils.invokeBlockchain(url, "Query_Settlement_Report", [reportID])
      .then(function(result, reject) { 
        let blockchainResult = JSON.parse(result.sdkResult)
        if (blockchainResult[0]) {
          console.log('receiving');
          let resultJson = {
            Phase: blockchainResult[0].Phase,
            Me: blockchainResult[0].SettlementReports[me],
            Target: blockchainResult[0].SettlementReports[target],
            HaveSettle: blockchainResult[0].HaveSettle
          }
          resultArray['result'].push(resultJson)
          console.log(JSON.stringify(blockchainResult))
          resolve(++value);
        } else {
          if (resultArray.result[0]) {
            res.json({status: 'ok', reason: '', data: resultArray})
          }
          else{
            res.json({status: 'fail', reason: 'no report data'})
          }
          console.log('rejecting'); 
        }

      }, (err) => {
        reject("Err");
      })
    });
  };


  var myPromiseLoop = promiseLoop(loopingPromise);

  var promise = myPromiseLoop(1);
  // res.json({status: 'ok', reason: '', data: JSON.stringify(resultArray)}) 
})


module.exports = router;
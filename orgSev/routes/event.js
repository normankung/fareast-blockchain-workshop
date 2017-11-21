var router = require('./index');
var config = require('../config');
var myParser = require("body-parser");
var fs = require('fs');
var path = require('path');
var rp = require("request-promise");
var dbPath = config.orgSevConfig.orgId;

var userDataPath = '../db/' + dbPath + '/userData.json'
var UserDataPath = path.join(__dirname, userDataPath);
var userData = require(UserDataPath)

var orgID = config.orgSevConfig.orgId;
var orgDataPath = '../db/' + dbPath + '/orgData.json'
var OrgDataPath = path.join(__dirname, orgDataPath);
var orgData = require(OrgDataPath)

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

var io
setTimeout(function() {
    io = require('../io').getIo()
}, 2000);


router.post('/fabric-event', (req, res) => {
    console.log('receive event');
    // console.log(req.body)

    payload = Buffer
        .from(req.body.payload.data)
        .toString()
    console.log(payload)
    console.log("===================")
    console.log(req.body.event_name)
    payload =JSON.parse(payload)
    switch (req.body.event_name){
        case "User_Exchange":
            var deductPoint = parseInt(payload.deductAmount)
            var orgName = payload.orgName
            var targetOrgID = payload.targetOrgID
            var userID = payload.userID

            // 點數交換出去
            if (config.orgSevConfig.orgId == orgName) {
                userData.user[userID].point -= deductPoint;
                reWrite("user")
                console.log("Receive Event : Deduct_Point : 點數交換出去")
            }

            // 點數交換進來
            if (config.orgSevConfig.orgId == targetOrgID){
                orgData.issuePoint += deductPoint
                reWrite("org")
                console.log("Receive Event : Deduct_Point : 點數交換進來")
            }
            
            io.emit('exchangeResult')
            res.json({"res":"ok"})
            
            break;


        case "Settle_Finish":
            for (var i in payload){
                if (config.orgSevConfig.orgId == i){
                    var returnPoints_H = parseInt(payload[i])
                    orgData.issuePoint -= returnPoints_H
                    reWrite("org")
                    io.emit('Settle_Finish')
                    
                }
            }
            res.json({"res":"ok"})
            break;

        case "Settlement_Report_Finish":
            var phase = parseInt(payload.phase)
            io.emit("Settlement_Report_Finish", phase )
            res.json({status:"ok"})
            break;
            

        default:
            break;
    }

    
})

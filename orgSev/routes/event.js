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
    payload =JSON.parse(payload)
    switch (req.body.event_name){
        case "Deduct_Point_H":
            var userId = payload.userID
            var point = payload.deductAmount
            // {"deductAmount":"1000","orgName":"H","userID":"C"}

            // update database
            userData.user[userId].point -= point;
            reWrite("user")
            console.log("Receive Event : Deduct_Point_F")
            res.json({"res":"ok"})

            // Call Front-end
            io.emit('exchangeResult')
            break;
        case "Deduct_Point_F":
            var userId = payload.userID
            var point = payload.deductAmount
            // {"deductAmount":"1000","orgName":"H","userID":"C"}

            // update database
            userData.user[userId].point -= point;
            reWrite("user")
            console.log("Receive Event : Deduct_Point_F")
            res.json({"res":"ok"})

            // Call Front-end
            io.emit('exchangeResult')
            break;
        case "Settle_Finish_H":
            console.log("Receive Event : Settle_Finish_H")
            console.log(payload)

            var returnPoints = parseInt(payload.returnPoints)
            orgData.issuePoint -= returnPoints
            reWrite("org")
            console.log("ReWrite Org")

            res.json({"res":"ok"})
            // Call Front-end
            io.emit('Settle_Finish')
            break;
        case "Settle_Finish_F":
            console.log("Receive Event : Settle_Finish_F")
            console.log(payload)

            var returnPoints = parseInt(payload.returnPoints)
            orgData.issuePoint -= returnPoints
            reWrite("org")
            console.log("ReWrite Org")

            res.json({"res":"ok"})
            // Call Front-end
            io.emit('Settle_Finish')
            break;
        default:
            break;
    }

    
})
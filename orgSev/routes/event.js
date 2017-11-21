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
        case "Deduct_Point":
            var deductPoint = parseInt(payload.deductPoint)
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
            Add_Issue_Point("F",point)
            res.json({"res":"ok"})
            
            break;


        case "Settle_Finish":
            var returnPoints_H = parseInt(payload["H"].returnPoints)
            var returnPoints_F = parseInt(payload["F"].returnPoints)
            io.emit('Settle_Finish')
            res.json({"res":"ok"})

            break;

        case "Settlement_Report_Finish":
            var phase = parseInt(payload.phase)
            console.log("Damn!!!!!!!!!!!!!!!!!!!!!!!!!")
            io.emit("Settlement_Report_Finish", phase )
            res.json({status:"ok"})
            break;

        case "Settle_Finish_H":
            if (config.orgSevConfig.orgId == "H"){
                console.log("Receive Event : Settle_Finish_H")
                console.log(payload)

                var returnPoints = parseInt(payload.returnPoints)
                orgData.issuePoint -= returnPoints
                reWrite("org")
                console.log("ReWrite Org +++++++++++++++=")

                res.json({"res":"ok"})
                // Call Front-end
                io.emit('Settle_Finish')
                break;              
            }
            else{
                break;
            }
        case "Settle_Finish_F":
            if (config.orgSevConfig.orgId == "F"){
                console.log("Receive Event : Settle_Finish_F")
                console.log(payload)

                var returnPoints = parseInt(payload.returnPoints)
                if (payload.orgID=="H") {
                    
                }
                orgData.issuePoint -= returnPoints
                reWrite("org")
                console.log("ReWrite Org +++++++++++++++=")

                res.json({"res":"ok"})
                // Call Front-end
                io.emit('Settle_Finish')
                break;
            }
            else{
                break;
            }
        
        
            

        default:
            break;
    }

    
})

// 臨時加的

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

function Add_Issue_Point(orgName, IssueAmount){
    var target = (config.orgSevConfig.orgId === "H") ? "F" : "H"
    var url = config.issuerAddress[target] + "/Add_Issue_Point_tmp";
    callAPI(url, {orgName:orgName, IssueAmount:IssueAmount})
}

router.post('/Add_Issue_Point_tmp', (req, res) => {
    orgData.issuePoint += req.body.IssueAmount
    console.log("Add_Issue_Point")
    io.emit('Add_Issue_Point')
    res.json({status:"ok"})
})    
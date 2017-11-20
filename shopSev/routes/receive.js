var router = require('./index');
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

var io
setTimeout(function() {
    io = require('../io').getIo()
}, 2000);

// rewrite db's json
function reWrite() {
    fs.writeFileSync(DataPath, JSON.stringify(shopData));
}

router.post("/receive/settlement", (req, res) => {
    var balance = req.body.balance;
    shopData.balance += balance;
    shopData.issuePoint = 0;
    shopData.holdPoint = 0;
    reWrite();
    io.emit('settlement')
    res.json({status: 'ok', api: 'receive/settlement', port: config.shopSevConfig.port, reason: ''})
})

module.exports = router;
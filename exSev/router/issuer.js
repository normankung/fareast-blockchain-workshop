var router = require('./index');

var io
setTimeout(() => {
    io = require('../io').getIo()
}, 2000)

router.post('/user/deductPoint', (req, res) => {
    userID = req.body.result
    io.emit('Redeem_Finish', {userID: userID})
    res.json({result: "ok"})
})

var router = require('./index');

var io
setTimeout(() => {
    io = require('../io').getIo()
}, 2000)
/**
 * eventType: block or cc
 * payload: block-content or
 * { topic: string
 *   event :
 *
 * }
 */
router.post('/fabric-event', (req, res) => {
    console.log('receive event');
    console.log(req.body)
    let payload = Buffer
        .from(req.body.payload.data)
        .toString()
    console.log(payload)
    payload = JSON.parse(payload)
    res.json({result: 'OK'})
    let eventName = req.body.event_name

    switch (eventName) {
        case 'Redeem_Point':
            {
                io.emit('Redeem_Finish', payload)
            }
    }
})

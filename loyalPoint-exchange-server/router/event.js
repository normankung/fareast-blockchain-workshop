var router = require('./index');
var io = require('../io').getIo()
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
    payload = Buffer
        .from(req.body.payload.data)
        .toString()
    console.log(payload)
    res.json({result: 'OK'})
})

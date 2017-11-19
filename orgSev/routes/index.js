var router = require('express').Router();
var fs = require('fs')
module.exports = router

var exFile = ['event.js', 'front-end.js', 'receive.js', 'trigger.js'  ]
var files = fs.readdirSync(__dirname)

files.forEach((file) => {
    var ex = false
    for (var i = 0; i < exFile.length; i++) {
        if (file == exFile[i]) {
            ex = true
        }
    }
    if (ex) {
        require('./' + file)
    }
})
var router = require('express').Router();
var fs = require('fs')
module.exports = router

var exFile = ['receive.js', 'trigger.js', 'receive.js', 'front-end.js' ]
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
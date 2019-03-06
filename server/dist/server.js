"use strict";
exports.__esModule = true;
var express = require("express");
var app = express();
app.get('/', function (req, res) { return res.send('Hello World'); });
app.listen(3000, function () {
    console.log('server has been started on port 3000!');
});
//# sourceMappingURL=server.js.map
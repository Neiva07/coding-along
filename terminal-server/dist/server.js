"use strict";
exports.__esModule = true;
var express = require("express");
var dotenv = require("dotenv");
var pty = require('node-pty');
dotenv.config();
var port = process.env.PORT;
var app = express();
require('express-ws')(app);
var terminals = new Object();
app.get('/', function (req, res) { return res.send('Hello World'); });
app.use(function (req, res, next) {
    res.header('Access-Control-allow-Origin', '*')
        .header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
});
app.post('/terminals', function (req, res) {
    var cols = parseInt(req.query.cols, 10);
    var rows = parseInt(req.query.rows, 10);
    var platform = process.platform === 'win32' ? 'cmd.exe' : 'bash';
    var term = pty.spawn(platform, [], {
        name: 'xterm-color',
        cols: cols,
        rows: rows,
        cwd: process.env.PWD,
        env: process.env
    });
    console.log("created a terminal with PID: " + term.pid);
});
app.post('/terminals/:pid/size', function (req, res) {
    var pid = req.params.pid, _a = req.query, cols = _a.cols, rows = _a.rows, term = [pid];
});
app.listen(port, function () {
    console.log("Server has been started on port " + port);
});
//# sourceMappingURL=server.js.map
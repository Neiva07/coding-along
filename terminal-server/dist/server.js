"use strict";
exports.__esModule = true;
var express = require("express");
var dotenv = require("dotenv");
var pty = require('node-pty');
dotenv.config();
var port = process.env.PORT;
var app = express();
var terminals = new Object();
app.get('/', function (req, res) { return res.send('Hello World'); });
app.post('/terminals', function (req, res) {
    var _a = req.query, cols = _a.cols, rows = _a.rows;
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
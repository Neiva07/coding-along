"use strict";
exports.__esModule = true;
var express = require("express");
var expressWs = require("express-ws");
var dotenv = require("dotenv");
var pty = require('node-pty');
dotenv.config();
var port = process.env.PORT;
var app = expressWs(express()).app;
var terminals = {}, logs = {};
app.get('/', function (req, res) { return res.send('Hello World'); });
app.use(function (req, res, next) {
    res.header('Access-Control-allow-Origin', '*')
        .header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
});
app.post('/terminals', function (req, res) {
    var cols = parseInt(req.query.cols, 10);
    var rows = parseInt(req.query.rows, 10);
    var shell = process.platform === 'win32' ? 'cmd.exe' : 'bash';
    var term = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: cols,
        rows: rows,
        cwd: process.env.PWD,
        env: process.env
    });
    console.log("created a terminal with PID: " + term.pid);
    terminals[term.pid] = term;
    term.on('data', function (data) {
        logs[term.pid] += data;
    });
    res.send(term.pid.toString());
    res.end();
});
app.post('/terminals/:pid/size', function (req, res) {
    var pid = req.params.pid, _a = req.query, cols = _a.cols, rows = _a.rows, term = terminals[pid];
    term.resize(cols, rows);
    console.log('Resized terminal ' + pid + ' to ' + cols + ' cols and ' + rows + ' rows.');
    res.end();
});
app.ws('/tereminals/:pid', function (ws, req) {
    var term = terminals[parseInt(req.params.pid, 10)];
    !term ? ws.send('Terminal was not created') : console.log("Terminal connected on " + term.pid);
    ws.send(logs[term.pid]);
    term.on('data', function (data) {
        try {
            ws.send(data);
        }
        catch (_a) {
        }
    });
    ws.on('message', function (msg) {
        term.write(msg);
    });
    ws.on('close', function () {
        term.kill();
        console.log("Terminal " + term.pid + " closed");
        delete terminals[term.pid];
        delete logs[term.pid];
    });
});
app.listen(port, function () {
    console.log("Server has been started on port " + port);
});
//# sourceMappingURL=server.js.map
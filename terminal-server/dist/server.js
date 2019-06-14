"use strict";
exports.__esModule = true;
var express = require("express");
var expressWs = require("express-ws");
var dotenv = require("dotenv");
var os = require("os");
var pty = require('node-pty');
dotenv.config();
var app = expressWs(express()).app;
var terminals = {}, logs = {};
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
});
app.post('/terminals', function (req, res) {
    var cols = parseInt(req.query.cols, 10);
    var rows = parseInt(req.query.rows, 10);
    var shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
    var term = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: cols,
        rows: rows,
        cwd: process.env.PWD,
        env: process.env
    });
    console.log("created a terminal with PID: " + term.pid);
    terminals[term.pid] = term;
    logs[term.pid] = '';
    term.on('data', function (data) {
        logs[term.pid] += data;
    });
    res.send(term.pid.toString());
    res.end();
});
app.post('/terminals/:pid/size', function (req, res) {
    var pid = parseInt(req.params.pid, 10), cols = parseInt(req.query.cols, 10), rows = parseInt(req.query.rows, 10), term = terminals[pid];
    term.resize(cols, rows);
    console.log('Resized terminal ' + pid + ' to ' + cols + ' cols and ' + rows + ' rows.');
    res.end();
});
app.ws('/tereminals/:pid', function (ws, req) {
    var term = terminals[parseInt(req.params.pid, 10)];
    if (!term) {
        ws.send('Terminal was not created');
        return;
    }
    console.log("Terminal connected on " + term.pid);
    ws.send(logs[term.pid]);
    term.on('data', function (data) {
        try {
            ws.send(data);
        }
        catch (_a) {
            console.log(data);
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
var port = parseInt(process.env.PORT, 10) || 4000, host = os.platform() === 'win32' ? '127.0.0.1' : '0.0.0.0';
app.listen(port, host, function () {
    console.log('App listening to http://' + host + ':' + port);
});
//# sourceMappingURL=server.js.map
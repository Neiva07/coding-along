import {Request, Response, NextFunction} from 'express'
import express = require('express');
import expressWs = require('express-ws');
import dotenv = require('dotenv');
import os = require('os');
import { ITerminal } from 'node-pty/src/interfaces'
import { WithWebsocketMethod } from 'express-ws';
const pty = require('node-pty')
dotenv.config();
const {app} = expressWs(express());

const terminals : {[index: number] : ITerminal} = {},
      logs      : {[index: number] : string}    = {}


app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    
    next();
})

app.post('/terminals', (req, res) => {
    const cols = parseInt(req.query.cols, 10);
    const rows = parseInt(req.query.rows, 10);
    const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash'

    const term : ITerminal = pty.spawn(shell,[], {
        name: 'xterm-color',
        cols,
        rows,
        cwd: process.env.PWD,
        env: process.env
    })
    console.log(`created a terminal with PID: ${term.pid}`)
    terminals[term.pid] = term;
    logs[term.pid] = '';
    term.on('data', data => {
        logs[term.pid] += data;
    })
    res.send(term.pid.toString());
    res.end();
  
})

app.post('/terminals/:pid/size', (req,res) => {
    const pid     = parseInt(req.params.pid, 10),
        cols      = parseInt(req.query.cols, 10),
        rows      = parseInt(req.query.rows, 10),
        term      = terminals[pid];

        term.resize(cols, rows);
        console.log('Resized terminal ' + pid + ' to ' + cols + ' cols and ' + rows + ' rows.');
        res.end();
})

app.ws('/tereminals/:pid', (ws, req) => {
    let term = terminals[parseInt(req.params.pid, 10)];

    if(!term) {
        ws.send('Terminal was not created')
        return;
    }
    
    console.log(`Terminal connected on ${term.pid}`);

    ws.send(logs[term.pid]);
    

    term.on('data', data => {
        try {
            ws.send(data);
        }
        catch{
            console.log(data)
        }
    })

    ws.on('message', (msg:string) => {
        term.write(msg)
    })
    ws.on('close', () => {
        term.kill();
        console.log(`Terminal ${term.pid} closed`);

        delete terminals[term.pid];
        delete logs[term.pid]
    })
})

    const port = parseInt(process.env.PORT,10) || 4000,
          host = os.platform() === 'win32' ? '127.0.0.1' : '0.0.0.0';

app.listen(port, host, () => {
    console.log('App listening to http://' + host + ':' + port);
})
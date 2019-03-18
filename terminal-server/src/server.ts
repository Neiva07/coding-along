import {Request, Response, NextFunction} from 'express'
import express = require('express');
import expressWs = require('express-ws');
import dotenv = require('dotenv');
import { ITerminal } from 'node-pty/src/interfaces'
import { WithWebsocketMethod } from 'express-ws';
const pty = require('node-pty')
dotenv.config();
const port = process.env.PORT;
const host = process.env.HOST;
const {app} = expressWs(express());

const terminals : {[index: number] : ITerminal} = {},
      logs      : any                           = {}

app.get('/', (req: Request,res: Response) => res.send('Hello World'));

app.use((req: Request, res: Response, next: NextFunction) => {
    res .header('Access-Control-allow-Origin', '*')
        .header('Access-Control-Allow-Headers', 'X-Requested-With');
    
    next();
})

app.post('/terminals', (req, res) => {
    const cols = parseInt(req.query.cols, 10);
    const rows = parseInt(req.query.rows, 10);
    const shell = process.platform === 'win32' ? 'cmd.exe' : 'bash'

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
    const pid     = parseInt(req.params.pid),
        cols      = parseInt(req.query.cols),
        rows      = parseInt(req.query.rows),
        term      = terminals[pid];

        term.resize(cols, rows);
        console.log('Resized terminal ' + pid + ' to ' + cols + ' cols and ' + rows + ' rows.');
        res.end();
})

app.ws('/tereminals/:pid', (ws, req) => {
    let term = terminals[parseInt(req.params.pid, 10)];

    if(!term) 
        ws.send('Terminal was not created')
    
    console.log(`Terminal connected on ${term.pid}`);

    ws.send(logs[term.pid]);
    // function buffer(socket: WebSocket, timeout: number) {
    //     let s = '';
    //     let sender : NodeJS.Timeout | null = null;
    //     return (data:string) => {
    //       s += data;
    //       if (!sender) {
    //         sender = setTimeout(() => {
    //           socket.send(s);
    //           s = '';
    //           sender = null;
    //         }, timeout);
    //       }
    //     };
    //   }
    //   //@ts-ignore
    //   const send = buffer(ws, 5);

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

app.listen(4000, host, () => {
    console.log(`Server has been started on port ${port}`)
})
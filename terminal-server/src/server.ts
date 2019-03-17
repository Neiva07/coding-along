import {Request, Response, NextFunction} from 'express'
import express = require('express');
import dotenv = require('dotenv');
const pty = require('node-pty')
dotenv.config();
const port = process.env.PORT;

const app : express.Application = express();

const terminals : object = new Object()

app.get('/', (req: Request,res: Response) => res.send('Hello World'));

app.post('/terminals', (req, res) => {
    const {cols,rows} = req.query;
    const platform = process.platform === 'win32' ? 'cmd.exe' : 'bash'

    const term = pty.spawn(platform,[], {
        name: 'xterm-color',
        cols,
        rows,
        cwd: process.env.PWD,
        env: process.env
    })
    console.log(`created a terminal with PID: ${term.pid}`)
    // terminals[] = term;
    
})

app.post('/terminals/:pid/size', (req,res) => {
    const {pid}     = req.params,
        {cols,rows} = req.query,
        term = [pid];
})

app.listen(port, () => {
    console.log(`Server has been started on port ${port}`)
})
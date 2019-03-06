import {Request, Response, NextFunction} from 'express'
import express = require('express');

const app : express.Application = express();

app.get('/', (req: Request,res: Response) => res.send('Hello World'));

app.listen(3000, () => {
    console.log('server has been started on port 3000!')
})
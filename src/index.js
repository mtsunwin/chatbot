// ===== MODULES ===============================================================
import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import morgan from 'morgan'
import fs from 'fs';
import path from 'path';
import rfs from 'rotating-file-stream';

import * as helpers from './helpers';

// ===== CONSTANTS ===============================================================
import { PORT } from './constants/const.server'

// ===== CONFIG SERVER ===============================================================
dotenv.config();

const app = express().use(bodyParser.json());
const logDirectory = path.join(__dirname, 'logs')
const date = new Date();

fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

var accessLogStream = rfs(helpers.generator(date, 'demo'), {
    size: '10M', // rotate every 10 MegaBytes written
    interval: '1d',  // rotate daily
    compress: 'gzip', // compress rotated filess
    path: logDirectory
})

app.use(morgan('combined', { stream: accessLogStream }))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/logs", express.static('./logs'));

app.set(PORT, process.env.PORT || 3000);
app.listen(app.get(PORT), () => console.log('SERVER RUNNING IN PORT::', app.get(PORT)));

// ===== ROUTES ================================================================
import webhooks from './routes/webhooks';
import index from './routes/index';


app.use('/webhook', webhooks);
app.use('/', index);

app.get('*', function (req, res, next) {
    let err = new Error(`${req.ip} tried to reach ${req.originalUrl}`);
    err.statusCode = 404;
    next(err);
});

app.use(function (err, req, res, next) {
    console.error("thang", err.message);
    if (!err.statusCode) err.statusCode = 500; // Sets a generic server error status code if none is part of the err
    if (err.shouldRedirect) {
        res.render('myErrorPage') // Renders a myErrorPage.html for the user
    } else {
        res.status(err.statusCode).send(err.message); // If shouldRedirect is not defined in our error, sends our original err data
    }
});



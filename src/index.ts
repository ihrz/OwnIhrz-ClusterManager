import { execSync } from 'child_process';

execSync("git pull", {
    stdio: [0, 1, 2],
    cwd: process.cwd()
});
execSync("rm dist -r", {
    stdio: [0, 1, 2],
    cwd: process.cwd()
});
execSync("npx tsc", {
    stdio: [0, 1, 2],
    cwd: process.cwd()
});

import { refresher } from './manager/expireManager.js';
import config from './method/getConfigData.js';
import loadRoutes from './routesManager.js';

import express from 'express';

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.text());

refresher;
loadRoutes(app);

app.listen(config?.cluster.port, () => {
    console.log(`🚀 >> API listening on :${config?.cluster.port}`)
});

process
    .on('unhandledRejection', (reason, p) => {
        console.error(reason, 'Unhandled Rejection at Promise', p);
    })
    .on('uncaughtException', err => {
        console.error(err, 'Uncaught Exception thrown');
    });
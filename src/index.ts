import { execSync } from 'child_process';

execSync("git pull", {
    stdio: [0, 1, 2],
    cwd: process.cwd()
});
execSync("rm -r dist", {
    stdio: [0, 1, 2],
    cwd: process.cwd()
});
execSync("npx tsc", {
    stdio: [0, 1, 2],
    cwd: process.cwd()
});

import { Refresh } from './manager/expireManager.js';
import config from './method/getConfigData.js';
import loadRoutes from './routesManager.js';

import { iHorizonTimeCalculator, logger, wait } from 'ihorizon-tools';
import { initializeDatabase } from './method/database.js';
import { create_ownihrz_backup } from './manager/backupManager.js';
import express from 'express';
import cookieParser from "cookie-parser";

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.text());
app.use(cookieParser());

await create_ownihrz_backup(true)
await wait(3000);
console.clear();

setInterval(() => {
    create_ownihrz_backup(false);
}, new iHorizonTimeCalculator().to_ms("1d"));

setInterval(() => {
    Refresh();
}, 3600000);

loadRoutes(app);

app.listen(config?.cluster.port, async () => {
    await initializeDatabase();
    logger.log(`🚀 >> API listening on :${config?.cluster.port}`)
});

process
    .on('unhandledRejection', (reason, p) => {
        console.error(reason, 'Unhandled Rejection at Promise', p);
    })
    .on('uncaughtException', err => {
        console.error(err, 'Uncaught Exception thrown');
    });
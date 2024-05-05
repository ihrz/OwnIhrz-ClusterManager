import { refresher } from './manager/expireManager.js';
import config from './method/getConfigData.js';
import loadRoutes from './routesManager.js';

import express from 'express';
import bp from 'body-parser';

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(bp.text());

refresher;
loadRoutes(app);

app.listen(config?.cluster.port, () => {
    console.log(`🚀 >> API listening on :${config?.cluster.port}`)
});
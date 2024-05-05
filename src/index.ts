import getConfigData from './getConfigData.js';
import loadRoutes from './routesManager.js';

import express from 'express';
import bp from 'body-parser';

const config = getConfigData();
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(bp.text());

loadRoutes(app);

app.listen(config?.cluster.port);
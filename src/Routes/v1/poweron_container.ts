import { validateAdminKey } from '../../method/validateData.js';
import isContainerOn from '../../method/getContainerStatus.js';
import config from '../../method/getConfigData.js';

import { Request, Response } from 'express';
import fs from "node:fs";
import { execSync } from "child_process";
import path from "node:path";
import { db } from '../../method/database.js';
import { getOwnerByCode } from '../../method/getOwnerByCode.js';
import logsRequest from '../../method/logRequest.js';

export const route = {
    type: 'get',
    apiPath: '/api/v1/instance/poweron/:bot_id/:admin_key/',
    run: async (req: Request, res: Response) => {
        logsRequest(route, req);

        let ownihrz_table = db.table("OWNIHRZ");

        const botId = req.params["bot_id"];
        const adminKey = req.params["admin_key"];

        if (!config?.api.apiToken) {
            console.log("Error: Failed to load config");
            return res.status(500).send("Failed to load config");
        }

        if (!validateAdminKey(adminKey)) {
            console.log("[Delete] Erreur admin_key n'est pas valide!");
            return res.status(403).send("Invalid admin_key!");
        };

        if (!fs.existsSync(path.join(process.cwd(), 'ownihrz', botId))) {
            console.log("[Delete] Erreur bot_id n'existe pas!");
            return res.status(403).send("Invalid bot_id!");
        };

        if (!await isContainerOn(botId)) {
            [
                {
                    line: `npx tsc`,
                    cwd: path.join(process.cwd(), 'ownihrz', botId)
                },
                {
                    line: `mv dist/index.js dist/${botId}.js`,
                    cwd: path.join(process.cwd(), 'ownihrz', botId)
                },
                {
                    line: `pm2 start ./dist/${botId}.js -f`,
                    cwd: path.join(process.cwd(), 'ownihrz', botId)
                },
            ].forEach((index) => {
                try {
                    execSync(index.line, { stdio: [0, 1, 2], cwd: index.cwd });
                } catch (e: any) {
                    console.log(e.toString().split('\n')[0]);
                }
            });
        } else {
            console.log('[Startup] Erreur tentative doublon!');
        }

        let ownerid1 = getOwnerByCode(await ownihrz_table.get("CLUSTER"), botId);
        await ownihrz_table.set(`CLUSTER.${ownerid1}.${botId}.PowerOff`, false);

        return res.sendStatus(200);
    },
};
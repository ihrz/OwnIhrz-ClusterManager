import { validateAdminKey } from '../../method/validateData.js';
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
    apiPath: '/api/v1/instance/delete/:bot_id/:admin_key',
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

        let ownerid1 = getOwnerByCode(await ownihrz_table.get("CLUSTER"), botId);
        let bot = await ownihrz_table.get(`CLUSTER.${ownerid1}.${botId}`);

        if (!fs.existsSync(path.join(process.cwd(), 'ownihrz', botId)) && !bot) {
            console.log("[Delete] Erreur bot_id n'existe pas!");
            return res.status(403).send("Invalid bot_id!");
        };

        [
            {
                line: `pm2 stop ${botId} -f`,
                cwd: process.cwd()
            },
            {
                line: `pm2 delete ${botId}`,
                cwd: process.cwd()
            },
            {
                line: `rm -r --interactive=never ${botId}`,
                cwd: path.join(process.cwd(), 'ownihrz')
            },
        ].forEach((index) => {
            try {
                execSync(index.line, { stdio: [0, 1, 2], cwd: index.cwd });
            } catch (e: any) {
                console.log(e.toString().split('\n')[0]);
            }
        });

        await ownihrz_table.delete(`CLUSTER.${ownerid1}.${botId}`);

        return res.sendStatus(200);
    },
};
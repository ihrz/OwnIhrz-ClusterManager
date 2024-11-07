import { validateAdminKey } from '../../method/validateData.js';
import config from '../../method/getConfigData.js';

import { Request, Response } from 'express';
import { execSync } from "child_process";
import path from "node:path";
import fs from "node:fs";
import { OwnIHRZ_New_Owner_RequestBody } from '../../../types/OwnihrzData.js';
import { db } from '../../method/database.js';

export default {
    type: 'post',
    apiPath: '/api/v1/instance/change_owner',
    run: async (req: Request, res: Response) => {

        let ownihrz_table = db.table("OWNIHRZ");
        const { botId, adminKey, OwnerData } = req.body as OwnIHRZ_New_Owner_RequestBody;

        if (!botId || !adminKey || !OwnerData) {
            console.log("Error: Failed to load args");
            return res.status(500).send("Failed to load config");
        }

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

        [
            {
                line: `pm2 stop ${botId} -f`,
                cwd: process.cwd(),
            },
            {
                line: `pm2 delete ${botId} -f`,
                cwd: process.cwd(),
            },
            {
                line: `sed -i 's/ownerid1: "[^"]*"/ownerid1: "${OwnerData.NewOwnerOne}"/' config.ts`,
                cwd: path.resolve(process.cwd(), 'ownihrz', botId, 'src', 'files')
            },
            {
                line: `sed -i 's/ownerid2: "[^"]*"/ownerid2: "${OwnerData.NewOwnerTwo}"/' config.ts`,
                cwd: path.resolve(process.cwd(), 'ownihrz', botId, 'src', 'files')
            },
            {
                line: `npx tsc`,
                cwd: path.resolve(process.cwd(), 'ownihrz', botId)
            },
            {
                line: `pm2 start ./dist/${botId}.js -f`,
                cwd: path.resolve(process.cwd(), 'ownihrz', botId)
            },

        ].forEach((index) => {
            try {
                execSync(index.line, { stdio: [0, 1, 2], cwd: index.cwd });
            } catch (e: any) {
                console.log(e.toString().split('\n')[0]);
            }
        });

        let botData = await ownihrz_table.get(`CLUSTER.${OwnerData.OldOwnerOne}.${botId}`);
        await ownihrz_table.delete(`CLUSTER.${OwnerData.OldOwnerOne}.${botId}`);

        botData.OwnerOne = OwnerData.NewOwnerOne;
        botData.OwnerTwo = OwnerData.NewOwnerTwo;

        await ownihrz_table.set(`CLUSTER.${OwnerData.NewOwnerOne}.${botId}`, botData);

        return res.sendStatus(200);
    },
};
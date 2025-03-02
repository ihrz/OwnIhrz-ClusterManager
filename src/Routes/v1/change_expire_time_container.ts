import { validateAdminKey } from '../../method/validateData.js';
import config from '../../method/getConfigData.js';

import { Request, Response } from 'express';
import path from "node:path";
import fs from "node:fs";
import { OwnIHRZ_New_Time_RequestBody } from '../../../types/OwnihrzData.js';
import { db } from '../../method/database.js';
import { getOwnerByCode } from '../../method/getOwnerByCode.js';
import logsRequest from '../../method/logRequest.js';

export const route = {
    type: 'post',
    apiPath: '/api/v1/instance/change_time',
    run: async (req: Request, res: Response) => {
        logsRequest(route, req);

        let ownihrz_table = db.table("OWNIHRZ");
        const { botId, adminKey, data } = req.body as OwnIHRZ_New_Time_RequestBody;

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

        let ownerid1 = getOwnerByCode(await ownihrz_table.get("CLUSTER"), botId);

        if (data.method === "add") {
            await ownihrz_table.add(`CLUSTER.${ownerid1}.${botId}.ExpireIn`, data.ms);
        } else {
            await ownihrz_table.sub(`CLUSTER.${ownerid1}.${botId}.ExpireIn`, data.ms);
        }

        return res.sendStatus(200);
    },
};
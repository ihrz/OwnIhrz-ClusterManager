import config from "../method/getConfigData.js";
import db from "../method/database.js";

import { execSync } from "child_process";

const clusterKey = `cluster${config?.cluster.id}`;

async function Refresh() {
    let table = db.table(clusterKey);
    let result = await table.all();

    let now = new Date().getTime();

    for (let i = 0; i < result.length; i++) {
        let data = result[i].value;
        let userId = result[i].id;

        for (let code in data) {
            let bot = data[code];

            if (!bot.Code || bot.PowerOff) continue;
            if (now >= bot.ExpireIn) {
                await db.set(`OWNIHRZ.${userId}.${code}.PowerOff`, true);

                execSync(`pm2 stop ${code} -f`, { stdio: [0, 1, 2], cwd: process.cwd() });
                execSync(`pm2 delete ${code}`, { stdio: [0, 1, 2], cwd: process.cwd() });
            }
        }
    }

    return;
};

export const refresher = setInterval(() => {
    console.log("[Refresher] Refresh all OWNIHRZ inside this cluster...");
    Refresh();
}, 16000);
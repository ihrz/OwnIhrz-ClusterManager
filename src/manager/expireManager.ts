import config from "../method/getConfigData.js";
import db from "../method/database.js";

import { execSync } from "child_process";

async function Refresh() {
    let table = db.table("OWNIHRZ")
    let result = await table.get("CLUSTER");

    let now = new Date().getTime();

    for (let userId in result) {
        for (let botId in result[userId]) {

            if (!result[userId][botId].Code || result[userId][botId].PowerOff) continue;
            if (result[userId][botId].Cluster !== config?.cluster.id) continue;

            if (now >= result[userId][botId].ExpireIn) {
                await table.set(`CLUSTER.${userId}.${botId}.PowerOff`, true);

                [
                    {
                        line: `pm2 stop ${result[userId][botId].Code} -f --silent`,
                        cwd: process.cwd()
                    },
                    {
                        line: `pm2 delete ${result[userId][botId].Code} --silent`,
                        cwd: process.cwd()
                    },
                ].forEach((index) => { execSync(index.line, { stdio: [0, 1, 2], cwd: index.cwd }); });
            }
        }
    }

    return 0;
};

export const refresher = setInterval(() => {
    console.log("[Refresher] Refresh all OWNIHRZ inside this cluster...");
    Refresh();
}, 16000);
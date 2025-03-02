import { Request } from "express";
import Config from "./getConfigData.js";
import { axios } from "ihorizon-tools";

async function logsRequest({ apiPath, type, run }: { apiPath: string, type: string, run: any }, req: Request) {

    const route = apiPath;
    const method = type;

    const embed = {
        title: `Request to ${route}`,
        description: `Method: ${method.toUpperCase()}`,
        fields: [
            {
                name: "Query Parameters",
                value: (Object.keys(req.query ?? {}).length ? JSON.stringify(req.query) : "None").substring(0, 1000),
                inline: true
            },
            {
                name: "Params",
                value: (Object.keys(req.params ?? {}).length ? JSON.stringify(req.params) : "None").substring(0, 1000),
                inline: true
            },
            {
                name: "Body",
                value: (Object.keys(req.body ?? {}).length ? JSON.stringify(req.body) : "No Body").substring(0, 1000),
                inline: true
            },
            {
                name: "Cookies",
                value: (Object.keys(req.cookies ?? {}).length ? JSON.stringify(req.cookies) : "No Cookies").substring(0, 1000),
                inline: true
            },
            {
                name: "IP Address",
                value: (req.ip?.toString() || "No IP Address").substring(0, 1000),
                inline: true
            }
        ],
        color: 16711680,
        timestamp: new Date().toISOString(),
    };

    const payload = { embeds: [embed], content: `[ClusterManager] >> Request \<@&1345846465460834304>` };
    const response = await axios.post(Config.api.webhook, payload);
}
export default logsRequest;

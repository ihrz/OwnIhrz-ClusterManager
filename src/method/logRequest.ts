import { Request } from "express";
import Config from "./getConfigData";

async function logsRequest(_: { apiPath: string, type: string, run: any }, req: Request) {
    // Get the route
    const route = _.apiPath;
    // Get the method
    const method = _.type;

    // Make a embed to send to discord webhook
    const embed = {
        "title": `Request to ${route}`,
        "description": `Method: ${method.toUpperCase()}`,
        "fields": [
            {
                "name": "Query Parameters",
                "value": JSON.stringify(req.query),
                "inline": true
            },
            {
                "name": "Body",
                "value": JSON.stringify(req.body),
                "inline": true
            },
            {
                "name": "IP Address",
                "value": req.ip?.toString(),
                "inline": true
            }
        ],
        "color": 16711680,
        "timestamp": new Date().toISOString()
    };
    // Send the embed to the discord webhook

    // Send the embed to the webhook
    await fetch(Config.api.webhook, {
        "method": "POST",
        "headers": {
            "content-type": "application/json"
        },
        "body": JSON.stringify({ embeds: [embed], content: "[ClusterManager] >> Request \n@everyone" })
    });
}

export default logsRequest;
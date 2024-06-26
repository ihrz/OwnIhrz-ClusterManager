import { Custom_iHorizon } from "../../types/OwnihrzData.js";
import config from "./getConfigData.js";

function validateData(data: Custom_iHorizon): boolean {

    return data.AdminKey == config?.api.apiToken &&
        data.OwnerOne !== "" &&
        data.OwnerTwo !== "" &&
        data.ExpireIn !== 0 &&
        data.Bot.Id !== "" &&
        data.Code !== "" &&
        data.Lavalink.NodeHost !== "" &&
        data.Lavalink.NodePort !== 0 &&
        data.Lavalink.NodeAuth !== "";
}

function validateAdminKey(key: string): boolean {

    return key == config?.api.apiToken;
}

export { validateData, validateAdminKey };
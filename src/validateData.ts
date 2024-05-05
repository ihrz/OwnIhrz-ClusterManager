import { Custom_iHorizon } from "../types/OwnihrzData";
import getConfigData from "./getConfigData.js";

const config = getConfigData();

function validateData(data: Custom_iHorizon): boolean {

    return data.AdminKey == config?.api.apiToken &&
        data.OwnerOne != "" &&
        data.OwnerTwo != "" &&
        data.ExpireIn != "" &&
        data.Bot.Id != "" &&
        data.Code != "" &&
        data.Lavalink.NodeHost != "" &&
        data.Lavalink.NodeAuth != "";
}

function validateAdminKey(key: string): boolean {

    return key == config?.api.apiToken;
}

export { validateData, validateAdminKey };
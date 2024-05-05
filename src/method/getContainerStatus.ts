import pm2 from 'pm2';

function isContainerOn(botId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        pm2.describe(botId, function (error, description) {
            if (error) {
                reject(error)
            } else {
                resolve(description.length > 0 ? true : false);
            }
        })
    })
}

export default isContainerOn;
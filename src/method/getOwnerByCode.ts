export function getOwnerByCode(all_data: any, code: string): string | null {
    for (const ownerId in all_data) {
        if (all_data.hasOwnProperty(ownerId)) {
            const subData = all_data[ownerId];
            for (const subKey in subData) {
                if (subData.hasOwnProperty(subKey)) {
                    const item = subData[subKey];

                    if (item.Code === code) {
                        return item.OwnerOne || null;
                    }
                }
            }
        }
    }
    return null;
}

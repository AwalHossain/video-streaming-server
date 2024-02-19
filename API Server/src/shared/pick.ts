

const pick = <T extends Record<string, unknown>, k extends keyof T>
    (obj: T, keys: k[]) => {
    const finalObject: Partial<T> = {};

    for (const key of keys) {
        if (obj && obj.hasOwnProperty.call(obj, key)) {
            finalObject[key] = obj[key];
        }
    }

    return finalObject;
}


export default pick;
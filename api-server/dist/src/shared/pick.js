"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pick = (obj, keys) => {
    const finalObject = {};
    for (const key of keys) {
        if (obj && obj.hasOwnProperty.call(obj, key)) {
            finalObject[key] = obj[key];
        }
    }
    return finalObject;
};
exports.default = pick;

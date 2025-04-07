"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
// validate required fields of videos schema from ./schema.js
const schema = joi_1.default.object().keys({
    _id: joi_1.default.string().optional(),
    title: joi_1.default.string().min(3).max(30).required(),
    fileName: joi_1.default.string().min(3).max(30).required(),
    recordingDate: joi_1.default.date().required(),
    videoLink: joi_1.default.string().min(3).max(30).required(),
});
const validate = (data) => {
    const validationResult = schema.validate(data);
    console.log(`validationResult:`, validationResult);
    return validationResult;
};
exports.default = validate;

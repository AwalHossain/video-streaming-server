"use strict";
// const { ObjectId } = require("mongodb");
// const { Video, name } = require("./model");
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoService = void 0;
const mongodb_1 = require("mongodb");
const mongoose_1 = __importDefault(require("mongoose"));
const event_1 = require("../../../constants/event");
const apiError_1 = __importDefault(require("../../../error/apiError"));
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const logger_1 = require("../../../shared/logger");
const rabbitMQ_1 = __importDefault(require("../../../shared/rabbitMQ"));
const video_constant_1 = require("./video.constant");
const video_model_1 = require("./video.model");
const insertIntoDBFromEvent = async (data) => {
    logger_1.logger.info("insertIntoDBFromEvent", data);
    console.log("insertIntoDBFromEvent", data);
    try {
        const result = await video_model_1.Video.create(data);
        console.log("result", result);
        if (result) {
            const { _id, title, author, tags } = result;
            let updateData = {
                id: _id.toString(),
                history: { status: "inserted", createdAt: Date.now() },
            };
            let UpdatedResult = await updateHistory(updateData.id, updateData.history);
            rabbitMQ_1.default.sendToQueue(event_1.API_SERVER_EVENTS.GET_VIDEO_METADATA_EVENT, result);
            console.log("Sending video metadata to Video Conversion Server", result, "sent to Video Conversion Server", UpdatedResult);
        }
        return result;
    }
    catch (error) {
        if (error instanceof mongoose_1.default.Error.ValidationError) {
            console.error(error.message);
            // Handle the error appropriately here, e.g., by returning a meaningful value or throwing a custom error.
        }
        else {
            // Handle other types of errors here.
            throw error;
        }
    }
};
// // TODO: use regex or like search
const getAllVideos = async (filters, paginationOptions) => {
    const { searchTerm, tags, ...filtersData } = filters;
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper_1.PaginationHelper.calculatePagination(paginationOptions);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            $or: video_constant_1.videoSearchableFields.map((field) => ({
                [field]: {
                    $regex: searchTerm,
                    $options: "i",
                },
            })),
        });
    }
    if (Object.keys(filtersData).length) {
        andConditions.push({
            $and: Object.entries(filtersData).map(([key, value]) => ({
                [key]: value,
            })),
        });
    }
    if (tags && tags.length > 0) {
        const tagsAll = Array.isArray(tags) ? tags : [tags];
        console.log("filtersData.tags", tagsAll);
        andConditions.push({
            tags: { $in: tagsAll },
        });
    }
    // add condition for status
    andConditions.push({
        status: "published",
    });
    const sortCondition = {};
    if (sortBy && sortOrder) {
        sortCondition[sortBy] = sortOrder;
    }
    const whereCondition = {
        ...(andConditions.length > 0 ? { $and: andConditions } : {}),
    };
    console.log("whereCondition", whereCondition);
    const result = await video_model_1.Video.find(whereCondition)
        .sort(sortCondition)
        .skip(skip)
        .limit(limit)
        .populate("author", "name  email avatar");
    const totalRecords = await video_model_1.Video.countDocuments();
    return {
        meta: {
            page,
            limit,
            totalRecords,
        },
        data: result,
    };
};
const getMyVideos = async (userId, filters, paginationOptions) => {
    const { searchTerm, tags, ...filtersData } = filters;
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper_1.PaginationHelper.calculatePagination(paginationOptions);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            $or: video_constant_1.videoSearchableFields.map((field) => ({
                [field]: {
                    $regex: searchTerm,
                    $options: "i",
                },
            })),
        });
    }
    if (Object.keys(filtersData).length) {
        andConditions.push({
            $and: Object.entries(filtersData).map(([key, value]) => ({
                [key]: value,
            })),
        });
    }
    const sortCondition = {};
    if (sortBy && sortOrder) {
        sortCondition[sortBy] = sortOrder;
    }
    const whereCondition = {
        author: userId,
        ...(andConditions.length > 0 ? { $and: andConditions } : {}),
    };
    console.log("whereCondition", whereCondition);
    const result = await video_model_1.Video.find(whereCondition)
        .sort(sortCondition)
        .skip(skip)
        .limit(limit)
        .populate("author", "name  email avatar");
    const totalRecords = await video_model_1.Video.countDocuments({
        author: userId,
    });
    return {
        meta: {
            page,
            limit,
            totalRecords,
        },
        data: result,
    };
};
const incrementViewCount = async (id) => {
    const updatedDoc = await video_model_1.Video.updateOne({
        _id: id,
    }, {
        $inc: {
            viewsCount: 1,
        },
    });
    return updatedDoc;
};
const update = async (id, document) => {
    console.log("updating document", document);
    const updatedDoc = await video_model_1.Video.findOneAndUpdate({
        _id: new mongodb_1.ObjectId(id),
    }, {
        $set: {
            ...document,
            updatedAt: new Date(),
        },
    }, {
        upsert: true,
        new: true,
    });
    console.log("successfully updated document", updatedDoc);
    if (updatedDoc.status === "published") {
        const time = await calculateConversionTime(updatedDoc.history);
        updatedDoc.videoConversionTime = time;
        // TODO fix this
        // Add missing required fields if they're not present
        if (!updatedDoc.originalName)
            updatedDoc.originalName = "Unknown";
        if (!updatedDoc.recordingDate)
            updatedDoc.recordingDate = new Date();
        if (!updatedDoc.author)
            updatedDoc.author = new mongodb_1.ObjectId("67dbba095bc476b71171a2ea");
        const result = await updatedDoc.save();
        console.log("result after saving", result);
    }
    return updatedDoc;
};
const updateHistory = async (id, history) => {
    console.log("updating history", history, id, "and");
    try {
        const updatedDoc = await video_model_1.Video.findOneAndUpdate({
            _id: id,
        }, {
            $push: {
                history: history,
            },
        }, {
            new: true,
            maxTimeMS: 2000,
        });
        console.log("updatedDoc", updatedDoc);
        return updatedDoc;
    }
    catch (error) {
        console.error(error);
        throw new apiError_1.default(500, error.message);
    }
};
const getById = async (id) => {
    try {
        const result = await video_model_1.Video.findById(id);
        return result;
    }
    catch (error) {
        console.error(error);
        return error;
    }
};
const calculateConversionTime = async (history) => {
    var _a, _b;
    console.log("calculating conversion time", history);
    const insertedTime = (_a = history.find((item) => item.status === "inserted")) === null || _a === void 0 ? void 0 : _a.createdAt;
    const convertedTime = (_b = history.find((item) => item.status === "video.hls.converted")) === null || _b === void 0 ? void 0 : _b.createdAt;
    console.log("insertedTime", insertedTime, "convertedTime", convertedTime);
    if (!insertedTime || !convertedTime) {
        return "N/A";
    }
    const diff = convertedTime - insertedTime;
    // convert to seconds
    const seconds = (diff / 1000).toFixed(2) + "s";
    console.log("conversion time", seconds);
    return seconds;
};
exports.VideoService = {
    insertIntoDBFromEvent,
    update,
    updateHistory,
    getById,
    getAllVideos,
    getMyVideos,
    incrementViewCount,
};

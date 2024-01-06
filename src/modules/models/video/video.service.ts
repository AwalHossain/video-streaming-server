// const { ObjectId } = require("mongodb");
// const { Video, name } = require("./model");

import { ObjectId } from "mongodb";
import mongoose, { SortOrder } from "mongoose";
import ApiError from "../../../error/apiError";
import { PaginationHelper } from "../../../helpers/paginationHelper";
import { IpaginationOptions } from "../../../interface/pagination";
import { videoSearchableFields } from "./video.constant";
import { IPayload, IVdieosFilterableFields } from "./video.interface";
import { Video } from "./video.model";
// // TODO: add logging

const insert = async (document: IPayload) => {
    try {
        const result = await Video.create(document);
        return result;
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            console.error(error.message);
            // Handle the error appropriately here, e.g., by returning a meaningful value or throwing a custom error.
        } else {
            // Handle other types of errors here.
            throw error;
        }
    }
};

// // TODO: use regex or like search

const getAllVideos = async (filters: IVdieosFilterableFields
    , paginationOptions: IpaginationOptions
) => {
    const { searchTerm, tags, ...filtersData } = filters;

    const { limit, page, skip, sortBy, sortOrder } = PaginationHelper.calculatePagination(paginationOptions);

    const andConditions = [];

    if (searchTerm) {
        andConditions.push({
            $or: videoSearchableFields.map((field) => ({
                [field]: {
                    $regex: searchTerm,
                    $options: "i"
                }
            }))
        })
    }

    if (tags && tags.length > 0) {

        const tagsAll = Array.isArray(tags) ? tags : [tags];
        console.log("filtersData.tags", tagsAll);

        andConditions.push({
            tags: { $in: tagsAll }
        });
    }

    if (Object.keys(filtersData).length) {
        andConditions.push({
            $and: Object.entries(filtersData).map(([key, value]) => ({
                [key]: value
            }))
        })
    }


    // add condition for status
    andConditions.push({
        status: "published"
    });

    const sortCondition: { [key: string]: SortOrder } = {};

    if (sortBy && sortOrder) {
        sortCondition[sortBy] = sortOrder;
    }

    const whereCondition = andConditions.length > 0 ? {
        $and: andConditions
    } : {};


    const result = await Video.find(whereCondition)
        .sort(sortCondition)
        .skip(skip)
        .limit(limit)
        .populate("author", "name  email avatar")

    const totalRecords = await Video.countDocuments(
        {
            status: "published"
        }
    );

    return {
        meta: {
            page,
            limit,
            totalRecords
        },
        data: result
    }
};


const getMyVideos = async (userId: string, filters: IVdieosFilterableFields
    , paginationOptions: IpaginationOptions
) => {
    const { searchTerm, tags, ...filtersData } = filters;

    const { limit, page, skip, sortBy, sortOrder } = PaginationHelper.calculatePagination(paginationOptions);

    const andConditions = [];

    if (searchTerm) {
        andConditions.push({
            $or: videoSearchableFields.map((field) => ({
                [field]: {
                    $regex: searchTerm,
                    $options: "i"
                }
            }))
        })
    }

    if (Object.keys(filtersData).length) {
        andConditions.push({
            $and: Object.entries(filtersData).map(([key, value]) => ({
                [key]: value
            }))
        })
    }


    const sortCondition: { [key: string]: SortOrder } = {};

    if (sortBy && sortOrder) {
        sortCondition[sortBy] = sortOrder;
    }

    const whereCondition = {
        author: userId,
        ...(andConditions.length > 0 ? { $and: andConditions } : {}),
    };

    console.log("whereCondition", whereCondition);


    const result = await Video.find(whereCondition)
        .sort(sortCondition)
        .skip(skip)
        .limit(limit)
        .populate("author", "name  email avatar")

    const totalRecords = await Video.countDocuments();

    return {
        meta: {
            page,
            limit,
            totalRecords
        },
        data: result
    }
};




const update = async (id: ObjectId, document: Partial<IPayload>) => {

    console.log("updating document", document);


    const updatedDoc = await Video.updateOne(
        {
            _id: new ObjectId(id),
        }
        , {
            $set: {
                ...document,
                updatedAt: new Date(),
            }
        },
        {
            new: true,
        }
    )
    console.log("updating document", updatedDoc);
    return updatedDoc;
};

const updateHistory = async (id: ObjectId, { history, ...rest }) => {
    try {
        const updatedDoc = await Video.findOneAndUpdate(
            {
                _id: id,
            },
            {
                $push: {
                    history
                },
                $set: rest
            },
            {
                new: true,
                maxTimeMS: 2000,
            }

        )
        console.log("updatedDoc", updatedDoc);

        return updatedDoc;
    } catch (error) {
        console.error(error);
        throw new ApiError(500, error.message);
    }
}


const getById = async (id: string) => {
    try {
        const result = await Video.findById(id);
        return result;
    } catch (error) {
        console.error(error);
        return error;
    }
};


export const VideoService = {
    insert,
    update,
    updateHistory,
    getById,
    getAllVideos,
    getMyVideos
}
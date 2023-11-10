// const { ObjectId } = require("mongodb");
// const { Video, name } = require("./model");

import { ObjectId } from "mongodb";
import ApiError from "../../../error/apiError";
import { IPayload } from "./video.interface";
import { Video } from "./video.model";

// // TODO: add logging

const insert = async (document: IPayload) => {
    console.log("inserting document",);

    try {
        const result = await Video.create(document);
        return result;
    } catch (error) {
        console.log("error", error);

        throw new ApiError(500, error.message);

    }
};

// // TODO: use regex or like search
// const search = async (searchObject) => {
//   const result = await Video.find(searchObject).toArray();
//   return result;
// };

// const getById = async (id) => {
//   try {
//     const Video = await Video.findOne({
//       _id: new ObjectId(id),
//     });
//     return Video;
//   } catch (error) {
//     console.error(error);
//     return error;
//   }
// };

const update = async (id: ObjectId, document: Partial<IPayload>) => {
    try {
        const updatedDoc = await Video.updateOne(
            {
                _id: new ObjectId(id),
            }
            , {
                $set: {
                    ...document,
                    updatedAt: new Date(),
                }
            }
        )
        return updatedDoc;
    } catch (error) {
        console.error(error);
        return error;
    }
};

const updateHistory = async (id: ObjectId, { history, ...rest }) => {
    console.log("updating history", history);

    try {
        const updatedDoc = await Video.updateOne(
            {
                _id: new ObjectId(id),
            },
            {
                $push: {
                    history
                },
                $set: {
                    ...rest,
                }
            },
            {
                new: true,
                maxTimeMS: 2000,
            }

        )
        return updatedDoc;
    } catch (error) {
        console.error(error);
        throw new ApiError(500, error.message);
    }
}


export const VideoService = {
    insert,
    update,
    updateHistory,
    // getById,
}
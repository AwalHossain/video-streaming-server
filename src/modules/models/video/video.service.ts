// const { ObjectId } = require("mongodb");
// const { Video, name } = require("./model");

import { ObjectId } from "mongodb";
import { IPayload } from "./video.interface";
import { Video } from "./video.model";

// // TODO: add logging

const insert = async (document:IPayload ) => {
    console.log("inserting document",);
    
  try {
    const result = await Video.create(document);
    return result;
  } catch (error) {
 
    return error;
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

const update = async (id:ObjectId, document:Partial<IPayload>) => {
  try {
    const updatedDoc = await Video.updateOne(
        {
            _id: new ObjectId(id),
        }
        ,{
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

const updateHistory = async (id:ObjectId, {history, ...rest}) => {
    console.log("updating history",history);
    
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
                // Increase the timeout to a higher value (e.g., 30000 for 30 seconds)
                maxTimeMS: 30000
            }
        )
        return updatedDoc;
    } catch (error) {
        console.error(error);
        return error;
    }
}

// const deleteById = async (id) => {
//   try {
//     const deleted = await Video.deleteOne({
//       _id: new ObjectId(id),
//     });
//     return deleted;
//   } catch (error) {
//     console.error(error);
//     return error;
//   }
// };

// module.exports = {
//   insert,
//   search,
//   getById,
//   update,
//   deleteById,
// };



export const VideoService = {
    insert,
    update,
    updateHistory,
    // getById,
}
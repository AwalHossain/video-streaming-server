// const { ObjectId } = require("mongodb");
// const { Video, name } = require("./model");

import { Video } from "./video.model";

// // TODO: add logging

const insert = async (document:any ) => {
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

// const update = async (id, document) => {
//   try {
//     const updatedDoc = await Video.updateOne(
//       { _id: new ObjectId(id) },
//       { $set: { ...document } }
//     );
//     return updatedDoc;
//   } catch (error) {
//     console.error(error);
//     return error;
//   }
// };

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
    // search,
    // getById,
}
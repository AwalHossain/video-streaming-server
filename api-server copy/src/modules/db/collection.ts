//     import { ObjectId } from "mongodb";
// import { MongoManager } from "./mongo";

//     import { baseDefaults } from "./schemas/common";

//     const insertItem = async (collectionName: string, item: any) => {
//         try{

//             return await MongoManager.Instance.collection(collectionName).insertOne({
//                 ...baseDefaults(),
//                 ...item,
//             });

//         }catch (error){
//             console.error(error.errorInfo?.details);
//             if(error.code.toString() === 11000){
//                 return new Error(JSON.stringify({
//                     status: "error",
//                     message: "Duplicate key error",
//                     error: error.errorInfo?.details,
//                 }))
//             }

//             if(error.code.toString() === 121){
//                 return new Error(JSON.stringify({
//                     status: "error",
//                     message: "Document failed validation",
//                     error: error.errorInfo?.details,
//                 }))
//             }

//             if(error.code.toString() === 16460){
//                 return new Error(JSON.stringify({
//                     status: "error",
//                     message: "Invalid document",
//                     error: error.errorInfo?.details,
//                 }))
//             }

//             if(error.code.toString() === 16461){
//                 return new Error(JSON.stringify({
//                     status: "error",
//                     message: "Invalid document",
//                     error: error.errorInfo?.details,
//                 }))
//             }

//             return error;
//         }
//     }


//     const updateItem = async (collectionName: string, item: any) => {

//         const {_id, ...rest} = item;
//         try{
//             return await MongoManager.Instance.collection(collectionName).updateOne(
//                 { _id: new ObjectId(_id) },
//                 {
//                     $set:{
//                         ...rest,
//                         updateAt: new Date(),
//                     }
//                 },
//             )

//         }catch (error){
//             console.error(error);
//             return null;
//         }


//     }


//     const common = (collectionName: string) => ({
//         insert: async (item: any) => {
//             return await insertItem(collectionName, item);
//         },
//         update: async (item: any) => {
//             return await updateItem(collectionName, item);
//         }  
//     })



//     const createCollectionObject = async (collectionName: string) =>

//     Object.assign(  MongoManager.Instance.collection(collectionName),
//         common(collectionName)
//     );

//     export const CollectionsName = {
//         Video: createCollectionObject("videos"),
//         Role: createCollectionObject("roles"),
//     }
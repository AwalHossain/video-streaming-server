import { getDb } from "../../db/mongo";

const collectionName = "videos2";

const getCollection = () => {
  console.log(`getCollection: ${collectionName}`);
  const db = getDb();
  const collection = db.collection(collectionName);
  return collection;
};

export const Video = getCollection();
export const name = collectionName;

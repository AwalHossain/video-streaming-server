import { getDb } from "../../db/mongo";

export const collectionName = "videos";

export const getCollection = () => {
  const db = getDb();

  const collection = db.collection(collectionName);

  return collection;
};

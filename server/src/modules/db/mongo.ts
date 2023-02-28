import { Db, MongoClient } from "mongodb";

let _db: Db | null = null;

// create a connect
export const connect = async (): Promise<Db> => {
  const client = new MongoClient("mongodb://localhost:27023");
  console.log("connecting to MongoDB");
  await client.connect();
  _db = client.db("videodb");
  console.log("connected to MongoDB");
  return _db;
};

// create a getdb
export const getDb = (): Db | null => {
  return _db;
};

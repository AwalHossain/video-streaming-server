import { MongoClient } from "mongodb";

let db = null;

const connect = async () => {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect();
  const db = client.db("videodb");
  /**
   * insert one document
   */

  // console.log("connected to db", db.collection("videos2").insertOne("hello"));
  return db;
};

// Create a getDb

const getDb = async () => {
  if (!db) {
    db = await connect();
  }
  return db;
};

// getDb();

export { connect, getDb };

import { MongoClient } from "mongodb";

let db = null;

const connect = async () => {
  console.log("connecting to db", process.env.MONGO_URL);
  
  const client = new MongoClient(process.env.MONGO_URL);
  
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


import { MongoClient } from "mongodb";

let db = null;

const connect = async () => {
  const client = new MongoClient("mongodb://localhost:27023");
  console.log("connecting to MongoDB");
  await client.connect();
  db = client.db("videodb");
  console.log("connected to MongoDB");

  return db;
};

// Create a getDb

const getDb = () => {
  return db;
};

export { connect, getDb };

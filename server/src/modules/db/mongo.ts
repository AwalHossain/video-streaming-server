import { log } from "console";
import { Db, MongoClient } from "mongodb";

class MongoManager {
  private static _instance: Db;

  public static setInstance(instance: Db) {
    if (!MongoManager._instance) {
      log('setting instance');
      MongoManager._instance = instance;
    }
  }

  public static get Instance(): Db {
    return MongoManager._instance;
  }

  public static connect = async (): Promise<Db> => {
    if (MongoManager._instance) {
      return MongoManager._instance;
    }

    const mongoUrl = process.env.MONGO_URL;
    const client = new MongoClient(mongoUrl);

    try {
      log('connecting to db');
      await client.connect();
      const db = client.db("videodb");
      log('connected to db');
      MongoManager.setInstance(db);
      return db;
    } catch (error) {
      console.error('Error connecting to database:', error);
      throw error;
    }
  }
}


export default MongoManager;
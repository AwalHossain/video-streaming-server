import * as fs from 'fs';
import { Db, MongoClient } from 'mongodb';
import * as path from 'path';

// Singleton design pattern
class MongoManager {
  private static instance: Db | null = null;

  public static async setInstance(instance: Db) {
    if (!MongoManager.instance) {
      console.log('setting instance');
      MongoManager.instance = instance;
    }
  }

  public static get Instance() {
    return MongoManager.instance;
  }

  public static updateSchemas = async () => {
    const directoryPath = path.join(__dirname, 'schemas');
    const files = fs.readdirSync(directoryPath);
    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const { updateSchema } = require(filePath) as { updateSchema: (db: Db) => Promise<void> };
      if (updateSchema) await updateSchema(MongoManager.instance!);
    }
  };

  public static connect = async () => {
    if (MongoManager.instance) return MongoManager.instance;

    const mongoUrl = process.env.MONGO_URL ?? 'mongodb://localhost:27017';
    const client = new MongoClient(mongoUrl);
    console.log('connecting to MongoDB');
    await client.connect();
    const db = client.db('videodb');
    console.log('connected to MongoDB');
    await MongoManager.setInstance(db);
    await MongoManager.updateSchemas();
    return db;
  };
}

// Export the TypeScript version
export { MongoManager };


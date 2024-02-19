import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';

const globalSetup = async () => {
      let instance = await MongoMemoryServer.create();
      const uri = instance.getUri();
      (global as any).__MONGOINSTANCE = instance;
      process.env.MONGO_URL = uri.slice(0, uri.lastIndexOf('/'));
        console.log('From the globalSetup file',{
            uri:process.env.MONGO_URL,
            time:Date.now()
        });
        
    };

export default globalSetup;

// 1 - beforeAll
// 1 - beforeEach
// 1 - test
// 1 - afterEach
// 2 - beforeAll
// 1 - beforeEach
// 2 - beforeEach
// 2 - test
// 2 - afterEach
// 1 - afterEach
// 2 - afterAll
// 1 - afterAll
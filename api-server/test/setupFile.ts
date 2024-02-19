import mongoose from 'mongoose';
import { server } from '../src/server';
import {beforeAll, afterAll, describe, it,expect} from '@jest/globals';

// create more queues with the same connection...

// post jobs to queues...


beforeAll(async () => {
    // put your client connection code here, example with mongoose:
    await mongoose.connect(process.env.MONGO_URL as string);
  });
  
  afterAll(async () => {
    // put your client disconnection code here, example with mongodb:
    await mongoose.disconnect();
    console.log('disconnecting from MongoDB');
    
  });

  // afterAll(async () => {

  // });
 
  afterAll(done => {
    server.close(done);
  });


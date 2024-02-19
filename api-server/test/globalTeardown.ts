import { MongoMemoryServer } from "mongodb-memory-server";



const globalTeardown = async () => {
    const instance: MongoMemoryServer = (global as any).__MONGOINSTANCE;
    await instance.stop();
    }
export default globalTeardown;
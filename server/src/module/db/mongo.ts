import { MongoClient } from 'mongodb';



const connect = async()=>{
    const client = new MongoClient("mongodb://localhost:27023")
    console.log("connecting to MongoDB");
    await client.connect();
    console.log("connected to MongoDB");
}


export default connect;
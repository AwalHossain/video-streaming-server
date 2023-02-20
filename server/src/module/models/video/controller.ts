
import { Request, Response } from 'express';
import { collectionName as name } from './model';


const BASE_URL = `/api/${name}`;


export const setupRoutes = (app)=>{
    console.log(`Setting up routes for ${name}`);
    

    app.get(`${BASE_URL}/`,async (req:Request, res:Response) => {
        
        res.send({status: "success", message:"OK", timeStamp: new Date() })
    })
}


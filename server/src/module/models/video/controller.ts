
import { Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { collectionName as name } from './model';
import validate from './request';

type FileNameCallBack = (error: Error | null, fileName: string)=> void;
type DesnitionCallBack = (error: Error | null, destination: string) => void;

const BASE_URL = `/api/${name}`;


export const setupRoutes = (app)=>{
    console.log(`Setting up routes for ${name}`);
    

    // Return empty response with succes message for the base route
    app.get(`${BASE_URL}/`,async (req:Request, res:Response) => {
        
        res.send({status: "success", message:"OK", timeStamp: new Date() })
    })


    app.post(`${BASE_URL}/create`,async (req:Request, res:Response) => {
        const validationResult = validate(req.body);

        if(!validationResult.error){
            // const result = 
        }

        return res.status(400).json({status:"error", message: validationResult.error})

    })


    app.delete(`${BASE_URL}/delete/:id`, async (req, res) => {
        console.log("DELETE", req.params.id);
        if (req.params.id) {
        //   const result = await deleteById(req.params.id);
        //   if (result instanceof Error) {
        //     res.status(400).json(JSON.parse(result.message));
        //     return;
        //   }
        //   return res.json(result);
        }
        return res.status(400).json({ status: "error", message: "Id required" });
      });


      const storage = multer.diskStorage({
        destination: (
            req: Request,
            file: Express.Multer.File,
            cb: DesnitionCallBack
        ):void=>{
            cb(null, "upload/videos")
        },
        filename: (req: Request, file:Express.Multer.File, cb: FileNameCallBack): void=>{
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random()*1e9);

            cb(null, file.fieldname+"-"+uniqueSuffix);
        },
      });


      const fileFilter = (req: Request, file:Express.Multer.File, cb:FileFilterCallback):void=>{
        if(file.mimetype === 'video/mp4' || file.mimetype === "video/x-matroska"){
            console.log(`File type supported`, file);
            cb(null, true);
        }else{
            console.log(`File type not supported`, file);
            cb(null, false)
        }
      }


      const upload = multer({
        dest: "uploads/videos",
        fileFilter: fileFilter,
        limits:{fileSize: 50000000},
        storage: storage
      }).single("video")

      const uploadProcessor = (req: Request, res: Response, next: any)=>{
            upload(req, res, (err:string)=>{
                if(err){
                    console.error(err);
                    res.status(400).json({ status: "error", message: err });
                }else{
                    console.log("upload success", req.file);
        // res.status(200).json({ status: "success", message: "upload success" });
        next();   
                }
            })
      
      }

      app.post(`${BASE_URL}/upload`, uploadProcessor, async(req: Request, res:Response)=>{
            try{
                console.log(`Post upload`, JSON.stringify(req.body));

                const payload = {...req.body};
                console.log("user given metadata", "title", payload.title);
                
                res.send(req.file)
                
            }catch(error){
                console.error(error);
                res.send(error);
                
            }
      })

      app.use(()=>(err:any, req:Request, res: Response, next: any)=>{
        console.log("Error handler", err);
        if(err instanceof multer.MulterError){
            return res.status(418).send(err.code)
        }
        next();
      })


}


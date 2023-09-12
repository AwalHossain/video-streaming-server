
import { promises as fsPromises } from "fs";
import path from "path";
/// here i am going to update the vidoe history and add the path after each processing

import { S3Client } from "@aws-sdk/client-s3";
import eventManager from "../../../event-manager";
import { QUEUE_EVENTS } from "../../queues/constants";
import { VideoService } from "./video.service";



import { PutObjectCommand } from "@aws-sdk/client-s3";

const setupVideoHandler = () => {
  const s3 = new S3Client({
    forcePathStyle: true,
    endpoint: process.env.ENDPOINT,
    region: process.env.REGION,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY,
      secretAccessKey: process.env.SECRET_KEY,
    },
  }) as any;

  Object.values(QUEUE_EVENTS).forEach((queueName) => {

    eventManager.on(queueName, async (data) => {

      const uploadProcessedFile = async (folderPath: string, bucketName: string) => {
        const files = await fsPromises.readdir(folderPath);
        console.log(files, 'file checking');
        try {

          for (const file of files) {
            const filePath = path.join(folderPath, file);
            const key = file;

            const fileData = await fsPromises.readFile(filePath);
            const command = new PutObjectCommand({ // Create a PutObjectCommand instance
              Bucket: bucketName,
              Key: key,
              Body: fileData,
              ACL: "public-read",
            });

            //   const s3Client = new S3Client({
            //     region: "sgp1",
            //   });
            await s3.send(command);

            console.log(`Uploaded: ${key}`);
          }
        } catch (error) {
          console.error("Error uploading folder:", error);
        }


      }

      if (queueName === QUEUE_EVENTS.VIDEO_HLS_CONVERTED) {
        const rootFolder = path.resolve('./');
        // destination: 'uploads/videoplayback_1693755779611
        const file = data.destination.split('/')[1];
        const folderPath1 = path.join(rootFolder, `./uploads/${file}/hls`);
        const folderPath2 = path.join(rootFolder, `./uploads/${file}/thumbnails`);
        console.log("i am the hls converted handler!", data.path, 'checking', folderPath1);

        await uploadProcessedFile(folderPath1, `${file}`);
        await uploadProcessedFile(folderPath2, `${file}`);

        await VideoService.updateHistory(data.id, {
          history: { status: queueName, createdAt: Date.now() },
        });
      }



      // if(queueName === QUEUE_EVENTS.VIDEO_UPLOAD_PROGRESS) {

    })
  })
}
export default setupVideoHandler;
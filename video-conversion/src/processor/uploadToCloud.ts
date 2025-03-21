/* eslint-disable @typescript-eslint/no-explicit-any */
import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import { promises as fsPromises } from 'fs';
import path from 'path';
import config from '../config';
import { API_GATEWAY_EVENTS } from '../constant/events';
import ApiError from '../errors/apiError';
import RabbitMQ from '../shared/rabbitMQ';

dotenv.config();
// Log config for debugging
// Log config
console.log('Testing with:');
console.log('- Endpoint:', process.env.DO_SPACES_ENDPOINT);
console.log('- Bucket:', process.env.DO_SPACES_BUCKET_NAME);
console.log('- Key starts with:', process.env.DO_SPACES_ACCESS_KEY?.substr(0, 5));

// Configure S3 client
const s3 = new AWS.S3({
  endpoint: `https://${process.env.DO_SPACES_ENDPOINT}`,
  accessKeyId: process.env.DO_SPACES_ACCESS_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET_KEY,
  region: process.env.DO_SPACES_REGION || 'us-east-1'
});
const uploadProcessedFile = async (
  rootFolder: string,
  folderPath: string,
  dataCopy: any,
) => {
  const bucketName = process.env.DO_SPACES_BUCKET_NAME;
  const absoluteFolderPath = path.join(rootFolder, folderPath);
  console.log(`Uploading files from ${absoluteFolderPath} to ${bucketName}`);
  
  try {
    // List files to upload
    const files = await fsPromises.readdir(absoluteFolderPath);
    console.log(`Found ${files.length} files to upload`);
    
    // Create a base folder using the user ID

    const videoId = dataCopy.id || `video-${Date.now()}`;
    const userFolder = dataCopy.userId 
      ? `uploads/${dataCopy.userId}/videos/${videoId}` 
      : `uploads/anonymous/videos/${videoId}`;
    for (const file of files) {
      const filePath = path.join(absoluteFolderPath, file);
      const fileStats = await fsPromises.stat(filePath);
      
      // Skip directories
      if (fileStats.isDirectory()) {
        console.log(`Skipping directory: ${file}`);
        continue;
      }
      
      // Create a key with proper folder structure
      const key = `${userFolder}/${file}`;
      console.log(`Preparing to upload ${filePath} to ${bucketName}/${key}`);
      
      // Read file data
      const fileData = await fsPromises.readFile(filePath);
      
      // Determine content type
      let contentType = 'application/octet-stream';
      const ext = path.extname(file).toLowerCase();
      if (ext === '.m3u8') contentType = 'application/x-mpegURL';
      else if (ext === '.ts') contentType = 'video/MP2T';
      else if (ext === '.mp4') contentType = 'video/mp4';
      else if (ext === '.png') contentType = 'image/png';
      
      // Upload to Digital Ocean Spaces
      console.log(`Uploading ${file} (${fileData.length} bytes, ${contentType})`);
      const uploadResult = await s3.putObject({
        Bucket: bucketName,
        Key: key,
        Body: fileData,
        ACL: 'public-read'
      }).promise();
      
      console.log(`Successfully uploaded ${file} to ${bucketName}/${key}`, uploadResult);
      
      // Send notification
      const fileUrl = `https://${bucketName}.${config.doSpaces.endpoint}/${key}`;
      RabbitMQ.sendToQueue(
        API_GATEWAY_EVENTS.NOTIFY_AWS_S3_UPLOAD_PROGRESS,
        {
          userId: dataCopy.userId,
          status: 'processing',
          name: 'File Upload Progress',
          message: `Uploaded ${file}`,
          fileName: dataCopy.fileName || file,
          fileUrl: fileUrl
        }
      );
    }
    
    console.log(`All ${files.length} files uploaded successfully`);
    
  } catch (error) {
    console.error('Error uploading folder:', error);
    // Log detailed error information
    if (error.code) {
      console.error(`AWS Error Code: ${error.code}, Message: ${error.message}`);
    }
    
    RabbitMQ.sendToQueue(
      API_GATEWAY_EVENTS.NOTIFY_AWS_S3_UPLOAD_FAILED,
      {
        userId: dataCopy.userId,
        status: 'failed',
        message: `Video upload failed: ${error.message || 'Unknown error'}`
      }
    );
    
    throw new ApiError(500, `Video upload to Space failed: ${error.message || 'Unknown error'}`);
  }
};

export default uploadProcessedFile;
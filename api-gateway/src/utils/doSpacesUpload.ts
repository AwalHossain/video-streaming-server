import AWS from 'aws-sdk';
import { PresignedUrlOptions } from '../app/modules/video/video.interface';
import config from '../config';

// Configure the Digital Ocean Spaces client properly
const s3 = new AWS.S3({
  endpoint: config.doSpaces.endpoint,
  accessKeyId: config.doSpaces.accessKey,
  secretAccessKey: config.doSpaces.secretKey,
  region: config.doSpaces.region,
  // Force path style for more compatibility 
  s3ForcePathStyle: true,
  signatureVersion: 'v4'
});

/**
 * Generates a presigned URL for client-side uploading to Digital Ocean Spaces
 */
const generatePresignedUrl = async (options: PresignedUrlOptions) => {
  const { filename, contentType, userId, expirySeconds = 3600 } = options;
  
  // Generate a simpler key for the file (easier for testing)
  const timestamp = Date.now();
  const cleanFilename = filename.replace(/[^a-zA-Z0-9.]/g, '-');
  const key = `uploads/${userId}/${timestamp}-${cleanFilename}`;
  
  console.log('Generating presigned URL for:', {
    userId,
    key,
    contentType,
    bucket: config.doSpaces.bucketName
  });
  
  // Only include essential parameters
  const params = {
    Bucket: config.doSpaces.bucketName,
    Key: key,
    Expires: expirySeconds
  };

  try {
    // Generate the signed URL
    const url = await s3.getSignedUrlPromise('putObject', params);
    
    console.log('Successfully generated presigned URL');
    
    // Also generate a direct test link to verify the file after upload
    const fileUrl = `https://${config.doSpaces.bucketName}.${config.doSpaces.endpoint}/${key}`;
    const fileName = key.split('/').pop();
    return {
      uploadUrl: url,
      fileKey: key,
      bucketName: config.doSpaces.bucketName,
      fileUrl,
      fileName,
      instructions: "Upload using PUT request with exact URL. For Postman: Add Content-Type header and use binary body."
    };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
};

export default {
  generatePresignedUrl
};
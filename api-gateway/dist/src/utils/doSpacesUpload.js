"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const config_1 = __importDefault(require("../config"));
// Configure the Digital Ocean Spaces client properly
const s3 = new aws_sdk_1.default.S3({
    endpoint: config_1.default.doSpaces.endpoint,
    accessKeyId: config_1.default.doSpaces.accessKey,
    secretAccessKey: config_1.default.doSpaces.secretKey,
    region: config_1.default.doSpaces.region,
    // Force path style for more compatibility 
    s3ForcePathStyle: true,
    signatureVersion: 'v4'
});
/**
 * Generates a presigned URL for client-side uploading to Digital Ocean Spaces
 */
const generatePresignedUrl = async (options) => {
    const { filename, contentType, userId, expirySeconds = 3600 } = options;
    // Generate a simpler key for the file (easier for testing)
    const timestamp = Date.now();
    const cleanFilename = filename.replace(/[^a-zA-Z0-9.]/g, '-');
    const key = `uploads/${userId}/${timestamp}-${cleanFilename}`;
    console.log('Generating presigned URL for:', {
        userId,
        key,
        contentType,
        bucket: config_1.default.doSpaces.bucketName
    });
    // Only include essential parameters
    const params = {
        Bucket: config_1.default.doSpaces.bucketName,
        Key: key,
        Expires: expirySeconds
    };
    try {
        // Generate the signed URL
        const url = await s3.getSignedUrlPromise('putObject', params);
        console.log('Successfully generated presigned URL');
        // Also generate a direct test link to verify the file after upload
        const fileUrl = `https://${config_1.default.doSpaces.bucketName}.${config_1.default.doSpaces.endpoint}/${key}`;
        const fileName = key.split('/').pop();
        return {
            uploadUrl: url,
            fileKey: key,
            bucketName: config_1.default.doSpaces.bucketName,
            fileUrl,
            fileName,
            instructions: "Upload using PUT request with exact URL. For Postman: Add Content-Type header and use binary body."
        };
    }
    catch (error) {
        console.error('Error generating presigned URL:', error);
        throw error;
    }
};
exports.default = {
    generatePresignedUrl
};
//# sourceMappingURL=doSpacesUpload.js.map
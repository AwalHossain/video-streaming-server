"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const storage_blob_1 = require("@azure/storage-blob");
const config_1 = __importDefault(require("../config"));
const apiError_1 = __importDefault(require("../errors/apiError"));
const azureUpload = async (file, containerName) => {
    console.log('azureUpload called', file, containerName);
    try {
        const blobServiceClient = storage_blob_1.BlobServiceClient.fromConnectionString(config_1.default.azure.storage_connection_string);
        // Check if container exists
        const containerClient = blobServiceClient.getContainerClient(containerName);
        await containerClient.createIfNotExists({
            access: 'container',
        });
        console.log(file, 'file inside azureUpload');
        // Create blob client for the specific file location
        const blockBlobClient = containerClient.getBlockBlobClient(file.filename);
        // Read the file from disk
        const buffer = file.buffer;
        // Upload data to the blob
        const response = await blockBlobClient.upload(buffer, buffer.length);
        return response;
    }
    catch (error) {
        console.log('Got error while uploading to azure', error);
        throw new apiError_1.default(500, 'Error while uploading to azure');
    }
};
exports.default = azureUpload;
//# sourceMappingURL=azureUpload.js.map
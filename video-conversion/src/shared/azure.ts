// azure blob storage connection function

import { BlobServiceClient } from '@azure/storage-blob';
import config from '../config';

export const blobServiceClient = BlobServiceClient.fromConnectionString(
  config.azure.storage_connection_string,
);

// src/shared/metadataStore.ts
import { IVideoMetadata } from '../interface/common';
import { logger } from './logger';

// Simple in-memory store for video metadata, keyed by fileName
const metadataStore = new Map<string, IVideoMetadata>();

export const storeMetadata = (fileName: string, metadata: IVideoMetadata): void => {
  logger.info(`Storing metadata for fileName: ${fileName}`);
  metadataStore.set(fileName, metadata);
};

export const getMetadata = (fileName: string): IVideoMetadata | undefined => {
  logger.info(`Attempting to retrieve metadata for fileName: ${fileName}`);
  return metadataStore.get(fileName);
};

export const removeMetadata = (fileName: string): boolean => {
  logger.info(`Removing metadata for fileName: ${fileName}`);
  return metadataStore.delete(fileName);
};

// Optional: Add a function to wait for metadata with a timeout
export const waitForMetadata = async (
  fileName: string,
  timeoutMs: number = 60000, // Default timeout: 60 seconds
  pollIntervalMs: number = 1000 // Check every 1 second
): Promise<IVideoMetadata> => {
  const startTime = Date.now();
  logger.info(`Waiting for metadata for fileName: ${fileName} (Timeout: ${timeoutMs}ms)`);

  return new Promise((resolve, reject) => {
    const intervalId = setInterval(() => {
      const metadata = getMetadata(fileName);
      if (metadata) {
        logger.info(`Metadata found for fileName: ${fileName}`);
        clearInterval(intervalId);
        removeMetadata(fileName);
        resolve(metadata);
      } else if (Date.now() - startTime > timeoutMs) {
        logger.warn(`Timeout waiting for metadata for fileName: ${fileName}`);
        clearInterval(intervalId);
        reject(new Error(`Metadata for fileName ${fileName} not received within timeout.`));
      } else {
         // Still waiting
        // logger.debug(`Still waiting for metadata for fileName: ${fileName}`); // Optional: more verbose logging
      }
    }, pollIntervalMs);
  });
};

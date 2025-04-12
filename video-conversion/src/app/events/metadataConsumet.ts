import { API_SERVER_EVENTS } from "../../constant/events";
// Re-import IVideoMetadata
import { IVideoMetadata } from "../../interface/common";
import { errorLogger, logger } from "../../shared/logger";
import { storeMetadata } from "../../shared/metadataStore";
import RabbitMQ from "../../shared/rabbitMQ";


// Define the payload type as an intersection

type IMetadataPayload = { fileName: string } & IVideoMetadata;

// Remove the old interface definition
/*
interface IMetadataPayload {
  fileName: string;
  [key: string]: any; 
}
*/

const consumeVideoMetadata = async (): Promise<void> => {
  logger.info('Setting up RabbitMQ consumer for flattened video metadata...');
  try {
    await RabbitMQ.consume(
      API_SERVER_EVENTS.GET_VIDEO_METADATA_EVENT,
      (msg, ack) => {
        try {
          const payload: IMetadataPayload = JSON.parse(msg.content.toString());
          // Log the object using JSON.stringify for full inspection
          console.log('Received raw metadata message payload:', JSON.stringify(payload, null, 2));

          // --- ADJUSTED VALIDATION --- 
          // Ensure the payload is an object
          if (!payload || typeof payload !== 'object') {
             errorLogger.error('Received invalid metadata payload format (not an object).', payload);
             ack(); 
             return;
          }
          // Check only for the essential identifier (fileName)
          if (!payload.fileName || typeof payload.fileName !== 'string') {
             errorLogger.error('Received metadata payload without a valid fileName.', payload);
              ack(); 
             return;
          }
          // --- REMOVED CHECK FOR payload.metadata --- 
          /* 
           if (!payload.metadata || typeof payload.metadata !== 'object') {
             errorLogger.error(`Received metadata payload without valid metadata object for fileKey: ${payload.fileName}.`, payload);
              ack(); 
             return;
          }
          */
          // --- END ADJUSTED VALIDATION --- 


          logger.info(`Storing metadata for fileName: ${payload.fileName}`);
          // Pass the payload directly. Since it conforms to IVideoMetadata (due to the intersection type),
          // and storeMetadata expects IVideoMetadata, this should work without `as any`.
          storeMetadata(payload.fileName, payload);
          ack(); 
        } catch (parseError) {
          errorLogger.error('Error parsing video metadata message:', parseError, msg.content.toString());
          // Acknowledge the message even if parsing fails to avoid poison pill messages
          // Alternatively, configure a dead-letter queue in RabbitMQ
          ack();
        }
      },
    );
    logger.info('Successfully set up RabbitMQ consumer for video metadata.');
  } catch (error) {
    errorLogger.error('Failed to set up RabbitMQ consumer for video metadata:', error);
    // Depending on your application's needs, you might want to retry or exit
    process.exit(1); // Example: Exit if the consumer setup fails critically
  }
};

export default consumeVideoMetadata;
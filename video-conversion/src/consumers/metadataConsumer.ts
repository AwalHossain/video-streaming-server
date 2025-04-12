// import { API_SERVER_EVENTS } from '../constant/events';
// import { IVideoMetadata } from '../interface/common';
// import { errorLogger, logger } from '../shared/logger';
// import { storeMetadata } from '../shared/metadataStore';
// import RabbitMQ from '../shared/rabbitMQ';

// // --- Modify Interface to expect fileName --- 
// interface IMetadataPayload {
//   // fileKey: string; // Removed fileKey
//   fileName: string; // Expecting fileName now
//   metadata: IVideoMetadata;
//   // Add other potential fields from the actual payload if necessary
// }

// const consumeVideoMetadata = async (): Promise<void> => {
//   logger.info('Setting up RabbitMQ consumer for video metadata (expecting fileName)...');
//   try {
//     await RabbitMQ.consume(
//       API_SERVER_EVENTS.GET_VIDEO_METADATA_EVENT,
//       (msg, ack) => { // Start of callback function
//         try { // Start of inner try block
//           const payload: IMetadataPayload = JSON.parse(msg.content.toString());
//           // --- Use fileName for logging and validation --- 
//           logger.info(`Received raw metadata message for fileName: ${payload?.fileName}`);

//           // --- IMPORTANT VALIDATION --- 
//           // Ensure the payload has the expected structure, especially fileName
//           if (!payload || typeof payload !== 'object') {
//              errorLogger.error('Received invalid metadata payload format (not an object).', payload);
//              ack(); // Acknowledge message to prevent requeueing bad data
//              return;
//           }
//           // --- Update validation check to use fileName --- 
//           if (!payload.fileName || typeof payload.fileName !== 'string') {
//              errorLogger.error('Received metadata payload without a valid fileName.', payload);
//               ack(); // Acknowledge message
//              return;
//           }
//            if (!payload.metadata || typeof payload.metadata !== 'object') {
//              errorLogger.error(`Received metadata payload without valid metadata object for fileName: ${payload.fileName}.`, payload);
//               ack(); // Acknowledge message
//              return;
//           }
//           // --- END VALIDATION --- 

//           // --- Use fileName to store metadata --- 
//           logger.info(`Storing metadata for fileName: ${payload.fileName}`);
//           // Assuming the actual metadata object is nested under a 'metadata' key
//           storeMetadata(payload.fileName, payload.metadata);
//           ack(); // Acknowledge the message has been processed
//         } catch (parseError) {
//           errorLogger.error('Error parsing video metadata message:', parseError, msg.content.toString());
//           // Acknowledge the message even if parsing fails to avoid poison pill messages
//           // Alternatively, configure a dead-letter queue in RabbitMQ
//           ack();
//         }
//       }, // End of callback function
//     ); // End of RabbitMQ.consume call
//     logger.info('Successfully set up RabbitMQ consumer for video metadata (expecting fileName).');
//   } catch (error) { // End of outer try, start of outer catch
//     errorLogger.error('Failed to set up RabbitMQ consumer for video metadata:', error);
//     // Depending on your application's needs, you might want to retry or exit
//     process.exit(1); // Example: Exit if the consumer setup fails critically
//   } // End of outer catch
// }; // End of consumeVideoMetadata function

// export default consumeVideoMetadata; 
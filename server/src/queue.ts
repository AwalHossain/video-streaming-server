import { setupAllQueueEvent } from "../src/modules/queues/worker";

setupAllQueueEvent();

console.log("Queue server has started! port 6379");

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class EventManager extends events_1.EventEmitter {
    constructor() {
        super(); // Calling the super class constructor
    }
    static getInstance() {
        if (!EventManager.instance) {
            EventManager.instance = new EventManager();
        }
        return EventManager.instance;
    }
}
exports.default = EventManager.getInstance(); // Exporting a singleton instance
// class EventManager extends EventEmitter {
//   static instance: any;
//   constructor() {
//     super(); // Calling the super class constructor
//     if (!EventManager.instance) {
//       EventManager.instance = new EventEmitter();
//     }
//   }
//   getInstance() {
//     return EventManager.instance;
//   }
// }
// export = new EventManager(); // Exporting a singleton instance

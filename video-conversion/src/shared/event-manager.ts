import { EventEmitter } from 'events';

class EventManager extends EventEmitter {
  private static instance: EventManager;

  private constructor() {
    super(); // Calling the super class constructor
  }

  static getInstance() {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }
}

export default EventManager.getInstance(); // Exporting a singleton instance

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

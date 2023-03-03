import EventEmitter from "events";

class EventManager extends EventEmitter {
  static instance: any;
  constructor() {
    super(); // Calling the super class constructor
    if (!EventManager.instance) {
      EventManager.instance = new EventEmitter();
    }
  }

  getInstance() {
    return EventManager.instance;
  }
}

export = new EventManager(); // Exporting a singleton instance

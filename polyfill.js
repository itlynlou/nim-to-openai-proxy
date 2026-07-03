// index.js — Entry point that polyfills BEFORE anything else
if (typeof globalThis !== 'undefined') {
  if (typeof globalThis.SharedWorker === 'undefined') {
    globalThis.SharedWorker = class SharedWorker {
      constructor() {
        this.port = {
          start: () => {},
          postMessage: () => {},
          onmessage: null,
          addEventListener: () => {},
          removeEventListener: () => {},
          close: () => {},
        };
        this.onerror = null;
      }
    };
  }
  // Also stub regular Worker just in case
  if (typeof globalThis.Worker === 'undefined') {
    globalThis.Worker = class Worker {
      constructor() {
        this.onmessage = null;
        this.onerror = null;
        this.postMessage = () => {};
        this.terminate = () => {};
        this.addEventListener = () => {};
        this.removeEventListener = () => {};
      }
    };
  }
}

// Now require server.js
require('./server.js');

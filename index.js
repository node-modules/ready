'use strict';

const is = require('is-type-of');

const IS_READY = Symbol('isReady');
const READY_CALLBACKS = Symbol('readyCallbacks');

class Ready {

  constructor() {
    this[IS_READY] = false;
    this[READY_CALLBACKS] = [];
  }

  ready(flagOrFunction) {
    // register a callback
    if (flagOrFunction === undefined || is.function(flagOrFunction)) {
      return this.register(flagOrFunction);
    }

    this.emit(flagOrFunction);
  }

  register(flagOrFunction) {
    // support `this.ready().then(onready);` and `yield this.ready()`;
    if (!flagOrFunction) {
      return new Promise(resolve => {
        if (this[IS_READY]) {
          return resolve();
        }
        this[READY_CALLBACKS].push(resolve);
      });
    }

    // this.ready(fn)
    if (this[IS_READY]) {
      flagOrFunction();
    } else {
      this[READY_CALLBACKS].push(flagOrFunction);
    }
  }

  emit(flagOrFunction) {
    this[IS_READY] = !!flagOrFunction;
    // this.ready(true)
    if (this[IS_READY]) {
      this[READY_CALLBACKS]
        .splice(0, Infinity)
        .forEach(callback => process.nextTick(callback));
    }
  }

  static mixin(obj) {
    const ready = new Ready();
    obj.ready = flagOrFunction => ready.ready(flagOrFunction);
  }
}

function mixin(object) {
  Ready.mixin(object);
}

module.exports = mixin;
module.exports.mixin = mixin;
module.exports.Ready = Ready;

'use strict';

const assert = require('assert');
const ready = require('../');

class SomeClass {
  constructor() {
    this.property = 'value';
    ready.mixin(this);
  }

  method() {
    return 'method';
  }
}

describe('inherits', () => {

  it('should have Ready properties', () => {
    const someClass = new SomeClass();
    assert('ready' in someClass);
  });

  it('should be separate from other instances', function* () {
    const someClass = new SomeClass();
    const anotherClass = new SomeClass();
    let someCallCount = 0;
    let anotherCallCount = 0;
    anotherClass.ready(() => { anotherCallCount++; });
    someClass.ready(() => { someCallCount++; });
    someClass.ready(() => { someCallCount++; });
    someClass.ready(true);
    anotherClass.ready(true);
    yield nextTick();
    assert(someCallCount === 2);
    assert(anotherCallCount === 1);
  });

  it('should ready(obj) directly work', () => {
    const foo = {};
    assert(!('ready' in foo));
    ready(foo);
    assert(typeof foo.ready === 'function');
  });
});

describe('ready', () => {

  it('should execute and dequeue callbacks', function* () {
    const someClass = new SomeClass();
    const arr = [];
    someClass.ready(() => arr.push(1));
    someClass.ready(() => arr.push(2));
    someClass.ready(true);
    yield nextTick();
    assert.deepEqual(arr, [ 1, 2 ]);

    someClass.ready(true);
    yield nextTick();
    assert.deepEqual(arr, [ 1, 2 ]);
  });

  it('should immediatly call callback when already ready', function(done) {
    const someClass = new SomeClass();
    someClass.ready(true);
    someClass.ready(done);
  });

  it('should not call when ready set to false', function(done) {
    const someClass = new SomeClass();
    someClass.ready(true);
    someClass.ready(false);
    someClass.ready(done => done('should not execute because it is not ready'));
    setTimeout(() => {
      done();
    }, 10);
  });
});

describe('promise', () => {
  it('should resolve after ready', function(done) {
    const someClass = new SomeClass();
    someClass.ready().then(() => {
      someClass.ready().then(done);
    });
    someClass.ready(true);
  });
});

describe('generator', () => {
  it('should work with co', function* () {
    const someClass = new SomeClass();
    setTimeout(() => {
      someClass.ready(true);
    }, 100);
    yield someClass.ready();
  });
});

function nextTick() {
  return done => process.nextTick(done);
}

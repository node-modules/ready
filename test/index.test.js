
import assert from 'assert';
import ready from '..';

class SomeClass {
  constructor() {
    this.property = 'value';
    ready.mixin(this);
  }

  method() {
    return 'method';
  }
}

describe('exports', () => {
  it('should exports mixin', () => {
    assert(ready.mixin);
    assert(ready.mixin === ready);
  });

  it('should exports Ready', () => {
    assert(ready.Ready);
  });
});

describe('mixin', () => {
  it('should not throw when mixin undefined', () => {
    ready();
  });
});

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

  it('should ready when using other type', done => {
    const someClass = new SomeClass();
    someClass.ready(done);
    someClass.ready(0);
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

describe('error', () => {
  it('should get error in callback', done => {
    const someClass = new SomeClass();
    someClass.ready(err => {
      assert(err);
      assert(err.message === 'error');
      done();
    });
    someClass.ready(new Error('error'));
  });

  it('should get error in promise', done => {
    const someClass = new SomeClass();
    someClass.ready().catch(err => {
      assert(err);
      assert(err.message === 'error');
      done();
    });
    someClass.ready(new Error('error'));
  });

  it('should get error after ready in callback', done => {
    const someClass = new SomeClass();
    someClass.ready(new Error('error'));
    someClass.ready(err => {
      assert(err);
      assert(err.message === 'error');
      done();
    });
  });

  it('should get error after ready in promise', done => {
    const someClass = new SomeClass();
    someClass.ready(new Error('error'));
    someClass.ready().catch(err => {
      assert(err);
      assert(err.message === 'error');
      done();
    });
  });
});

function nextTick() {
  return done => setTimeout(done);
}

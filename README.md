# consumer-queue

[![Build Status](https://travis-ci.com/stanford-oval/consumer-queue.svg?branch=master)](https://travis-ci.com/stanford-oval/consumer-queue) [![Coverage Status](https://coveralls.io/repos/github/stanford-oval/consumer-queue/badge.svg?branch=master)](https://coveralls.io/github/stanford-oval/consumer-queue?branch=master)

This module implements a simple unbounded producer-consumer queue (similar to a `BlockingQueue` in Java).
Multiple asynchronous tasks can push data, and one task can pull data from the queue and process it.

## Installation

```
npm install consumer-queue
```

## Usage

On the consumer side:

```javascript
const ConsumerQueue = require('consumer-queue');
const queue = new ConsumerQueue();
function loop() {
    return queue.pop().then((value) => {
        // ... do something with value ...
        return loop();
    });
}
```

On the producer side:
```javascript
// ... produce value ...
queue.push(value);
// ... produce second value ...
queue.push(value);
```

## API

### Class ConsumerQueue

#### constructor

```javascript
constructor()
```

Construct a new empty queue.

#### method push

```javascript
function push(value : any)
```

Push a new value at the end of the queue

#### method hasWaiter

```javascript
function hasWaiter() : bool
```

Returns `true` if a consumer is currently waiting for the next value, `false` otherwise.

#### method cancelWait

```javascript
function cancelWait(err : Error?)
```

If a consumer is currently waiting on the queue, causes the consumer to stop waiting.
The consumer promise will be rejected with `err`, if given, or a generic error otherwise.

#### method pop

```javascript
function pop() : Promise<any>
```

Asynchronously returns the next value in queue. This method returns a promise that will
be fulfilled immediately if the queue already contains a value, and will be fulfilled
when the producer calls `push()` otherwise.

#### method tryPop

```javascript
function tryPop() : any?
```

Synchronously checks for the presence of a value in queue, and pops it if so.
This method returns `null` if the queue is empty.

"use strict";

const assert = require('assert');

process.on('unhandledRejection', (up) => { throw up; });
// fail if we are not done in 60s
const timeout = setTimeout(() => {
    throw new Error('Timed out');
}, 60000);
timeout.unref();

const SUCCESS = [{}, {}, {}];
const FAILURE = {};

const ConsumerQueue = require('.');

function testSimple() {
    const queue = new ConsumerQueue();

    queue.push(SUCCESS[0]);

    function loop(i) {
        return queue.pop().then((v) => {
            if (i < SUCCESS.length)
                assert.strictEqual(v, SUCCESS[i]);
            else
                assert.fail();
            return loop(i+1);
        });
    }
    loop(0);

    queue.push(SUCCESS[1]);
    queue.push(SUCCESS[2]);
}

function testAsync() {
    const queue = new ConsumerQueue();

    let i = 0;
    function loop() {
        return queue.pop().then((v) => {
            if (i < SUCCESS.length)
                assert.strictEqual(v, SUCCESS[i]);
            else
                assert.fail();
            i++;
            return loop();
        });
    }
    loop(0);

    setTimeout(() => queue.push(SUCCESS[0]), 100);
    setTimeout(() => queue.push(SUCCESS[1]), 1000);

    setTimeout(() => {
        if (i < 2)
            throw new Error();
    }, 10000);
}

function testCancel1() {
    const queue = new ConsumerQueue();

    let result;
    queue.pop().then((v) => {
        result = FAILURE;
    }, (e) => {
        result = SUCCESS[0];
    }).then(() => {
        assert.strictEqual(result, SUCCESS[0]);
    });

    assert.strictEqual(queue.hasWaiter(), true);
    queue.cancelWait();
}

function testCancel2() {
    const queue = new ConsumerQueue();

    assert.strictEqual(queue.hasWaiter(), false);
    queue.cancelWait();

    let result;
    queue.pop().then((v) => {
        result = SUCCESS[0];
    }, (e) => {
        result = FAILURE;
    }).then(() => {
        assert.strictEqual(result, SUCCESS[0]);
    });
}

function testTryPop() {
    const queue = new ConsumerQueue();

    assert.strictEqual(queue.tryPop(), null);

    queue.push(SUCCESS[0]);

    assert.strictEqual(queue.tryPop(), SUCCESS[0]);
    assert.strictEqual(queue.tryPop(), null);
}

function main() {
    testSimple();
    testAsync();
    testCancel1();
    testCancel2();
    testTryPop();
}
main();
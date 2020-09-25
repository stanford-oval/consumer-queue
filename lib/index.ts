// -*- mode: typescript; indent-tabs-mode: nil; js-basic-offset: 4 -*-
//
// Copyright 2017-2020 The Board of Trustees of the Leland Stanford Junior University
//
// Author: Giovanni Campagna <gcampagn@cs.stanford.edu>
//
// See COPYING for details
"use strict";

interface LinkedListItem<T> {
    data : T;
    next : LinkedListItem<T>|null;
}

export default class ConsumerQueue<T> {
    private _head : LinkedListItem<T>|null;
    private _tail : LinkedListItem<T>|null;
    private _waiter : ((value : T) => void)|null;
    private _cancel : ((error : any) => void)|null;

    constructor() {
        this._head = null;
        this._tail = null;
        this._waiter = null;
        this._cancel = null;
    }

    tryPop() : T|null {
        if (this._head !== null) {
            let data = this._head.data;
            this._head = this._head.next;
            if (this._head === null)
                this._tail = null;
            return data;
        } else {
            return null;
        }
    }

    // For compatibility with AsyncIterator
    next() : Promise<T> {
        return this.pop();
    }

    pop() : Promise<T> {
        if (this._head !== null) {
            return Promise.resolve(this.tryPop() as T);
        } else if (this._waiter !== null) {
            throw new Error('Someone is already waiting on this queue');
        } else {
            return new Promise((callback, errback) => {
                this._waiter = callback;
                this._cancel = errback;
            });
        }
    }
    cancelWait(err : Error) : void {
        let cancel = this._cancel;
        this._cancel = null;
        this._waiter = null;
        if (cancel)
            cancel(err);
    }

    hasWaiter() : boolean {
        return this._waiter !== null;
    }

    push(data : T) : void {
        let waiter = this._waiter;
        this._waiter = null;
        this._cancel = null;
        if (waiter) {
            waiter(data);
        } else if (this._tail === null) {
            this._head = this._tail = { data: data, next: null };
        } else {
            this._tail.next = { data: data, next: null };
            this._tail = this._tail.next;
        }
    }
}

// adjust interface for compatibility
module.exports = ConsumerQueue;
module.exports.default = ConsumerQueue;

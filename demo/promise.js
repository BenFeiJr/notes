/**
 * Promise constructor accept executor
 */

const MyPromise = function (executor) {
    const promiseInstance = this;
    const PENDING = 'pending';
    const FULFILLED = 'fulfilled';
    const REJECTED = 'rejected';

    const pubsub = {
        _events: {},
        on: (name, handler) => {
            if (!pubsub._events[name]) { pubsub._events[name] = []; }
            
            pubsub._events[name].push(handler);
        },
        fire: (name) => {
            if (pubsub._events[name] && pubsub._events[name].length > 0) {
                pubsub._events[name].forEach((handler) => {
                    setTimeout(handler, 0);
                });
            }
        }
    };

    const isObject = (value) => {
        return value != null && (typeof value === 'object' || typeof value === 'function');
    };

    const isFunction = (value) => {
        return isObject(value) && Object.prototype.toString.call(value).toLowerCase() === '[object function]';
    }

    promiseInstance._state = PENDING;

    const myPromise_resolve = function (value) {
        // 更改状态
        // 发布事件
        promiseInstance._state = FULFILLED;
        promiseInstance._fulfilledValue = value;
        pubsub.fire(FULFILLED);
    };

    const myPromise_reject = function (reason) {
        promiseInstance._state = REJECTED;
        promiseInstance._rejectedReason = reason;
        pubsub.fire(REJECTED);
    };

    const promiseResolutionProcedure = function (promise2, promise2_resolve, promise2_reject, promise1_value) {
        if (promise1_value instanceof MyPromise) {
            const promise3 = promise1_value;
            switch (promise3._state) {
                case PENDING: {
                    promise3.then.call(
                        promise1_value,
                        function (promise3_value) {
                            promiseResolutionProcedure(promise2, promise2_resolve, promise2_reject, promise3_value);
                        },
                        function (promise3_reason) {
                            promise2_reject(promise3_reason);
                        }
                    );
                    break;
                }
                case FULFILLED: {
                    promise2_resolve(promise3._fulfilledValue);
                    break;
                }
                case REJECTED: {
                    promise2_reject(promise3._rejectedReason);
                    break;
                }
            }
        }
        else if (isObject(promise1_value)) {
            try {
                if (isFunction(promise1_value.then)) {
                    const promise3 = promise1_value;
                    promise3.then.call(
                        promise1_value,
                        function (promise3_value) {
                            promiseResolutionProcedure(promise2, promise2_resolve, promise2_reject, promise3_value);
                        },
                        function (promise3_reason) {
                            promise2_reject(promise3_reason);
                        }
                    );
                }
                else {
                    promise2_resolve(promise1_value);
                }
            }
            catch (err) {
                promise2_reject(err);
            }
        }
        else {
            promise2_resolve(promise1_value);
        }
    };

    const addFulfilledHandler = function (promise1_onFulfilled, promise2, promise2_resolve, promise2_reject) {
        pubsub.on(FULFILLED, () => {
            if  (isFunction(promise1_onFulfilled)) {
                try {
                    const value = promise1_onFulfilled(promiseInstance._fulfilledValue);
                    promiseResolutionProcedure(promise2, promise2_resolve, promise2_reject, value);
                }
                catch (err) {
                    promise2_reject(err);
                }
            }
            else {
                promise2_resolve(promiseInstance._fulfilledValue);
            }
        });
    };

    const addRejectedHandler = function (promise1_onRejected, promise2, promise2_resolve, promise2_reject) {
        pubsub.on(REJECTED, () => {
            if (isFunction(promise1_onRejected)) {
                try {
                    const value = promise1_onRejected(promiseInstance._rejectedReason);
                    promiseResolutionProcedure(promise2, promise2_resolve, promise2_reject, value);
                }
                catch (err) {
                    promise2_reject(err);
                }
            }
            else {
                promise2_reject(promiseInstance._rejectedReason);
            }
        });
    };

    const myPromise_then = function (onFulfilled, onRejected) {
        // 注册事件
        // 监听状态，调用事件

        const promise2 = new MyPromise(function (resolve, reject) {
            addFulfilledHandler(onFulfilled, this, resolve, reject);
            addRejectedHandler(onRejected, this, resolve, reject);
        });

        return promise2;
    };

    const myPromise_catch = function (onRejected) {
        const promise2 = new MyPromise(function (resolve, reject) {
            addRejectedHandler(onRejected, this, resolve, reject);
        });

        return promise2;
    };

    executor(myPromise_resolve, myPromise_reject);

    promiseInstance.then = myPromise_then;
    promiseInstance.catch = myPromise_catch;
};

const p1 = new MyPromise((resolve, reject) => {
    setTimeout(() => {
        resolve(1);
    }, 1000)
});

p1.then((res) => {
    console.log(res);
    return new MyPromise((resolve, reject) => {
        setTimeout(() => {
            resolve(26);
        }, 1000)
    })
}).then((res) => {
    console.log(res);
    throw new Error('出错了');
}).catch((err) => {
    console.log(err.message);
    return 27;
}).then((res) => {
    console.log(res);
});
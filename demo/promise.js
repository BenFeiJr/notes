/**
 * Promise constructor accept executor
 */

const MyPromise = function (executor) {
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

    let promiseState = PENDING;
    let fulfilledValue, rejectedReason;

    const resolve = function (value) {
        // 更改状态
        // 发布事件
        promiseState = FULFILLED;
        fulfilledValue = value;
        pubsub.fire(FULFILLED);
    };

    const reject = function (reason) {
        promiseState = REJECTED;
        rejectedReason = reason;
        pubsub.fire(REJECTED);
    };

    const then = function (onFulfilled, onRejected) {
        // 注册事件
        // 监听状态，调用事件

        return new MyPromise((resolve, reject) => {
            pubsub.on(FULFILLED, () => {
                if  (isFunction(onFulfilled)) {
                    try {
                        const value = onFulfilled(fulfilledValue);
                        resolve(value);
                    }
                    catch (err) {
                        reject(err);
                    }
                }
                else {
                    resolve(fulfilledValue);
                }
            });

            pubsub.on(REJECTED, () => {
                if (isFunction(onRejected)) {
                    try {
                        const value = onRejected(rejectedReason);
                        resolve(value);
                    }
                    catch (err) {
                        reject(err);
                    }
                }
                else {
                    reject(rejectedReason);
                }
            });
        });
    };

    executor(resolve, reject);

    this.then = then;
};

const p1 = new MyPromise((resolve, reject) => {
    setTimeout(() => {
        resolve(12);
    }, 3000)
});

p1.then().then((res) => {
    console.log(res);
});
class Promise {
    constructor(executor) {
        if(typeof executor !== 'function') {
            throw new TypeError("Promise resolver undefined is not a function")
        }
        this.state = 'pending'
        this.value = undefined
        this.reason = undefined

        this.onResolvedCallbacks = []
        this.onRejectedCallbacks = []

        let resolve = (value) => {
            if(this.state === 'pending') {
                if(value instanceof Promise) {
                    value.then(val => {
                        resolve(val)
                    }, err => {
                        reject(err)
                    })
                } else {
                    this.state = 'fullfilled'
                    this.value = value
                    this.onResolvedCallbacks.forEach(fn => fn())
                }
            }
        }
        let reject = (reason) => {
            if(this.state === 'rejected') {
                this.state = 'rejected'
                this.reason = reason
                this.onRejectedCallbacks.forEach(fn => fn())
            }
        }

        try {
            executor(resolve, reject)
        } catch (err) {
            reject(err)
        }
    }
    then(onResolved, onRejected) {
        let promise2 =  new Promise((resolve, reject) => {
            if(this.state === 'fullfilled') {
                let x = onResolved(this.value)
                setTimeout(() => {
                    try {
                        resolvePromise(promise2, x, resolve, reject)
                    } catch (err) {
                        reject(err)
                    }
                }, 0)
            }
            if(this.state === 'rejected') {
                let x = onRejected(this.reason)
                setTimeout(() => {
                    try {
                        resolvePromise(promise2, x, resolve, reject)
                    } catch (err) {
                        reject(err)
                    }
                }, 0)
            }

            if(this.state === 'pending') {
                this.onResolvedCallbacks.push(() => {
                    let x = onResolved(this.value)
                    setTimeout(() => {
                        try {
                            resolvePromise(promise2, x, resolve, reject)
                        } catch (err) {
                            reject(err)
                        }
                    }, 0)
                })
                this.onRejectedCallbacks.push(() => {
                    let x = onRejected(this.reason)
                    setTimeout(() => {
                        try {
                            resolvePromise(promise2, x, resolve, reject)
                        } catch (err) {
                            reject(err)
                        }
                    }, 0)
                })
            }
        })
        return promise2
    }

    static all(promiseArr) {
        return new Promise((resolve, reject) => {
            let result = []
            let len = promiseArr.length
            let count = 0

            promiseArr.forEach((promise, index) => {
                promise.then(value => {
                    result[index] = value
                    count++
                    if(count === len) {
                        resolve(result)
                    }
                }, reason => {
                    reject(reason)
                })
            })
        })
    }
    static race(promiseArr) {
        return new Promise((resolve, reject) => {
            promiseArr.forEach(promise => {
                promise.then(value => {
                    resolve(value)
                }, reason => {
                    reject(reason)
                })
            })
        })
    }
}

function resolvePromise(promise2, x, resolve, reject) {
    if(promise2 === x) {
        return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
    }
    try {
        if(x instanceof Promise) {
            x.then(y => {
                resolvePromise(promise2, y, resolve, reject)
            }, r => {
                reject(r)
            })
        } else {
            resolve(x)
        }
    } catch (err) {
        reject(err)
    }
}

const p = new Promise((resolve, reject) => {
    resolve(new Promise((resolve, reject) => {
        resolve(200)
    }))
})
const promise = p.then((value) => {
    console.log(value)
})

const p3 = new Promise((resolve, reject) => {
    resolve(200)
})
const promise3 = p3.then((value) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(new Promise((resolve, reject) => {
                resolve([value, 'hello'])
            }))
        }, 3000)
    })
})
promise3.then(value => {
    console.log(value)
})
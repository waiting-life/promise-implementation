const PENDING = 'pending'
const FULLFILLED = 'fullfilled'
const REJECTED = 'rejected'

function resolvePromise(x, promise2, resolve, reject) {
    if(promise2 === x) {
        return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
    }
    if(typeof x === 'object' && x !== null || typeof x === 'function') {
        try {
            // Let then be x.then
            let then = x.then
            if(typeof then === 'function') {  // 如果x.then为一个函数，认为x为一个promise
                // first argument resolvePromise, and second argument rejectPromise
                // 第一个参数为成功的promise，y => {} 第二个参数为失败的promise  r => {}
                 then.call(x, y => { // 这里的y可能还是一个Promise,递归知道解析出来的结果是一个普通值为止
                    resolvePromise(y, promise2, resolve, reject) // 采用promise的成功结果，将值向下传递
                 }, r => {
                    reject(r)  // 采用失败结果向下传递
                 })
            } else {
                // 说明x是一个普通的对象
                resolve(x)
            }
        } catch (err) {
            reject(err)
        }
    } else {
        // 说明x是一个普通的值
        resolve(x)
    }
}
// 解决链式调用, resolve一个promise的时候
class Promise {
    // 初始化状态
    constructor(executor) {
        this.state = PENDING
        this.value = undefined
        this.reason = undefined

        this.onResolvedCallbacks = []
        this.onRejectedCallbacks = []

        let resolve = (value) => {
            if(this.state === PENDING) {
                if(value instanceof Promise) {
                    value.then(value => {
                        resolve(value)
                    }, err => {
                        reject(err)
                    })
                } else {
                    this.state = FULLFILLED
                    this.value = value
                    this.onResolvedCallbacks.forEach(fn => fn())
                }
                
            }
        }
        let reject = (reason) => {
            if(this.state === PENDING) {
                this.state = REJECTED
                this.reason = reason
                this.onRejectedCallbacks.forEach(fn => fn())
            }
        }

        try {
            executor(resolve, reject)
        } catch(err) {
            reject(err)
        }
        
    }
    then(onFullfilled, onRejected) {
        onFullfilled = typeof onFullfilled === 'function' ? onFullfilled : val => val
        onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err }

        let promise2 = new Promise((resolve, reject) => {
            if(this.state === FULLFILLED) {
                setTimeout(() => {
                    let x = onFullfilled(this.value)
                    resolvePromise(x, promise2, resolve, reject)  
                }, 0)
            }
            if(this.state === REJECTED) {
                setTimeout(() => {
                    let x = onRejected(this.reason)
                    resolvePromise(x, promise2, resolve, reject)
                }, 0)
            }
    
            if(this.state === PENDING) {
                this.onResolvedCallbacks.push(() => {
                    setTimeout(() => {
                        let x = onFullfilled(this.value)
                        resolvePromise(x, promise2, resolve, reject)  
                    }, 0)
                })
                this.onRejectedCallbacks.push(() => {
                    setTimeout(() => {
                        let x = onRejected(this.reason)
                        resolvePromise(x, promise2, resolve, reject)
                    }, 0)
                })
            }
        })
        return promise2
    }
}

// resolve一个Promise的时候，应该将这个Promise resolve的值传递给then
// const p = new Promise((resolve, reject) => {
//     resolve(new Promise((resolve, reject) => {
//         resolve(200)
//     }))
// })
// p.then(value => {
//     console.log(111)
// })

// const promise2 = p.then((value) => {
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             resolve([value, 'hello'])
//         }, 3000)
//     })
// })
// promise2.then(value => {
//     console.log(value)
// })

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
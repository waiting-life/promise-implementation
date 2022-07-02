class Promise {
    constructor(executor) {
        if (typeof executor !== 'function') {
            throw new TypeError("Promise resolver undefined is not a function")
        }
        this.status = 'pending'
        this.value = undefined
        this.onResolvedCallback = []
        this.onRejectedCallback = []

        const resolve = (value) => {
            if (this.status === 'pending') {
                if (value instanceof Promise) {
                    value.then((data) => {
                        resolve(data)
                    }, (reason) => {
                        reject(reason)
                    })
                } else {
                    this.status = 'fulfilled'
                    this.value = value
                    this.onResolvedCallback.forEach(callback => callback())
                }
            }
        }

        const reject = (reason) => {
            if (this.status === 'pending') {
                this.status = 'rejected'
                this.value = reason
                this.onRejectedCallback.forEach(callback => callback())
            }
        }
        try {
            executor(resolve, reject)
        } catch (error) {
            reject(error)
        }
    }

    then(onResolve, onReject) {
        return new Promise((resolve, reject) => {
            if (this.status === 'fulfilled') {
                setTimeout(() => {
                    if (typeof onResolve !== 'function') {
                        resolve(this.value)
                    } else {
                        try {
                            resolve(onResolve(this.value))
                        } catch (error) {
                            reject(error)
                        }
                            
                    }
                })
            }
            else if (this.status === 'rejected') {
                setTimeout(() => {
                    if (typeof onReject !== 'function') {
                        reject(this.value)
                    } else {
                        try {
                            resolve(onReject(this.value))
                        } catch (error) {
                            reject(error)
                        }
                        
                    }
                })
            }
            else if (this.status === 'pending') {
                this.onResolvedCallback.push(() => {
                    setTimeout(() => {
                        if (typeof onResolve !== 'function') {
                            resolve(this.value)
                        } else {
                            try {
                                resolve(onResolve(this.value))
                            } catch (error) {
                                reject(error)
                            }
                        }
                    })
                })

                this.onRejectedCallback.push(() => {
                    setTimeout(() => {
                        if (typeof onReject !== 'function') {
                            reject(this.value)
                        } else {
                            try {
                                resolve(onReject(this.value))
                            } catch (error) {
                                reject(error)
                            }
                        }
                    })
                })
            }
        })
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
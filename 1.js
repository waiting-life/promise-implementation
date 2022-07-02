const PENDING = 'pending'
const FULLFILLED = 'fullfilled'
const REJECTED = 'rejected'

//  new Promise((resolve, reject) => {
//     resolve(22)
//  })
class Promise {
    // 初始化状态
    constructor(executor) {
        this.state = PENDING
        this.value = undefined
        this.reason = undefined

        // 解决异步
        this.onResolvedCallbacks = []
        this.onRejectedCallbacks = []

        let resolve = (value) => {
            if(this.state === PENDING) {
                this.state = FULLFILLED
                this.value = value
                this.onResolvedCallbacks.forEach(fn => fn())
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
            executor(resolve, reject)  // 执行传进Promise的函数
        } catch(err) {
            reject(err)  // js出现错误，通过reject捕获错误
        }
        
    }
    then(onFullfilled, onRejected) {
        if(this.state === FULLFILLED) {
            onFullfilled(this.value)
        }
        if(this.state === REJECTED) {
            onRejected(this.reason)
        }

        if(this.state === PENDING) {
            this.onResolvedCallbacks.push(() => {
                onFullfilled(this.value)
            })
            this.onRejectedCallbacks.push(() => {
                onRejected(this.reason)
            })
        }
    }
}

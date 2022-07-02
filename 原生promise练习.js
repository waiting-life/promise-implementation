// promise2的then里面return promise2就会发生报错
const p2 = new Promise((resolve, reject) => {
    resolve(222)
})

let promise2 = p2.then(() => {
    return promise2
})

promise2.then(null, (err) => {
    console.log(err)
})

// 直接resolve一个Promise的时候
const p = new Promise((resolve, reject) => {
    resolve(new Promise((resolve, reject) => {
        resolve(200)
    }))
})
const promise = p.then((value) => {
    console.log(value)
})

// then里面的返回的Promise对象resolve了一个Promise的时候
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
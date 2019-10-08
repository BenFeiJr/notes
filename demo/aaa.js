const aa = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve(1);
    }, 1000)
});

aa.then().then((res) => {
    console.log(res)
})

console.log('**********************标准********************************')
const express = require("express")

const app = express();

const adminRoute = express()

const middleware = (req, res, next)=>{
    console.log(`${new Date(Date.now()).toLocaleString()}  - ${req.protocol} - ${req.method} - ${req.ip} - ${req.originalUrl}`);
    
    throw new Error('this is not an error')
}


adminRoute.use(middleware)

adminRoute.get('/dashboard', (req, res)=>{
    console.log('Hlloe there twinker bell');
    res.send('from admin')
})

const errorMiddleware =(err, req, res, next)=>{
    console.log(err.message);
    res.status(500).send('there was something wron in')
}

adminRoute.use(errorMiddleware)

app.use('/admin', adminRoute)

// app.use(middleware)


app.get("/mee",(req, res)=>{
    res.send("from middlewae")
    
})





app.listen(3000, ()=>{
    console.log(`app is running on 3000`);
})
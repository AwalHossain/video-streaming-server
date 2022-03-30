const express = require("express")
const publicRouter = require('./publicRouter')
const app = express();
const fs = require('fs')



// app.use('/admin', adminRoute)


app.get("/",(req, res, next)=>{
    fs.readFile("/file-does-not-exist", (err, data)=>{
        if(err){
            next(err);
        }else{
            res.send(data)
        }
    })
})


app.use((req, res, next)=>{
    console.log("i am not called");
})
app.use((err,req, res, next)=>{

    if(err){
        console.log("i am  called");
        res.status(500).send( err.message)
    }

})

app



app.listen(3000, ()=>{
    console.log(`app is running on 3000`);
})
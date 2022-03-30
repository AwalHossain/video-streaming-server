const express = require("express")
const publicRouter = require('./publicRouter')
const app = express();




// app.use('/admin', adminRoute)


app.get("/",(req, res)=>{
    for(let i = 0; i<=10; i++){
        if(i===5){
            next('there wan an error')
        }else{
            res.write('a');
        }
    }

    res.end()
})

app.use((req, res, next)=>{
    next('Requseted url not found')
})

app.use((err, req, res,next)=>{

    if(res.headersSent){
        next('There was problem header already sent')
    }else{
        if(err.message){
            res.status(500).send(err.message)
        }else{
            res.status(500).send('there was an error')
    
        }
    }
})



app.listen(3000, ()=>{
    console.log(`app is running on 3000`);
})
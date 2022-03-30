const express = require("express")
const publicRouter = require('./publicRouter')
const app = express();




// app.use('/admin', adminRoute)




app.use('/public', publicRouter)

// app.use(middleware)


app.get("/mee",(req, res)=>{
    res.send("from middlewae")
    
})





app.listen(3000, ()=>{
    console.log(`app is running on 3000`);
})
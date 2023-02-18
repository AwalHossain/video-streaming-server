import express from 'express';


const app = express();

// const http = require('http');

app.use(express.json())

const port = 4000;


app.get("/", (req:Request, res:any)=>{
    res.send("heelo")
})

app.listen(port, function () {
    console.log("listening on localhost:" + port);
})


// export default app;
import app from "./app";


const port = 4000;


app.get("/", (req:Request, res:any)=>{
    res.send("heelo")
})

app.listen(port, function () {
    console.log("listening on localhost:" + port);
})
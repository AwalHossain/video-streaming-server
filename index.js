const express = require("express")

const app = express();
const adminRoute = express.Router();
const cookieParser = require('cookie-parser')


app.use(express.json())
app.use(cookieParser())

app.set('view engine', 'ejs')



app.use(express.static(`${__dirname}/public/`,{
    index: 'homt.html'
}))




app.get("/about/mission/:id",(req, res)=>{

res.format({
    'text/plain':()=>{
        res.send("from plain field")
    },
    'text/html':()=>{
        res.send("from html view")
    },
    'application/json':()=>{
        res.send({message:"from json"})
    },
    default:()=>{
        res.status(406).send('not acceptable')
    }
})

})

app.post("/mee",(req, res)=>{
    console.log(req.cookies);
    console.log(req.route);
    console.log(req.accepts());
    // console.log(req.body);

   res.send('from post')
})





app.listen(3000, ()=>{
    console.log(`app is running on 3000`);
})
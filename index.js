const express = require("express")

const app = express();
const adminRoute = express.Router();


app.set('view engine', 'ejs')

app.locals.title="KOLO"

app.param('id', (req, res, next, id)=>{
    const user = {
        id:'5',
        name:'Bangladesh'
    }

    req.userDetails = user;
    next();
})

app.use(express.static(`${__dirname}/public/`,{
    index: 'homt.html'
}))


app.use('/admin', adminRoute)

adminRoute.get("/dasboard", (req, res)=>{
    console.log(req.url);
    console.log(req.baseUrl);
    console.log(req.originalUrl);
    res.send("From admin route")
})


app.get("/about/mission/:id",(req, res)=>{
    console.log(req.url);
    console.log(req.params);
    console.log(req.hostname);
    console.log(req.protocol);
    console.log(req.originalUrl);
   res.send('kalm')
})



app.listen(3000, ()=>{
    console.log(`app is running on 3000`);
})
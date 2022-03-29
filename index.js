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

    console.log(res.headersSent);
   res.render('pages/about',{
       name:"Bangladesh"
   })
   console.log(res.headersSent);

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
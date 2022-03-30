const publicRouter = require("express").Router();

const myLog =(req, res, next)=>{
    console.log("Click baji");
    next();
}

publicRouter.param((param, option)=>(req,res, next, val)=>{
    console.log(val, option);
    if(val === option){
        next()
    }else{
        res.sendStatus(403)
    }
})

publicRouter.param('user', "12")

publicRouter.get("/:user",(req, res)=>{
    res.send(`From public publicRouter ${req.user}`)
})
publicRouter.get("/about",(req, res)=>{
    res.send('From public publicRouter about section')
})

module.exports = publicRouter;
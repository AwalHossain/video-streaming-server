const router = require("express").Router();

const myLog =(req, res, next)=>{
    console.log("Click baji");
    next();
}

router.all("*", myLog)

router.get("/:user",(req, res)=>{
    res.send('From public router')
})
router.get("/about",(req, res)=>{
    res.send('From public router about section')
})

module.exports = router;
const router = require("express").Router();

const myLog =(req, res, next)=>{
    console.log("Click baji");
    next();
}

router.param('user', (req, res, next, gd)=>{
    req.user = gd ===  '1' ? 'Admin' : 'Anonymous'
    next();
})

router.get("/:user",(req, res)=>{
    res.send(`From public router ${req.user}`)
})
router.get("/about",(req, res)=>{
    res.send('From public router about section')
})

module.exports = router;
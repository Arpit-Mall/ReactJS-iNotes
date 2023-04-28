const express = require("express");
const UserScma = require("../models/UserSchema");
const router = express.Router();

router.get('/',(req,res)=>{
    console.log(req.body);
    const user=UserScma(req.body)
    user.save();
    res.send(req.body);
})

module.exports = router;
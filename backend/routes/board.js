const express = require('express');
const router = express.Router();
const boardModel = require('../db/models/board')

module.exports = router;

router.post("/:boardName/create",(req,res,next)=>{
    console.log(req.body)
    boardModel.create(req.body).then((data)=>{
        res.send("ok")
    })
});

router.get("/:boardName/",(req,res,next)=>{
    boardModel.find().then((data)=>{
        res.send(data)
    })
});

router.get("/:boardName/:postNum",(req,res,next)=>{
    boardModel.findOne({"postNum":req.params.postNum}).then((data)=>{
        res.send(data)
    })
})

router.post("/:boardName/delete",(req,res,next)=>{
    boardModel.deleteOne(req.body).then((data)=>{
        res.send("ok")
    })
})

router.post("/:boardName/:postNum/update",(req,res,next)=>{
    boardModel.updateOne({"postNum":req.params.postNum},{"title":req.body.title, "contents":req.body.contents}).then((data)=>{
        res.send("ok");
    })
})
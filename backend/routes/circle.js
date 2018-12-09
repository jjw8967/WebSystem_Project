const express = require('express');
const router = express.Router();
const userModel = require('../db/models/user')
const circleModel = require('../db/models/circle')
const scheduleModel = require('../db/models/schedule')
const boardModel = require('../db/models/board')
const groupModel = require('../db/models/group')
const activeModel = require('../db/models/active')

let circleName
let postType
let model

router.use("/:circleName/board/:postType",(req,res,next)=>{
    circleName=req.params.circleName
    name = req.params.name
    postType = req.params.postType
    next();
});

router.get("/:circleName/board/:postType",(req,res,next)=>{
    boardModel.find({"circleName":circleName,"postType":postType}).then((data)=>{
        console.log(data)
        res.send(data)
    })
});

router.post("/:circleName/board/:postType/create",(req,res,next)=>{
    let value=req.body;
    value["circleName"]=req.params.circleName
    value["postType"]=postType
    boardModel.create(value).then((data)=>{
        res.send("ok")
    })
});

router.get("/:circleName/board/:postType/:postNum",(req,res,next)=>{
    boardModel.findOne({"postNum":req.params.postNum}).then((data)=>{
        res.send(data)
    })
})

router.post("/:circleName/board/:postType/:postNum/delete",(req,res,next)=>{
    boardModel.deleteOne({"postNum":req.params.postNum}).then((data)=>{
        res.send("ok")
    })
})

router.post("/:circleName/board/:postType/:postNum/update",(req,res,next)=>{
    boardModel.updateOne({"postNum":req.params.postNum},{"title":req.body.title,"contents":req.body.contents}).then((data)=>{
        res.send("ok");
    })
})

router.get('/send', (req, res) => {
    circleModel.find().populate('president').populate('members.user').exec((err, data) => {
        res.send(data)
})
});

router.post('/send/search', (req, res) => {

    if(req.body.search_select === "name") {
        circleModel.find({"name": req.body.search_value}).populate('president').exec((err, data) => {
            res.send(data)
        })
    }
    else if(req.body.search_select === "professor") {
        circleModel.find({"professor": req.body.search_value}).populate('president').exec((err, data) => {
            res.send(data)
        })
    }
});

router.post('/register', (req, res) => {
   console.log(req.body)
   circleModel.create(req.body).then((circle) => {
       res.send(circle)
   })
});

router.get('/find/:name', (req, res) => {
    var name = req.params.name

   circleModel.findOne({name}).populate('president').populate('members.user').exec().then((circle) => {
       res.send(circle)
   })
});
/*
router.get('/send/:name', (req, res) => {
    console.log(req.params.name)
    circlename = req.params.name
    circleModel.find().populate('president').exec((err, data) => {
        console.log(data)
    })
    circleModel.findOne({name: circlename}).populate('president').exec((err, data) => {
        console.log("회장이름 갑니다."+ data.president.name)
        res.send(data.president.name)
    })
})
*/

// Schedule Part
router.get('/:circleName/schedule',(req,res)=>{
    scheduleModel.find({'circle':req.params.circleName}).then((data)=>{
        res.send(data)
    })
})

router.post('/:circleName/schedule/create',(req,res)=>{
    scheduleModel.create(req.body).then((data)=>{
        res.send("ok")
    })
})

router.post('/:circleName/schedule/delete',(req,res)=>{
    scheduleModel.deleteOne(req.body).then((data)=>{
        res.send("ok")
    })
})

router.post('/:circleName/schedule/update',(req,res)=>{
    scheduleModel.update({"scheduleId":req.body.scheduleId},req.body).then((data)=>{
        res.send("ok")
    })
})

//Group part
router.post('/:circleName/group/create',(req,res)=>{
    let group = req.body
    userModel.findOne({"ID":group.teacher}).then((user)=>{
        group["teacher"]={"_id":user._id}
        console.log(group)
        groupModel.create(group).then((data)=>{
            res.send("ok")
        })
    })
})

router.get('/:circleName/group',(req,res)=>{
    groupModel.find({'circleName':req.params.circleName}).populate("teacher").then((data)=>{
        res.send(data)
    })
})

router.get('/:circleName/group/:groupId',(req,res)=>{
    groupModel.findOne({"groupId":req.params.groupId}).populate("teacher").then((data)=>{
        res.send(data);
    })
})

router.post('/:circleName/group/update/:groupId',(req,res)=>{
    let group = req.body
    userModel.findOne({"ID":group.teacher}).then((user)=>{
        group["teacher"]={"_id":user._id}
        groupModel.updateOne({"groupId":req.params.groupId},group).then((data)=>{
            res.send(data)
        })
    })
})

router.post('/:circleName/group/delete/:groupId',(req,res)=>{
    groupModel.deleteOne({"groupId":req.params.groupId}).then((data)=>{
        res.send(data)
    })
})

//Active

router.post('/:circleName/active/create',(req,res)=>{
    console.log(req.body)
    activeModel.create(req.body).then((data)=>{
        res.send("ok")
    })
})

router.get('/:circleName/active',(req,res)=>{
    activeModel.find().then((data)=>{
        res.send(data)
    })
})

router.post('/:name/signupCircle', (req, res) => {
    var name =  req.params.name // 동아리이름 
    //console.log(circle.members.length)                            // req.body user 정보
    circleModel.findOne({name}).populate('members.user').exec().then((circle) => {
        console.log(circle.members.length)
        for(var i = 0; i < circle.members.length; i++){
            if(circle.members[i].user.name === req.body.name)
                throw new Error();
            console.log(circle.members[i].user.name)
        }

        return circle
    }).then((circle) => {
        circle.members.push({user: req.body})
        circle.save()
        console.log(circle)
        res.send(circle)
    }).catch((err) => {
        res.send("err")
        console.log("err")
    })
})

router.post('/:name/accept', (req, res) => { //동아리 승인
    var name = req.params.name // 동아리 이름
    var user                 // req.body user 정보
    var _id
    circleModel.findOne({name}).populate('members.user').exec().then((circle) => {
        for(var i = 0; i < circle.members.length; i++){
            console.log(circle.members[i].user.name)
            console.log(req.body)
            if(circle.members[i].user.name === req.body.name)
                circle.members[i].circleAuth = true
        }
          
        return circle
    }).then((circle) => {
        circle.save()
        console.log(circle)
        res.end()
    })
});

router.post('/:name/reject', (req, res) => {
    var name = req.params.name // 동아리 이름
    var user                 // req.body user 정보
    var id
    circleModel.findOne({name}).populate('members.user').exec().then((circle) => {
        for(var i = 0; i < circle.members.length; i++){
            if(circle.members[i].user.name === req.body.name)
                id = circle.members[i]._id
        }

        return circle
    }).then((circle) => {
        circle.members.pull({_id: id})
        circle.save()
        console.log("동아리DB에서 삭제 완료")        
    }).then(() => {
        res.end()
    })
})
module.exports = router;
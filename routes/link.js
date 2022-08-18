var express = require("express");
const session = require("express-session");
var checks = require("./db");
var router = express.Router();

/* GET users listing. */
router.get("/:user/new", function (req, res, next) {
    if (req.session.auth){
        res.render('link',{title: "New Link", auth: req.session.auth});
    }
    else{
        console.log("a")
        req.session.regerrorsextra = { msg: "Please login" };
        res.redirect("../../login");
    }
});


router.get("/:user/edit/:id", function (req, res, next) {
    if (req.session.auth){
        edit_callback(req.params.id,req,res);
    }
    else{
        req.session.regerrorsextra = { msg: "Please login" };
        res.redirect("../../../login");
    }
});

router.post("/:user/submit",function (req, res, next) {
    if (req.session.auth){
        submit_new_callback(req,res);
    }
    else{
        req.session.regerrorsextra = { msg: "Please login" };
        res.redirect("../../login");
    }
});

router.post("/:user/submit/:id",function (req, res, next) {
    if (req.session.auth){
        submit_callback(req,res);
    }
    else{
        req.session.regerrorsextra = { msg: "Please login" };
        res.redirect("../../../login");
    }
});

router.get("/:user/delete/:id",function (req, res, next) {
    if (req.session.auth){
        delete_callback(req,res);
    }
    else{
        req.session.regerrorsextra = { msg: "Please login" };
        res.redirect("../../../login");
    }
});


async function edit_callback(id,req,res){
    let ided_l = await checks.id_link(id);
    if (ided_l[0] === undefined){
        res.render("error",{title: "Error", auth: req.session.auth,});
    }
    else{
        if (req.session.auth === ided_l[0].writer){
            res.render("link",{title: "Link", auth: req.session.auth,link : ided_l[0]})
        }
        else{
            console.log("abc")
            res.render("error",{title: "Error", auth: req.session.auth,});
        }
    }
}


async function submit_callback(req,res){
    let edit_l = await checks.edit_link(req);
    res.redirect(`../../../users/${req.session.auth}`)
    }

async function submit_new_callback(req,res){
    let made_l = await checks.add_link(req,res);
    if (made_l){
        res.redirect(`../../../users/${req.session.auth}`)
        
    }
    else{
        res.render("error",{title: "Error", auth: req.session.auth,});
    }
}
async function delete_callback(req,res){
    let ided_l = await checks.id_link(req.params.id);
    if (ided_l[0] === undefined){
        res.render("error",{title: "Error", auth: req.session.auth,});
    }
    else{
        if (req.session.auth === ided_l[0].writer){
            let delete_l = checks.delete_link(req);
            res.redirect(`../../users/${req.session.auth}`)
        }
        else{
            console.log("abc")
            res.render("error",{title: "Error", auth: req.session.auth,});
        }
    }
}



module.exports = router;


  

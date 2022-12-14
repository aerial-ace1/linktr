var express = require("express");
//const session = require("express-session");
const { get_details, get_link } = require("./db");
var router = express.Router();

var configError = "There seems to be an issue. Please Try again."

/* GET users listing. */

router.get("/:id", function (req, res, next) {
  console.log("a");
  findUser(req.params.id, res, req);
});


async function findUser(id, res, req) {
  let result = await get_details(id);
  let link = await get_link(id);
  console.log(link[0])
  if (result[0] === undefined) {
    res.render("error", { title: "Error", auth: req.session.auth });
    return 0;
  }
  
  let details = {
    uid: result[0].uid,
    name: result[0].name,
    descrip: result[0].descrip,
    sorc: result[0].sorc,
    user : await verify(req,id),
    bc: result[0].bc,
    bgc: result[0].bgc,
    text: result[0].text,
  };
  console.log(details)
  console.log(details.user)
  res.render("profile", {
    title: details.name,
    auth: req.session.auth,
    details: details,
    session: req.session,
    link : link,
  });
}

async function config_callback(req,res){
  try {
    await addconfig(req)
  } catch (error) {
    req.session.configerrors =  (configError); 
    res.redirect(`/users/${req.session.auth}/config`)
  }
}

async function verify(req, id) {
  console.log(req.session.auth,"sadnked",id)
  return new Promise((resolve) => {
    req.session.auth === id ? resolve(true) : resolve(false);
  });
}


module.exports = router;
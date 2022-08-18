var express = require("express");
var router = express.Router();
var checks = require("./db");
var ma = require("./mail");

router.get("/:user", function (req, res, next) {
  if (req.session.auth) {
    find_callback(req, res);
  } else {
    res.redirect("../../login");
  }
});

router.post("/:user/check", function (req, res, next) {
  if (req.session.auth)
    if (req.session.auth === req.params.user) {
      res.json([{ friend: "none" }]);
    } else {
      check_callback(req, res);
    }
  else {
    res.json([{ friend: "none" }]);
  }
});

router.get("/:user/send", function (req, res, next) {
  if (req.session.auth)
    if (req.session.auth === req.params.user) {
      res.redirect(`../../../users/${req.params.user}`);
    } else {
      send_callback(req, res);
    }
  else {
    res.redirect("../../login");
  }
});

router.get("/:user/accept", function (req, res, next) {
  if (req.session.auth)
    if (req.session.auth === req.params.user) {
      res.redirect(`../../../users/${req.params.user}`);
    } else {
      accept_callback(req, res);
    }
  else {
    res.redirect("../../login");
  }
});

router.get("/:user/remove", function (req, res, next) {
  if (req.session.auth)
    if (req.session.auth === req.params.user) {
      res.redirect(`../../../users/${req.params.user}`);
    } else {
      remove_callback(req, res);
    }
  else {
    res.redirect("../../login");
  }
});

router.post("/:user/connections", function (req, res, next) {
  if (req.session.auth)
    if (req.session.auth === req.params.user) {
      res.json([{ level: 0 }]);
    } else {
      connections_callback(req, res);
    }
  else {
    res.redirect("../../../login");
  }
});

async function find_callback(req, res) {
  let friends = await checks.find_friend(req.session.auth);
  let accept = await checks.find_request(req.session.auth)
  friends.reverse();
  res.render("friends", {
    title: "Friends",
    auth: req.session.auth,
    friends: friends,
    accept : accept
  });
}

async function check_callback(req, res) {
  let status = await checks.check_friend(req);
  if (status === 2) {
    res.json([{ friend: "notsent" }]);
  } else {
    if (status === 1 || status === 4) {
      res.json([{ friend: "accepted" }]);
    } else {
      res.json([{ friend: status }]);
    }
  }
}

async function send_callback(req, res) {
  let sent = await checks.add_friend(req);
  let username = await checks.get_details(req.session.auth)
  //ma.send_request(req.params.id,username[0].name)
  res.redirect(`../../../users/${req.params.user}`);
}

async function accept_callback(req, res) {
  let sent = await checks.accept_friend(req);
  let username = await checks.get_details(req.session.auth)
  //ma.accepted_request(req.params.id,username[0].name)
  res.redirect(`../../../users/${req.params.user}`);
}

async function remove_callback(req, res) {
  let sent = await checks.remove_friend(req);
  res.redirect(`../../../users/${req.params.user}`);
}

async function connections_callback(req, res) {
  let f1 = await checks.find_friend(req.session.auth);
  let f2 = [];
  let f3 = [];
  for (i = 0; i < f1.length; i++) {
    if (f1[i] === req.params.user) {
      res.json([{ level: 1 }]);
      return 0;
    } else {
      let f4 = await checks.find_friend(f1[i]);
      f2 = [...f2, ...f4];
    }
  }
  console.log("a: ",f2)
  for (i = 0; i < f2.length; i++) {
    if (f2[i] === req.params.user) {
      res.json([{ level: 2 }]);
      return 0;
    } else {
      let f5 = await checks.find_friend(f2[i]);
      f3 = [...f3, ...f5];
    }
  }
  for (i = 0; i < f3.length; i++) {
    if (f3[i] === req.params.user) {
      res.json([{ level: 3 }]);
      return 0;
    }
  }
  res.json([{ level: 0 }]);
}

module.exports = router;

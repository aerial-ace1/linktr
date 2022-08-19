var mysql = require("mysql");
require("dotenv").config();
var crypto = require('crypto');

var con = mysql.createConnection({
  host: process.env.MY_SQL_HOST,
  user: process.env.MY_SQL_USER,
  password: process.env.MY_SQL_PASS,
});

function startup() {
  console.log("Connected!");
  create_check_database();
}

function create_check_database() {
  con.query("CREATE DATABASE IF NOT EXISTS linktr", function (err, result) {
    if (err) throw err;
    console.log("Database created and connected");
    con.query("USE linktr", function (err, result) {
      if (err) throw err;
      create_check_tables();
    });
  });
}

function create_check_tables() {
  let t1 =
    "CREATE TABLE IF NOT EXISTS users(uid varchar(255), name  varchar(255), descrip LONGBLOB, img LONGBLOB, pwd varchar(255),text char(7), bgc char(7), bc char(7), hash LONGBLOB, salt LONGBLOB,  PRIMARY KEY (name))ENGINE=INNODB;";
  con.query(t1, function (err, result) {
    if (err) throw err;
    let t2 =
      "CREATE TABLE IF NOT EXISTS links(writer varchar(255) NOT NULL, Heading LONGBLOB, sorc LONGBLOB, id int AUTO_INCREMENT NOT NULL PRIMARY KEY, FOREIGN KEY (writer) REFERENCES users(name) ON DELETE CASCADE)ENGINE=INNODB;";
    con.query(t2, function (err, result) {
      if (err) throw err;
    });
    console.log("Tables created and connected");
  });
}

function check_username(uid, pwd,salting) {
  //internally chk passwd
  return new Promise((resolve, reject) => {
    let has = crypto.pbkdf2Sync(pwd, salting, 
      1000, 64, `sha512`).toString(`hex`);
    con.query(
      "SELECT * FROM USERS WHERE uid = ? AND hash = ?",
      [uid, has],
      function (err, result) {
        if (err) {
          reject(false);
        } else {
          console.log(result)
          resolve(result);
        }
      }
    );
  });
}

function get_details(uid) {
  return new Promise((resolve, reject) => {
    con.query("SELECT * FROM USERS WHERE name = ?", uid, function (err, result) {
      if (err) {
        console.log(err)
        reject(false);
      } else {
        resolve(result);
      }
    });
  });
}

function et_details(uid) {
  return new Promise((resolve, reject) => {
    con.query("SELECT * FROM USERS WHERE uid = ?", uid, function (err, result) {
      if (err) {
        console.log(err)
        reject(false);
      } else {
        resolve(result);
      }
    });
  });
}

function get_link(uid) {
  return new Promise((resolve, reject) => {
    con.query(
      "SELECT * FROM links WHERE writer = ? ORDER BY ID desc",
      uid,
      function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
}
function et_link(req,res,next) {
  console.log("a")
  
    con.query(
      "SELECT * FROM links ORDER BY ID desc",
      function (err, result) {
        if (err) {
          throw err;
        } else {
          console.log(result)
          next();
        }
      }
    );
}

function adduser(a) {
  return new Promise((resolve, reject) => {
    let sal = crypto.randomBytes(16).toString('hex');
    let has = crypto.pbkdf2Sync(a.password, sal, 
      1000, 64, `sha512`).toString(`hex`);
    con.query(
      "INSERT INTO USERS (uid,name,descrip,img,salt,hash) VALUES (?,?,?,?,?,?)",
      [a.username, a.name.toUpperCase(), a.descrip, a.sorc,sal, has ],
      function (err, result) {
        if (err) {
          console.log(err)
          reject(false);
        } else {
          resolve(true);
        }
      }
    );
  });
}

function id_link(id) {
  return new Promise((resolve, reject) => {
    con.query("SELECT * FROM links WHERE id = ?", id, function (err, result) {
      if (err) {
        console.log(err);
        reject(false);
      } else {
        resolve(result);
      }
    });
  });
}

function edit_link(a) {
  return new Promise((resolve, reject) => {
    con.query(
      "UPDATE links set heading = ?,sorc = ? where id = ?",
      [a.body.heading, a.body.sorc, a.params.id],
      function (err, result) {
        if (err) {
          console.log(err)
          reject(false);
        } else {
          resolve(true);
        }
      }
    );
  });
}

function add_link(a) {
  return new Promise((resolve, reject) => {
    con.query(
      "INSERT INTO links(writer,heading,sorc) VALUES (?,?,?)",
      [a.session.auth, a.body.heading, a.body.sorc],
      function (err, result) {
        if (err) {
          reject(false);
        } else {
          resolve(true);
        }
      }
    );
  });
}

function delete_link(a) {
  return new Promise((resolve, reject) => {
    con.query(
      "DELETE FROM links WHERE id=?",
      a.params.id,
      function (err, result) {
        if (err) {
          reject(false);
        } else {
          resolve(true);
        }
      }
    );
  });
}

function addconfig(a) {
  return new Promise((resolve, reject) => {
    con.query(
      "UPDATE users set text = ?,bgc = ?, bc = ? where name = ?",
      [a.body.textco, a.body.bgco,a.body.bgco, a.params.id],
      function (err, result) {
        if (err) {
          console.log(err)
          reject(false);
        } else {
          resolve(true);
        }
      }
    );
  });
}

module.exports = {
  et_details,
  et_link,
  startup,
  check_username,
  get_details,
  adduser,
  id_link,
  get_link,
  add_link,
  edit_link,
  delete_link,
  addconfig,
};

const express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var fs = require("fs");
var crypto = require("crypto");

// //cipher
// var mykey = crypto.createCipheriv(
//   "aes-128-cbc",
//   Buffer.alloc(16),
//   Buffer.alloc(16)
// );

// var ciphertext = mykey.update("6031811421", "utf8", "base64");
// ciphertext += mykey.final("base64"); //will allow key to display??
// console.log(ciphertext);

// //decipher
// var mykey = crypto.createDecipheriv(
//   "aes-128-cbc",
//   Buffer.alloc(16),
//   Buffer.alloc(16)
// );

// var plaintext = mykey.update(ciphertext, "base64", "utf8");
// plaintext += mykey.final("utf8"); //will allow key to display??
// console.log(plaintext);

let issueTemp;
let password = "a";
let userIpId = [];
let roomNo = 0;
let homeRoomCount = [];
//allow files to be available on server eg. app.js
app.use(express.static("."));
app.set("view engine", "ejs");

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/home.html");
});

//random pathname to avoid being accessed from outside
app.get("/addIssueXXX", function(req, res) {
  res.sendFile(__dirname + "/addIssue.html");
});

app.get("/editIssue", function(req, res) {
  res.sendFile(__dirname + "/editIssue.html");
});

app.get("/display/:id", function(req, res) {
  // //somehow also included display.js as req.params.id
  // console.log(req.params.id); // OK
  // console.log(req.ip);
  // console.log(req.connection.remoteAddress);
  // userIpId.push({
  //   ip: req.ip || req.connection.remoteAddress,
  //   id: req.params.id
  // });
  // console.log(userIpId);
  // res.sendFile(__dirname + "/display.html");
  var mykey = crypto.createDecipheriv(
    "aes-128-cbc",
    Buffer.alloc(16),
    Buffer.alloc(16)
  );

  let stuId = mykey.update(req.params.id, "base64", "utf8");
  stuId = studId + mykey.final("utf8"); //will allow key to display??
  console.log(stuId);

  let filteredArr;
  fs.readFile("issues.json", "utf-8", (err, data) => {
    console.log("read file"); // OK
    if (err) throw err;
    obj = JSON.parse(data);
    filteredArr = obj.filter(ele => {
      if (ele.studentId && ele.studentId == stuId) {
        return true;
      }
    });
    res.render("display", { filteredArr: filteredArr, id: [123] });
  });
  //just put html in here
  //or use EJS with res.render()
  //or send html file which sends to specific ip
});

var home = io.of("/home");
home.on("connection", function(socket) {
  console.log("home page opened");
  socket.on("checkpass", pass => {
    if (pass == password) {
      socket.emit("passresult", true);
    } else {
      socket.emit("passresult", false);
    }
  });
  // socket.on("homeOpened", function(tabId) {
  //   if (tabId) {
  //     //if tabId already exists
  //     socket.join("room" + tabId);
  //     homeRoomCount[tabId]++;
  //     socket.emit("setup", {
  //       homeCount: homeRoomCount[tabId],
  //       roomNo: null
  //     });
  //   } else {
  //     //if tabId is null, it is falsy
  //     //join new room
  //     socket.join("room" + roomNo);
  //     homeRoomCount.push(0);
  //     homeRoomCount[roomNo]++;
  //     console.log(homeRoomCount[roomNo]);
  //     socket.emit("setup", { homeCount: homeRoomCount[roomNo], roomNo });
  //     console.log(roomNo);
  //     roomNo++;
  //   }
  // });

  socket.on("disconnect", function() {
    console.log("home page closed");
  });

  socket.on("retr rec", function() {
    console.log("req rcvd");
    var readStream = fs.createReadStream("issues.json");
    readStream.on("data", function(data) {
      console.log("readStream is called only once no matter how big data is??");
      var chunk = data.toString();
      // console.log(chunk); //Works
      socket.emit("send rec", chunk);
      //crash unexpected end of JSON inputs
      //ok if small amount of data sent
      console.log("sent rec");
    });
    // fs.readFile("issues.json", "utf-8", (err, data) => {
    //   if (err) throw err;
    //   //   console.log(data);
    //   obj = JSON.parse(data);
    //   console.log(obj);
    //   socket.emit("send rec", obj);
    //   console.log("sent rec");
    // });
  });

  socket.on("open issue", function(issue) {
    issueTemp = issue;
    console.log(issueTemp);
  });
});

var addIssue = io.of("/addIssue");
addIssue.on("connection", function(socket) {
  console.log("add issue page opened");

  socket.on("disconnect", function() {
    console.log("add issue page closed");
  });

  socket.on("getCipher", stuId => {
    var mykey = crypto.createCipheriv(
      "aes-128-cbc",
      Buffer.alloc(16),
      Buffer.alloc(16)
    );

    var ciphertext = mykey.update(stuId, "utf8", "base64");
    ciphertext += mykey.final("base64"); //will allow key to display??
    socket.emit("cipher", ciphertext);
  });

  socket.on("save file", function(issue) {
    // var readStream = fs.createReadStream("issues.json");
    // let chunk = "";
    // readStream.on("data", function(data) {
    //   chunk = chunk + data.toString();
    //   chunk = JSON.parse(chunk);
    //   chunk.push(issue);
    //   console.log(chunk);
    //   fs.createWriteStream("issues.json").write(JSON.stringify(chunk));
    // });
    fs.readFile("issues.json", "utf-8", (err, data) => {
      if (err) throw err;
      //   console.log(data);
      console.log("parsing");
      obj = JSON.parse(data);
      obj.push(issue);
      fs.writeFile("issues.json", JSON.stringify(obj), function(err) {
        if (err) throw err;
        console.log("Saved!");
      });
    });
  });
});

var editIssue = io.of("/editIssue");
editIssue.on("connection", function(socket) {
  //connect to correct room
  socket.on("editor opened", function() {
    console.log("edit issue page opened");
    if (issueTemp) {
      socket.join("room" + issueTemp.id);
      socket.to("room" + issueTemp.id).emit("openIssueHtml", issueTemp);
      console.log("room", issueTemp.id);
      socket.emit("openIssueHtml", issueTemp);
      issueTemp = null;
      //so issueTemp cannot be opened in another tab if not called from origin
    } else {
      socket.join("roomEx");
    }
  });

  socket.on("getCipher", stuId => {
    var mykey = crypto.createCipheriv(
      "aes-128-cbc",
      Buffer.alloc(16),
      Buffer.alloc(16)
    );

    var ciphertext = mykey.update(stuId, "utf8", "base64");
    ciphertext += mykey.final("base64"); //will allow key to display??
    socket.emit("cipher", ciphertext);
  });

  socket.on("disconnect", function() {
    console.log("edit issue page closed");
  });

  socket.on("edit file", function(issue) {
    fs.readFile("issues.json", "utf-8", (err, data) => {
      if (err) throw err;
      //if there's no id, this will not be called
      obj = JSON.parse(data);
      console.log("reading");
      let id = issue.issueId;
      obj[id] = issue.issue;
      fs.writeFile("issues.json", JSON.stringify(obj), function(err) {
        if (err) throw err;
        console.log("Saved!");
      });
    });
  });

  socket.on("deleteIssue", function(issueId) {
    fs.readFile("issues.json", "utf-8", (err, data) => {
      if (err) throw err;
      //   console.log(data);
      //if there's no id, this will not be called
      obj = JSON.parse(data); //the JSON array
      console.log("reading");
      let removed = obj.splice(issueId, 1);
      fs.writeFile("issues.json", JSON.stringify(obj), function(err) {
        if (err) throw err;
        console.log("Issues Saved!");
      });

      fs.appendFile("trash.txt", JSON.stringify(removed), function(err) {
        if (err) throw err;
        console.log("Deleted Saved!");
      });
    });
  });
});

// var display = io.of("/display");
// display.on("connection", function(socket) {
//   console.log("display page opened");
//   console.log(socket.request.connection.remoteAddress);
//   socket.on("myIP", ip => {
//     let index = 0;
//     let IpId = userIpId.filter((ele, i) => {
//       if (ele.ip && ele.ip == ip) {
//         index = i;
//         return true;
//       }
//     });
//     userIpId.splice(index);
//     let reqId = IpId[0]["id"];
//     let filteredArr;
//     fs.readFile("issues.json", "utf-8", (err, data) => {
//       console.log("read file"); // OK
//       if (err) throw err;
//       obj = JSON.parse(data);
//       filteredArr = obj.filter(ele => {
//         if (ele.studentId && ele.studentId == reqId) {
//           return true;
//         }
//       });
//     });
//     socket.emit("idInfo", filteredArr);
//   });

//   socket.on("disconnect", function() {
//     console.log("display page closed");
//   });
// });

let port = process.env.PORT || 3000;
// if (port == null || port == "") {
//   port = 3000;
// }

http.listen(port, function() {
  console.log("listening on *:3000");
});

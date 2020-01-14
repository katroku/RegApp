const express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var fs = require("fs");

let issueTemp;
let password = "a";
let roomNo = 0;
let homeRoomCount = [];
//allow files to be available on server eg. app.js
app.use(express.static("."));

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

let port = process.env.PORT || 3000;
// if (port == null || port == "") {
//   port = 3000;
// }

http.listen(port, function() {
  console.log("listening on *:3000");
});

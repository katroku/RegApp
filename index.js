const express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var fs = require("fs");

let issueTemp;
//allow files to be available on server eg. app.js
app.use(express.static("."));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/home.html");
});

app.get("/addIssue", function(req, res) {
  res.sendFile(__dirname + "/addIssue.html");
});

app.get("/editIssue", function(req, res) {
  res.sendFile(__dirname + "/editIssue.html");
});

var home = io.of("/home");
home.on("connection", function(socket) {
  console.log("home page opened");

  socket.on("disconnect", function() {
    console.log("home page closed");
  });

  socket.on("retr rec", function() {
    console.log("req rcvd");
    let obj;
    fs.readFile("issues.json", "utf-8", (err, data) => {
      if (err) throw err;
      //   console.log(data);
      obj = JSON.parse(data);
      console.log(obj);
      socket.emit("send rec", obj);
      console.log("sent rec");
    });
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
    // readStream.on("data", function(data) {
    //   var chunk = JSON.parse(data.toString());
    //   console.log(chunk);
    // });
    fs.readFile("issues.json", "utf-8", (err, data) => {
      if (err) throw err;
      //   console.log(data);
      obj = JSON.parse(data);
      console.log("reading");
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
  console.log("edit issue page opened");
  // if (issueTemp) {
  //   socket.join("room" + issueTemp.id);
  //   socket.to("room" + issueTemp.id).emit("openIssueHtml", issueTemp);
  //   console.log("room", issueTemp.id);
  // } else {
  //   socket.join("roomEx");
  // }

  socket.emit("openIssueHtml", issueTemp);
  socket.on("disconnect", function() {
    console.log("edit issue page closed");
  });

  // socket.on("hey", function(data) {
  //   console.log(data);
  // });
  socket.on("edit file", function(issue) {
    fs.readFile("issues.json", "utf-8", (err, data) => {
      if (err) throw err;
      //   console.log(data);
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

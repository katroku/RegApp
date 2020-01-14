//initializer function defined and called
(function init() {
  //if document is ready
  var socket = io.connect("/home");

  $(function() {
    //sessionStorage.tabId is undefined if not defined earlier
    // console.log("tabId", sessionStorage.tabId);
    // socket.emit("homeOpened", sessionStorage.tabId);
    // socket.on("setup", data => {
    //   console.log("roomNo", data.roomNo);
    //   if (data.roomNo) {
    //     //if no sessionStorage previously i.e fresh tab
    //     sessionStorage.tabId = data.roomNo;
    //   }
    //   console.log("homeCount", data.homeCount);
    //   if (data.homeCount == 1) {
    //     $(".pwd").css("display", "block");
    //   } else {
    //     $(".currentIssues").css("display", "block");
    //   }
    // });

    if (sessionStorage.password) {
      socket.emit("checkpass", sessionStorage.password);
      socket.on("passresult", passOK => {
        if (passOK) {
          $(".currentIssues").css("display", "block");
        } else {
          $(".pwd").css("display", "block");
        }
      });
    } else {
      $(".currentIssues").css("display", "none");
      $(".pwd").css("display", "block");
      $("#enter").on("click", () => {
        socket.emit("checkpass", $("#pwd").val());
        socket.on("passresult", passOK => {
          if (passOK) {
            $(".pwd").css("display", "none");
            $(".currentIssues").css("display", "block");
            sessionStorage.password = $("#pwd").val();
          } else {
            alert("Wrong password");
          }
        });
      });
    }

    let records = [];
    let keep = "";
    let issueCount = 0;

    socket.emit("retr rec");
    console.log("emitted");
    socket.on("send rec", obj => {
      obj = processData(obj);
      //console.log(obj);
      records = records.concat(obj);
      for (i = 0; i < obj.length; i++) {
        let issue = obj[i];
        if (
          issue.statusId == "inProgress" ||
          !issue.hasOwnProperty("statusId")
        ) {
          issueCount++;
          $("#table").append(
            `<tr class="inProgress"><td >${issueCount}</td><td><a href="editIssue.html" id=${"" +
              i} onclick= "myFunction(this)">${
              issue.topic
            }</a></td><td>${issue.firstName + " " + issue.lastName}</td><td>${
              issue.studentId
            }</td><td>${issue.time}</td></tr>`
          );
        }
      }
    });

    //to process incomplete data stream
    let processData = obj => {
      if (obj.startsWith("[") && obj.endsWith("]")) {
        obj = JSON.parse(obj);
        console.log("data stream is complete");
      } else if (obj.startsWith("[") && !obj.endsWith("]")) {
        //incomplete data, check if objects in array is complete
        let index = obj.lastIndexOf("}");
        keep = "[" + obj.slice(index + 2);
        obj = obj.slice(0, index + 1) + "]";
        obj = JSON.parse(obj);
        console.log("first data stream is printed");
      } else if (!obj.startsWith("[") && !obj.endsWith("]")) {
        //incomplete data
        obj = keep + obj;
        let index = obj.lastIndexOf("}");
        keep = "[" + obj.slice(index + 2);
        obj = obj.slice(0, index + 1) + "]";
        obj = JSON.parse(obj);
        console.log("mid data stream is printed");
      } else if (!obj.startsWith("[") && obj.endsWith("]")) {
        obj = keep + obj;
        obj = JSON.parse(obj);
        console.log("last data stream is printed");
      }
      return obj;
    };

    viewAll = () => {
      console.log(records);
      if (!(issueCount >= records.length)) {
        for (i = 0; i < records.length; i++) {
          let issue = records[i];
          if (issue.statusId == "complete") {
            issueCount++;
            $("#table").append(
              `<tr class="complete"><td>${issueCount}</td><td><a href="editIssue.html" style="color:brown;" id=${"" +
                i} onclick= "myFunction(this)">${
                issue.topic
              }</a></td><td>${issue.firstName + " " + issue.lastName}</td><td>${
                issue.studentId
              }</td><td>${issue.time}</td></tr>`
            );
          }
        }
      }
      $("tr.complete").css("display", "table-row");
      $("#viewAll").css("display", "none");
      $("#viewCurrent").css("display", "block");
    };

    viewCurrent = () => {
      location.reload();
      // $("tr.complete").css("display", "none");
      // $("#viewAll").css("display", "block");
      // $("#viewCurrent").css("display", "none");
    };

    displayFind = () => {
      $("#find").toggle();
    };

    $("#search").on("click", () => {
      console.log("searching");
      $("tr.complete").css("display", "none");
      $("tr.inProgress").css("display", "none");
      $("#viewAll").css("display", "none");
      $("#viewCurrent").css("display", "block");

      let filteredArr = filterBySearch(
        records,
        $("#topic").val(),
        $("#studentId").val(),
        $("#firstName").val(),
        $("#lastName").val()
      );
      for (i = 0; i < filteredArr.length; i++) {
        let issue = filteredArr[i];
        $("#table").append(
          `<tr class="complete"><td>${i +
            1}</td><td><a href="editIssue.html" id=${"" +
            i} onclick= "myFunction(this)">${
            issue.topic
          }</a></td><td>${issue.firstName + " " + issue.lastName}</td><td>${
            issue.studentId
          }</td><td>${issue.time}</td></tr>`
        );
      }
    });

    myFunction = ele => {
      let id = ele.id;
      console.log(id);
      let issue = records[id];
      socket.emit(`open issue`, { issue, id });
    };

    function filterBySearch(arr, q1, q2, q3, q4) {
      return arr.filter(ele => {
        if (q1 && ele.topic.indexOf(q1) !== -1) {
          return true;
        }
        if (
          q2 &&
          ele.studentId.length > q2.length &&
          ele.studentId.indexOf(q2) !== -1
        )
          return true;
        if (q3 && ele.firstName.indexOf(q3) !== -1) return true;
        if (q4 && ele.lastName.indexOf(q4) !== -1) return true;
      });
    }
  });
})();

//initializer function defined and called
(function init() {
  //if document is ready
  var socket = io.connect("/home");

  $(function() {
    $("#enter").on("click", () => {
      if ($("#pwd").val() == "prince") {
        $(".pwd").css("display", "none");
        $(".currentIssues").css("display", "block");
      } else {
        alert("Wrong password");
      }
    });

    let records;
    socket.emit("retr rec");
    console.log("emitted");
    socket.on("send rec", obj => {
      records = obj;
      console.log(records);
      for (i = 0; i < records.length; i++) {
        let issue = records[i];
        if (
          issue.statusId == "inProgress" ||
          !issue.hasOwnProperty("statusId")
        ) {
          $("#table").append(
            `<tr><td><a href="editIssue.html" id=${"" +
              i} onclick= "myFunction(this)">${
              issue.topic
            }</a></td><td>${issue.firstName + " " + issue.lastName}</td><td>${
              issue.time
            }</td></tr>`
          );
        }
      }
    });

    viewAll = () => {
      for (i = 0; i < records.length; i++) {
        let issue = records[i];
        if (issue.statusId == "complete") {
          $("#table").append(
            `<tr class="complete"><td><a href="editIssue.html" id=${"" +
              i} onclick= "myFunction(this)">${
              issue.topic
            }</a></td><td>${issue.firstName + " " + issue.lastName}</td><td>${
              issue.time
            }</td></tr>`
          );
        }
      }
      $("#viewAll").css("display", "none");
      $("#viewCurrent").css("display", "block");
    };

    viewCurrent = () => {
      $("tr.complete").remove();
      $("#viewAll").css("display", "block");
      $("#viewCurrent").css("display", "none");
    };

    myFunction = ele => {
      let id = ele.id;
      console.log(id);
      let issue = records[id];
      socket.emit(`open issue`, { issue, id });
    };
  });
})();

//initializer function defined and called
(function init() {
  //if document is ready
  var socket = io.connect("/editIssue");

  $(function() {
    let statusId = "inProgress";
    let issueTemp;
    let issueId;
    // socket.emit("hey", "this is working");
    socket.on("openIssueHtml", function(issue) {
      issueTemp = issue.issue;
      issueId = issue.id;
      console.log("openIssuehtml"); //OK

      for (var key in issueTemp) {
        if (`${key}`) {
          console.log(key);
          $(`${"#" + key}`).val(`${issueTemp[key]}`); //OK
        }
      }
    });

    // $("#butt").on("click", function() {
    //   console.log($('input[name="status"]:checked').val());
    // });

    $(".edit-issues .delete").on("click", function() {
      let r = window.confirm("Please confirm deletion");
      if (r == true) {
        // console.log("you pressed delete");
        // console.log(issueId); //undefined if fresh page, index in array if from link
        if (issueId) {
          socket.emit("deleteIssue", issueId);
          window.history.back();
        } else {
          alert("There is no Issue Id");
        }
      }
    });

    $(".edit-issues .edit").on("click", function() {
      console.log("button clicked!");
      let issue = {
        topic: $("#topic").val(),
        studentId: $("#studentId").val(),
        firstName: $("#firstName").val(),
        lastName: $("#lastName").val(),
        description: $("#description").val(),
        statusId: $('input[name="status"]:checked').val() || statusId,
        time: issueTemp.time
      };

      console.log(issue);
      socket.emit("edit file", { issue, issueId });
      // Calculate number of issues

      // Update the wish list and the sum DOM elements
      //href="javascript:;" got something to do in javascript when link is clicked
      window.history.back();
    });

    getStringDay = date => {
      let day;
      switch (date.getDay()) {
        case 0:
          day = "Sunday";
          break;
        case 1:
          day = "Monday";
          break;
        case 2:
          day = "Tuesday";
          break;
        case 3:
          day = "Wednesday";
          break;
        case 4:
          day = "Thursday";
          break;
        case 5:
          day = "Friday";
          break;
        case 6:
          day = "Saturday";
      }
      return day;
    };

    getStringDate = date => {
      return (
        date.getHours() +
        ":" +
        date.getMinutes() +
        " " +
        getStringDay(date) +
        ", " +
        date.getDate() +
        "/" +
        date.getMonth() +
        1 +
        "/" +
        date.getFullYear()
      );
    };
  });
})();

//initializer function defined and called
(function init() {
  //if document is ready
  var socket = io.connect("/editIssue");

  $(function() {
    let statusId = "inProgress";
    let issueTemp;
    let issueId;

    socket.emit("editor opened");
    socket.on("openIssueHtml", function(issue) {
      issueTemp = issue.issue;
      issueId = issue.id;
      console.log("openIssuehtml"); //OK

      for (var key in issueTemp) {
        if (`${key}`) {
          console.log(key);
          if (key == "statusId") {
            $(`${"#" + issueTemp[key]}`).prop("checked", true);
          }
          $(`${"#" + key}`).val(`${issueTemp[key]}`); //OK
        }
      }
      makeCode();
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
        email: $("#email").val(),
        description: $("#description").val(),
        statusId: $('input[name="status"]:checked').val() || statusId,
        time: issueTemp.time
      };
      if (issueId) {
        console.log(issue);
        socket.emit("edit file", { issue, issueId });
      }

      // Calculate number of issues

      // Update the wish list and the sum DOM elements
      //href="javascript:;" got something to do in javascript when link is clicked
      window.history.back();
    });

    //QR code generate

    let makeCode = function() {
      if (!$("#studentId").val()) {
        //
      } else {
        let ip = "";
        socket.emit("getCipher", $("#studentId").val());
        socket.on("cipher", ciphertext => {
          new QRCode(document.getElementById("qrcode"), {
            text: ip + ":3000/display/" + ciphertext,
            width: 128,
            height: 128,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
          });
        });

        console.log("complete");
      }
    };
    $("#studentId").on("blur", () => {
      if (!$("#studentId").val()) {
        alert("Please enter Student ID");
        // } else if ($("#studentId").val() != 10) {
        //   alert("Please enter correct Student ID");
      } else {
        makeCode();
      }
    });
    //QR Code generate

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

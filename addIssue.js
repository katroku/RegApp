//initializer function defined and called
(function init() {
  //if document is ready

  var socket = io.connect("/addIssue");

  $(function() {
    let topic, studentId, firstName, lastName, description, time;
    let statusId = "inProgress";

    $(".add-issues .add").on("click", function() {
      console.log("button clicked!");
      let issue = {
        topic: $("#topic").val(),
        studentId: $("#studentId").val(),
        firstName: $("#firstName").val(),
        lastName: $("#lastName").val(),
        description: $("#description").val(),
        statusId,
        time: getStringDate(new Date())
      };

      console.log(issue);
      socket.emit("save file", issue);
      // Calculate number of issues

      // Update the wish list and the sum DOM elements
      //href="javascript:;" got something to do in javascript when link is clicked
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

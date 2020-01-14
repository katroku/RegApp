const readline = require("readline");
var fs = require("fs");

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });
// rl.question("Type in data", records => {
//   if (records.startsWith("[") && records.endsWith("]")) {
//     records = JSON.parse(records);
//   }

//   console.log(`Thank you for your valuable feedback: ${records}`);

//   rl.close();
// });
let keep = "";
let records = "";
var readStream = fs.createReadStream("issues.json");
readStream.on("data", function(data) {
  console.log("readStream is called only once no matter how big data is??");
  let obj = data.toString();
  records = processData(obj);
  console.log(records);
  // obj = JSON.parse(obj);
  // console.log(obj);
});

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

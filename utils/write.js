const match = /"data:image\/([a-zA-Z]*);base64,([^\"]*)\"/g;
const str_replace = "data:image/jpeg;base64,";
function decodedBase64(str, filename) {
  const base64Data = str.match(match)[0];
  const context = base64Data.replace(str_replace, "");
  // console.log("context = " + context);
  const fs = require("fs");
  fs.writeFile(`./images/${filename}`, context, "base64", (err) => {
    // console.log(err);
  });
  const link = `http://localhost:4001/images/${filename}`;
  const linkImage = str.replace(`${base64Data}`, link);
  return { linkImage, link };
}

module.exports = decodedBase64;

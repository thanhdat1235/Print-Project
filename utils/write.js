const match = /"data:image\/([a-zA-Z]*);base64,([^\"]*)\"/g;
let matches = /(https?:\/\/.*\.(?:png|jpg))/i;
// let rpl = `<img.+?src\s*=\s*\'(.*?\.(jpg|bmp|png))'`;

// /<img.*?src="(.*?)"[^>]+>/g
const str_replace = "data:image/jpeg;base64,";
function decodedBase64(str, filename) {
  const base64Data = str.match(match);
  if (base64Data) {
    const context = base64Data[0].replace(str_replace, "");
    // console.log("context = " + context);
    const fs = require("fs");
    fs.writeFile(`./images/${filename}`, context, "base64", (err) => {
      // console.log(err);
    });
    const link = `http://localhost:4001/images/${filename}`;
    const linkImage = str.replace(`${base64Data}`, link);
    return { linkImage, link };
  }
  const link = str.match(matches)[0];
  const linkImage = str;
  return { linkImage, link };
}

module.exports = decodedBase64;

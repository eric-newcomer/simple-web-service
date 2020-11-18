const express = require('express');
const formidable = require('express-formidable');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 8081;

app.use(express.json());
app.use(formidable());

app.post("/post", (req, res) => {
   console.log('in server')
   if (req.body.fileAsBase64 === null) {
      return res.status(400).json({ msg: 'No file uploaded'});
   }
   const fileAsBase64 = req.fields.fileAsBase64;
   const filename = req.fields.filename;

   // Decode base64 back to image
   let data = fileAsBase64.replace(/^data:image\/\w+;base64,/, "");
   let buf = Buffer.from(data, 'base64');
   fs.writeFile(filename, buf, (err) => {
      if (err) {
         throw err;
      } else {
         console.log(`File created: ${filename}`);
      }
   })

   // Extract MIME type from data url
   const mimeType = fileAsBase64.substring(fileAsBase64.indexOf(":")+1, fileAsBase64.indexOf(";"));
   let isJPG = false;
   let msg = "File is not a JPEG.";
   if (mimeType === "image/jpeg") { 
      isJPG = true;
      msg = "File is a JPEG!";
      console.log("Is a JPEG!");
   } else {
      console.log("Not a JPEG");
   }
   res.json({
      "base64": fileAsBase64,
      "isJPG": isJPG,
      "msg": msg
   });
});

app.listen(port, () => {
   console.log(`Server is running on port: ${port}`);
});
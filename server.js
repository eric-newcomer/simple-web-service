const express = require('express');
const formidable = require('express-formidable');
const fs = require('fs');
const ExifImage = require('exif').ExifImage;
const exif = require('exif-parser')

const app = express();
const port = process.env.PORT || 8081;

app.use(express.json());
app.use(formidable());

// getZipcode: String filename -> String Zipcode
const getZipcode = (filename) => {
   try {
      new ExifImage({ image : filename }, (error, exifData) => {
          if (error)
              console.log('Error: '+error.message);
          else
              console.log(exifData); // Do something with your data!
      });
  } catch (error) {
      console.log('Error: ' + error.message);
  }
}

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
   let zipCode = '';
   if (mimeType === "image/jpeg") { 
      isJPG = true;
      msg = "File is a JPEG!";
      console.log("Is a JPEG!");
      zipcode = getZipcode(filename);
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
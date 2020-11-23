const express = require('express');
const formidable = require('express-formidable');
const fs = require('fs');
const ExifImage = require('exif').ExifImage;
const request = require('request');
const util = require('util')

const app = express();
const port = process.env.PORT || 8081;

app.use(express.json());
app.use(formidable());

// getZipFromLatLong: (lat: int, long: int) -> Promise
// Given latitude and longitude coordinates, this function 
// will return the corrsponding ZIP code (as a Promise)
const getZipFromLatLong = (lat, long) => {
   return new Promise((resolve, reject) => {
      request(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${long}&localityLanguage=en`, (err, response, body) => {
         if (!err && response.statusCode == 200) {
            const obj = JSON.parse(body);
            resolve(obj['postcode']);
         } else {
            console.log(err);
            reject(err.message);
         }  
      });
   })
};

// getZipcode: (filename: String) -> GPS info: String
// Given a filename, this function will return the GPS info
// as a Promise (JS object with latitude and longitude)
const getLatAndLong = filename => {
   return new Promise((resolve, reject) => {
      try {
         new ExifImage({ image : filename }, (error, exifData) => {
            if (error) {
               // console.log('Error: '+error.message);
               reject(error);
            }
            else {
               if (exifData['gps'].GPSLatitudeRef) {
                  let gps = {};
                  // console.log("Lat: ",exifData['gps']['GPSLatitude']);
                  // console.log("Long: ",exifData['gps']['GPSLongitude']);
                  if (exifData.gps.GPSLatitudeRef == 'S') {
                     gps['latitude'] = -(exifData.gps.GPSLatitude[0] + (exifData.gps.GPSLatitude[1] / 60) + (exifData.gps.GPSLatitude[2] / 3600));
                  } else if (exifData.gps.GPSLatitudeRef == 'N') {
                     gps['latitude'] = (exifData.gps.GPSLatitude[0] + (exifData.gps.GPSLatitude[1] / 60) + (exifData.gps.GPSLatitude[2] / 3600));
                  } else {
                     gps['latitude'] = null;
                  }
                  if (exifData.gps.GPSLongitudeRef == 'W') { 
                     gps['longitude'] = -(exifData.gps.GPSLongitude[0] + (exifData.gps.GPSLongitude[1] / 60) + (exifData.gps.GPSLongitude[2] / 3600));
                  } else if (exifData.gps.GPSLongitudeRef == 'E') {
                     gps['longitude'] = (exifData.gps.GPSLongitude[0] + (exifData.gps.GPSLongitude[1] / 60) + (exifData.gps.GPSLongitude[2] / 3600));
                  } else {
                     gps['longitude'] = null;
                  }
                  resolve(gps);
               } else {
                  reject(new Error('Lat/long info not available'));
               }
            }
         });
      } catch (error) {
         console.log('Error: ' + error.message);
         reject(error.message);
     }
   })
}          

// Basic GET endpoint. Verify server is running 
app.get("/", (req, res) => {
   return res.status(200).json({ msg: "Express server running"});
})


app.post("/post", (req, res) => {
   if (req.body.fileAsBase64 === null) {
      return res.status(400).json({ msg: 'No file uploaded'});
   }
   const fileAsBase64 = req.fields.fileAsBase64;
   const filename = req.fields.filename;
   
   // Decode base64 back to image
   let data = fileAsBase64.replace(/^data:image\/\w+;base64,/, "");
   let buf = Buffer.from(data, 'base64');
   fs.writeFile('../uploads/'+filename, buf, (err) => {
      if (err) {
         console.log(err.message);
         throw err;
      } else {
         console.log(`File created: ${filename}`);
      }
   })
  
   // Extract MIME type from data url
   const mimeType = fileAsBase64.substring(fileAsBase64.indexOf(":")+1, fileAsBase64.indexOf(";"));
   let isJPG = false;
   let msg = "File is not a JPEG.";
   if (mimeType === "image/jpeg" || mimeType === "image/jpg") { 
      isJPG = true;
      msg = "File is a JPEG!";
      console.log("Is a JPEG!");
      const gps = getLatAndLong('../uploads/'+filename);
      console.log("HERE:",'../uploads/'+filename);
      gps.then((response) => {
         console.log("response: ",response);
         const zipCode = getZipFromLatLong(response['latitude'], response['longitude']);
         zipCode.then((finalZip) => {
            console.log("main: ", finalZip);
            res.json({
               "base64": fileAsBase64,
               "isJPG": isJPG,
               "msg": msg,
               "zipCode": finalZip
            });
         });
      }).catch((err) => {
         console.log("File is JPEG, but no GPS info");
         res.json({
            "base64": fileAsBase64,
            "isJPG": isJPG,
            "msg": msg,
            "zipCode": "No GPS information found in metadata"
         });
      });
   } else {
      console.log("Not a JPEG");
      res.json({
         "base64": fileAsBase64,
         "isJPG": isJPG,
         "msg": msg,
         "zipCode": ''
      });
   }
});

app.listen(port, () => {
   console.log(`Server is running on port: ${port}`);
});

module.exports = {
   getZipFromLatLong,
   getLatAndLong,
   app
}
const express = require('express');
const formidable = require('express-formidable');
const fs = require('fs');
const ExifImage = require('exif').ExifImage;
const request = require('request');
const fetch = require('node-fetch');


const app = express();
const port = process.env.PORT || 8081;

app.use(express.json());
app.use(formidable());

var zip = '';

function getZipFromLatLong(lat, long, callback) {
   request(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${long}&localityLanguage=en`, (err, response, body) => {
      if (!err && response.statusCode == 200) {
         const obj = JSON.parse(body);
         callback(obj['postcode']);
      }   
   });
};

// getZipcode: String filename -> String Zipcode
const getZipcode = filename => {
   try {
      new ExifImage({ image : filename }, (error, exifData) => {
          if (error)
              console.log('Error: '+error.message);
          else {
            // If GPS info is available
            if (exifData['gps'].GPSLatitudeRef) {
               let gps = {};
               console.log(exifData['gps']);
               console.log("Lat: ",exifData['gps']['GPSLatitude']);
               console.log("Long: ",exifData['gps']['GPSLongitude']);
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
               console.log(gps);
               getZipFromLatLong(gps['latitude'], gps['longitude'], (res) => {
                  zip = res;
               });
               console.log("HERE: ",zip);
               return zip;
            } else {
               console.log("GPS info not found");
               return "";
            }
         }
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
      zipCode = getZipcode(filename);
      console.log("here: ",zipCode);
   } else {
      console.log("Not a JPEG");
   }
   res.json({
      "base64": fileAsBase64,
      "isJPG": isJPG,
      "msg": msg,
      "zipcode": zipCode
   });
});

app.listen(port, () => {
   console.log(`Server is running on port: ${port}`);
});
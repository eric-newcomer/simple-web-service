import React, {Fragment, useState} from 'react';
import axios from 'axios';
import Zoom from 'react-reveal/Zoom';


const UploadFile = () => {

   const [file, setFile] = useState('');
   const [filename, setFilename] = useState('Choose image');
   const [isJpeg, setIsJpeg] = useState(false);
   const [message, setMessage] = useState('');
   const [zipCode, setZipCode] = useState('');

   const onChange = e => {
      setFile(e.target.files[0]);
      setFilename(e.target.files[0].name);
   }

   const toBase64 = fileIn => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(fileIn);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
  });

   const onSubmit = async e => {
      e.preventDefault();
      const formData = new FormData();
      const fileAsBase64 = await toBase64(file);
      //console.log(fileAsBase64);
      formData.append('fileAsBase64', fileAsBase64);
      formData.append('filename', file.name);

      try {
         const res = await axios.post("/post", formData, {
            headers: {
               'Content-Type': 'multipart/form-data'
            }
         });

         const {base64, isJPG, msg, zipCode} = res.data;
         setIsJpeg(isJPG);
         setMessage(msg);
         setZipCode(zipCode);
         console.log("Result ZIP Code: ", zipCode);
      } catch (err) {
         // handle error
         console.log(err);
      }
   }

   return (
      <Fragment>
         <form onSubmit={onSubmit}>
            <div className="custom-file">
               <input 
                  type="file" 
                  class="custom-file-input" 
                  id="customFile" 
                  onChange={onChange}
               />
               <label class="custom-file-label" htmlFor="customFile">
                  {filename}
                  </label>
            </div>

            <input 
               type="submit" 
               value="Validate!" 
               className="btn btn-primary btn-block mt-4" 
            />
         </form>
         {(message && isJpeg && zipCode) ? (
            <Zoom>
               <div className='row mt-5'>
                  <div className='col-md-6 m-auto'>
                     <h3 className='text-center' style={{color: 'green'}}>{message}</h3>
                     <h4 className='text-center'>ZIP Code: {zipCode}</h4>
                  </div>
               </div>
            </Zoom>
         ) : (message && !isJpeg) ? (
            <Zoom>
               <div className='row mt-5'>
                  <div className='col-md-6 m-auto'>
                     <h3 className='text-center' style={{color: 'red'}}>{message}</h3>
                     {/* <img style={{ width: '100%' }} src={uploadedFile.filePath} alt='' /> */}
                  </div>
               </div>
            </Zoom>
         ) : null}
      </Fragment>
   )
}

export default UploadFile;


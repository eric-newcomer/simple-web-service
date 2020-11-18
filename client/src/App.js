import logo from './logo.svg';
import './App.css';
import UploadFile from './components/UploadFile';

function App() {

  return (
    <div className="App">
      <h1>Validate a JPEG</h1>
      <br />
      <p>This simple web service validates that an image is a JPEG.</p> 
      <p>If it is a JPEG, we will return the ZIP code the image was taken in.</p>
      <br />
      <UploadFile />
    </div>
  );
}

export default App;

import './App.css';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useRef } from "react";
import Home from './Components/Home';
import NavBar from './Components/NavBar';
import Program from './Components/Program';
import FileProgram from './Components/FileProgram';
import PopUp from './Components/PopUp'
import GoogleMapProgram from './Components/GoogleMapProgram';


function App() {

  const [isLoading, setLoading] = useState(false);
  const [popUpState, setPopUp] = useState(false);
  const [popUpTitle, setTitle] = useState("");
  const [popUpMessage, setMessage] = useState("");
  const [popUpDest, setDest] = useState();

  // using useref for sync value
  const popUp = useRef();

  // popup feature
  const showPopUp = ({title, message, to}) => {

    setTitle(title);
    setMessage(message);

    if (!popUp.state || to !== undefined)
    {
      setDest(to);
    }

    setPopUp(true);
    popUp.state = true;
  
  }

  const props = {
    setLoading: setLoading,
    showPopUp: showPopUp,
    isloading: isLoading,

  }

  return (
    <Router>
      <div className='App'>
        <NavBar/>
        <Routes>
            <Route exact path='/' element={<Home/>}/>
            <Route exact path='/app' element={<Program/>}/>
            <Route exact path='app/using-file' element={<FileProgram {...props}/>}/>
            <Route exact path='app/using-gmap' element={<GoogleMapProgram {...props}/>}/>
        </Routes>

        {popUpState && 
          <PopUp 
            title={popUpTitle} 
            message={popUpMessage} 
            to={popUpDest} 
            setPopUp={setPopUp} 
            popUp={popUp}
            >
          </PopUp>
        }

        {isLoading && 
          <PopUp 
            title="" 
            message="Loading..."
            isLoading={isLoading}>
          </PopUp>
        }
      </div>
  </Router>
  );
}

export default App;

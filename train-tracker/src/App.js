import './styles/App.css';
import Amtrak from './AmtrakAPI';
import train_icon from './images/train_icon.png';
import React, {useState, useEffect} from 'react'
import { useNavigate, Link, Routes, Route, HashRouter } from 'react-router-dom';

import Home from './Home';
import TrainPage from './TrainPage';

import { getClosestStation } from './functionality/app';

function App() {
    // load api data
    const api = new Amtrak.APIInstance();

    const [userLocation, setUserLocation] = useState(null);
    const [selectedStation, setSelectedStation] = useState("");
    const [selectedRoute, setSelectedRoute] = useState("");

    const [allTrains, setAllTrains] = useState([]);
    const [allRoutes, setAllRoutes] = useState([]);
    const [allStations, setAllStations] = useState([]);

    useEffect(() => {
        api.onUpdated = function() {
            setAllTrains(this.trains);
            setAllRoutes(this.routes);
            setAllStations(this.stations);
        }
        api.update();

    },[]);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos)=>{
                setUserLocation(pos);
                if (allStations.length > 0 && pos){
                    setSelectedStation(getClosestStation(allStations, pos).stationCode);
                }
            }, 
            (error) => console.log('error' + error));
        }
        
    }, [allStations]);


    function TrainForm(){
        const [selectedNumber, setSelectedNumber] = useState("");

        const navigate = useNavigate();

        function handleNumber(e){ setSelectedNumber(e.target.value); }

        function search(event){
            event.preventDefault();
            navigate("/train/"+selectedNumber);
        }

        return (
            <form onSubmit={search}>
                <input className="select-box" value={selectedNumber} placeholder="Search by Number" onChange={handleNumber} type="number" min='1'></input>
            </form>
        )
    }
  
    const homePage = <Home
        allTrains={allTrains}
        allRoutes={allRoutes}
        allStations={allStations}
        userLocation={userLocation}
        selectedStation={selectedStation}
        setSelectedStation={setSelectedStation}
        selectedRoute={selectedRoute}
        setSelectedRoute={setSelectedRoute}
    />;
    
  return (
    <HashRouter>
        <div className="App">
          <div className="header">
              <Link to="/">
                <div className="heading-box">
                    <img src={train_icon} alt="Train Icon" className="train_icon" />
                    <h1>TrainTracker</h1>
                </div>
              </Link>
              
              <TrainForm/>
          </div>
              
          <div className='content'>
                <Routes>
                    <Route path="/" element={homePage}/>
                    <Route path="/home" element={homePage}/>
                    <Route path="/train/:trainInfo" element={<TrainPage/>}/>
                </Routes>
              </div> 
          </div>
    </HashRouter>
  );
}

export default App;

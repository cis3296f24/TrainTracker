import './styles/App.css';
import Amtrak from './AmtrakAPI';
import train_icon from './images/train_icon.png';
import React, {useState, useEffect} from 'react'
import Map from './Map';
import TrainList from './TrainList';
import Search from './Search';
import TrainPopup from './TrainPopup';
import {filterTrains} from './functionality/app.js'

import { IoClose } from "react-icons/io5";

function App() {
    const api = new Amtrak.APIInstance();

    // api data
    const [allTrains, setAllTrains] = useState([]);
    const [allRoutes, setAllRoutes] = useState([]);
    const [allStations, setAllStations] = useState([]);

    // sorted trains
    const [currentTrains, setCurrentTrains] = useState([]);

    // popup modal
    const [selectedTrain, setSelectedTrain] = useState({});
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        api.onUpdated = function() {
            setAllTrains(this.trains);
            setAllRoutes(this.routes);
            setAllStations(this.stations);
        }
        api.update();
    },[]);

    const searchTrains = (selectedNumber, selectedRoute, selectedStation, upcoming, fromStation, toStation) => {
        let trains = filterTrains(allTrains, selectedNumber, selectedRoute, selectedStation, upcoming, fromStation, toStation);
        setCurrentTrains(trains);
    }

    const getStationOptions = () => {
        let renderedStations = allStations.map(station => {
            return <option value={station.stationCode} key={station.stationCode}>{station.stationCode} - {station.name}</option>
        })
        renderedStations.push(<option value={""} key={""}>{}</option>);
        return renderedStations;
    }

    const getRouteOptions = () => {
        let renderedRoutes = allRoutes.map(route => {
            return <option value={route.Name} key={route.Name}>{route.Name}</option>
        });
        renderedRoutes.push(<option value={""} key={""}>{}</option>);
        return renderedRoutes;
    }

    // Modal Functions
    function handleTrainClick(train){
        setShowModal(true);
        setSelectedTrain(train);
    }

    const handleModalClose = () => {
        setShowModal(false);
    };

    const closeButton = (<div>
        <div onClick={handleModalClose}><IoClose size={'3rem'}/></div>
    </div>);

    const modal = <TrainPopup onClose={handleModalClose} actionBar={closeButton} train={selectedTrain}/>

  return (
      <div className="App">
          <div className="header">
              <div className="heading-box">
                  <img src={train_icon} alt="Train Icon" className="train_icon" />
                  <h1>TrainTracker</h1>
              </div>
              <div className='content'>
              <div className='search-container'>
              <Search className='Search'
                routes = {getRouteOptions()}
                stations = {getStationOptions()}
                searchFun = {searchTrains}
              />
              </div>
              <div className='app-train-list-container'><TrainList className = 'TrainList' trains={currentTrains} handleTrainClick={handleTrainClick}/></div>
              <div className='map-container'><Map className = 'Map' /></div>
              <div>
                {showModal && modal}
                </div>
              </div> 
          </div>
      </div>
  );
}

export default App;

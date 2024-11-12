import './styles/App.css';
import Amtrak from './AmtrakAPI';
import train_icon from './images/train_icon.png';
import React, {useState, useEffect} from 'react'
import Map from './Map';
import TrainList from './TrainList';
import Search from './Search';
import TrainPopup from './TrainPopup';

import { IoClose } from "react-icons/io5";

function App() {
    const api = new Amtrak.APIInstance();

    const [searchBy, setSearchBy] = useState('1');
    const [searchKey, setSearchKey] = useState("Enter train line or number");
    const [startStation, setStartStation] = useState("");
    const [endStation, setEndStation] = useState("");
    const [allTrains, setAllTrains] = useState([]);
    const [currentTrains, setCurrentTrains] = useState([]);
    const [selectedStation, setSelectedStation] = useState("");
    const [upcomingOnly, setUpcomingOnly] = useState(false);

    const [selectedTrain, setSelectedTrain] = useState({});

    const [showModal, setShowModal] = useState(false);

    const handleModalClose = () => {
        setShowModal(false);
    };

     useEffect(() => {
        api.onUpdated = function() {
            setAllTrains(this.trains);
        }
        api.update();
    },[]);

    useEffect(() => {
        setCurrentTrains(sortTrains());
    },[searchBy, searchKey, startStation, endStation, allTrains, selectedStation, upcomingOnly]);

    function handleFormChange(e){
        setSearchKey(e.target.value);
    }

    function handleSelectChange(e){
        setSearchBy(e.target.value);
    }

    function handleStartStationChange(e){
        setStartStation(e.target.value);
    }

    function handleEndStationChange(e){
        setEndStation(e.target.value);
    }

    function handleSelectedStationChange(e){
        setSelectedStation(e.target.value);
    }

    function handleUpcomingOnlyChange(e){
        setUpcomingOnly(e.target.checked);   
    }

    function handleTrainClick(train){
        setShowModal(true);
        setSelectedTrain(train);
    }

    const sortTrains = () => {
        let defaultSearch = "Enter train line or number";
        let trains = [];
        if (selectedStation){
            trains = allTrains.filter((t,index) => (t.stations.findIndex((station) => station.stationCode === selectedStation) !== -1));
            if (upcomingOnly){
                trains = trains.filter((t, index) => {
                    let station = t.stations.find((station) => station.stationCode === selectedStation);
                    if (station.stationCode === t.from && station.hasDeparted){
                        return;
                    }
                    if (!station.hasArrived || !station.hasDeparted){
                        return t;
                    }
                })
            }
        }
        if (searchBy === '1' && searchKey && searchKey !== defaultSearch){ 
            if (selectedStation){
                trains = trains.filter(t => t.number === searchKey);
            }
            else{
                trains = allTrains.filter(t => t.number === searchKey);
            }
        }
        else if (searchBy === '2' && searchKey && searchKey !== defaultSearch){
            if (selectedStation){
                trains = trains.filter(t => t.routeName === searchKey);
            }
            else{
                trains = allTrains.filter(t => t.routeName === searchKey);
            }
        }
        if (startStation && endStation){
            trains = trains.filter((t, index) =>{
                return t.stations.findIndex((station) => station.stationCode === startStation) < t.stations.findIndex((station) => station.stationCode === endStation);
            })
        }
        return trains;
    }

    const getStationOptions = () => {
        let stations = allTrains.flatMap(train => train.stations);
        stations = stations.filter((s, index) => {
            return index === stations.findIndex(station => station.stationCode === s.stationCode);
        });
        let renderedStations = stations.sort((a,b) => a.stationCode.localeCompare(b.stationCode)).map(station => 
            <option value={station.stationCode}>{station.stationCode}</option>
        );
        renderedStations.push(<option value={""} key={""}>{}</option>);
        return renderedStations;
    }

    const actionBar = (<div>
        <div onClick={handleModalClose}><IoClose size={'3rem'}/></div>
    </div>);

    const modal = <TrainPopup onClose={handleModalClose} actionBar={actionBar} train={selectedTrain}/>

  return (
      <div className="App">
          <div className="header">
              <div className="heading-box">
                  <img src={train_icon} alt="Train Icon" className="train_icon" />
                  <h1>TrainTracker</h1>
              </div>
              <div className='content'>
                  <div className='search-container'>

                      <Search className='Search' searchChange={handleFormChange} criteriaChange={handleSelectChange} searchVal={searchKey} searchByVal={searchBy}
                              startVal={startStation} endVal={endStation} startChange={handleStartStationChange} endChange={handleEndStationChange} stations={getStationOptions()}
                              station={selectedStation} stationChange={handleSelectedStationChange} upcomingOnlyValue={upcomingOnly} upcomingOnlyChange={handleUpcomingOnlyChange}
                      />
                  </div>
                  <div className='app-train-list-container'>
                      <TrainList className = 'TrainList' trains={currentTrains} handleTrainClick={handleTrainClick}/>
                  </div>
                  <div className='map-container'>
                      <Map className = 'Map' />
                  </div>
              </div>
              <div>
                {showModal && modal}
                </div>

          </div>
      </div>
  );
}

export default App;

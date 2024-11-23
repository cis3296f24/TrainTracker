import './styles/Home.css';
import React, {useState} from 'react'
import TrainList from './TrainList';
import Search from './Search';
import TrainPopup from './TrainPopup';

import { IoClose } from "react-icons/io5";

function Home({allRoutes, allStations, userLocation, selectedStation, setSelectedStation, selectedRoute, setSelectedRoute, refresh, setRefresh, 
    selectedNumber, setSelectedNumber, upcoming, setUpcoming, fromStation, setFromStation, toStation, setToStation, currentTrains, searchTrains
}){
    // popup modal
    const [selectedTrain, setSelectedTrain] = useState({});
    const [showModal, setShowModal] = useState(false);

    const getStationOptions = () => {
        let renderedStations = allStations.map(station => {
            return <option value={station.stationCode} key={station.stationCode}>{station.stationCode} - {station.name}</option>
        })
        renderedStations.unshift(<option value={""} key={""}>{}</option>);
        return renderedStations;
    }

    const getRouteOptions = () => {
        let renderedRoutes = allRoutes.sort((a, b) => (a.Name).localeCompare(b.Name)).map(route => {
            return <option value={route.Name} key={route.Name}>{route.Name}</option>
        });
        renderedRoutes.unshift(<option value={""} key={""}></option>);
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
        <div onClick={handleModalClose} className='close-button'><IoClose size={'3rem'}/></div>
    </div>);

    const modal = <TrainPopup onClose={handleModalClose} actionBar={closeButton} train={selectedTrain}/>
    return (
        <div className='home-page'>
            <div className='search-container'>
              <Search className='Search'
                routes = {getRouteOptions()}
                stations = {getStationOptions()}
                searchFun = {searchTrains}
                setSelectedStation={setSelectedStation}
                selectedStation={selectedStation}
                selectedRoute={selectedRoute}
                setSelectedRoute={setSelectedRoute}
                refreshState={refresh}
                setRefreshState={setRefresh}
                selectedNumber={selectedNumber}
                setSelectedNumber={setSelectedNumber}
                upcoming={upcoming} 
                setUpcoming={setUpcoming}
                fromStation={fromStation}
                setFromStation={setFromStation}
                toStation={toStation}
                setToStation={setToStation}
              />
              </div>
              <div className='app-train-list-container'>
                <TrainList className = 'TrainList' 
                    trains={currentTrains}
                    handleTrainClick={handleTrainClick}
                />
              </div>
              <div>
                {showModal && modal}
              </div>
        </div>
    )
}

export default Home;
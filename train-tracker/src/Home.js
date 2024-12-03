import './styles/Home.css';
import React, {useState} from 'react'
import TrainList from './TrainList';
import Search from './Search';
import TrainPopup from './TrainPopup';

import { IoClose } from "react-icons/io5";

function Home({allRoutes, allStations, setRefresh, currentTrains, globalSearchObject, setGlobalSearchObject
}){
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
                setRefreshState={setRefresh}
                globalSearchObject={globalSearchObject}
                setGlobalSearchObject={setGlobalSearchObject}
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
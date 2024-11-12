import './styles/Search.css';
import {useState} from 'react'

function Search({searchFun, routes, stations}){
    const [selectedNumber, setSelectedNumber] = useState("");
    const [selectedRoute, setSelectedRoute] = useState("");
    const [selectedStation, setSelectedStation] = useState("");
    const [upcoming, setUpcoming] = useState(false);
    const [fromStation, setFromStation] = useState("");
    const [toStation, setToStation] = useState("");

    function handleNumber(e){ setSelectedNumber(e.target.value); }
    function handleRoute(e){ setSelectedRoute(e.target.value); }
    function handleStation(e){ setSelectedStation(e.target.value); }
    function handleUpcoming(e){ setUpcoming(e.target.checked); }
    function handleFromStation(e){ setFromStation(e.target.value); }
    function handleToStation(e){ setToStation(e.target.value); }

    const search = () =>{
        searchFun(selectedNumber, selectedRoute, selectedStation, upcoming, fromStation, toStation);
    }

    const clearSearch = () => {
        setSelectedNumber("");
        setSelectedRoute("");
        setSelectedStation("");
        setUpcoming(false);
        setFromStation("");
        setToStation("");
    }

    return (
        <form className='form'>
                <div className='top-label'>
                    Search options: 
                </div>
                <span className="select-label">
                        Train Number:
                        <input className="select-box" value={selectedNumber} onChange={handleNumber} type="number" placeholder="Enter Train Number"></input>
                    </span>
                <span className="select-label">
                        Route:
                        <select className="select-box" value={selectedRoute} onChange={handleRoute} children={routes}></select>
                    </span>
                <span className="select-label">By station: </span>
                    <select className='select-box' value={selectedStation} onChange={handleStation} children={stations}></select>
                    <span className="select-label">
                        Upcoming trains only: 
                        <input checked={upcoming} onChange={handleUpcoming} type="checkbox" ></input>
                    </span>
                
                <span>
                    <button type="button" onClick={search}>Search</button>
                    <button type="button" onClick={clearSearch}>Clear</button>
                </span>
                
                <label className="optional-criteria-label">
                    Optional criteria:
                    <span className="select-label">
                        From:
                        <select className="select-box" value={fromStation} onChange={handleFromStation} children={stations}></select>
                    </span>
                    <span className="select-label">
                        To:
                        <select className="select-box" value={toStation} onChange={handleToStation} children={stations}></select>
                    </span>
                </label>
              </form>
    );
    
}

export default Search;
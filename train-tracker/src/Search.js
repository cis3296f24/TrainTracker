import './styles/Search.css';
import { useState, useEffect } from 'react'

import { IoSearch } from "react-icons/io5";
import { MdClear, MdRefresh, MdFavoriteBorder, MdFavorite } from "react-icons/md";

import { getLocalCache, setRouteToCache, isFavorited, removeRouteFromCache } from './LocalCache';

export function SearchObject(){
    this.number = "";
    this.route = "";
    this.station = "";
    this.upcoming = false;
    this.fromStation = "";
    this.toStation = "";
    this.date = "";
}

function Search({routes, stations, setRefreshState, globalSearchObject, setGlobalSearchObject
}){
    const [searchObject,setSearchObject] = useState(new SearchObject());
    const [currentRouteFavorited, setCurrentRouteFavorited] = useState(false);

    // update local search object when global search is changed
    useEffect(() => {
        setSearchObject(globalSearchObject);
    },[globalSearchObject]);

    useEffect(() => {
        // update favorite button
        if(isFavorited(searchObject.route)){
            setCurrentRouteFavorited(true);
        } else {
            setCurrentRouteFavorited(false);
        }
    },[searchObject.route]);

    const nonFavoriteIcon = <MdFavoriteBorder style={{color:'black'}}/>;
    const favoriteIcon = <MdFavorite style={{color:'red'}}/>;
    
    function handleFavoriteSelection(e){
        if (e.target.value !== "---"){
            setSearchObject({...searchObject, "route": e.target.value})
        }   
    }

    function setToFavorites(){
        if(currentRouteFavorited){
            let res = removeRouteFromCache(searchObject.route)
            if(res===0){
                setCurrentRouteFavorited(false);
            }
        } else {
            let res = setRouteToCache(searchObject.route);
            if(res===0){
                setCurrentRouteFavorited(true);
            }
        }
    }

    const favoriteOptions = () => {
        let favNames = ["---"]
        const cachedTrains = getLocalCache();
        Object.keys(cachedTrains.data).forEach(trainName => {
            favNames.push(trainName)
        });
        const mapping = favNames.map((element, index) => {
            return <option value={element} key={index}>{element}</option>})
        return mapping;
    }

    // search just sets global 
    const search = (event) =>{
        event.preventDefault();
        setGlobalSearchObject(searchObject);
    }

    const clear = () => {
        setGlobalSearchObject(new SearchObject());
    }

    const refresh = () => {
        setRefreshState(true);
    }

    return (
        <form className='form' onSubmit={search}>
                <label className="favorites-dropdown-selection">
                        <span className="select-label">
                        Favorites:
                        <select className="favorites-dropdown" onClick={handleFavoriteSelection}>{favoriteOptions()}</select>
                        </span>
                    </label>

                <div className='top-label'>
                    Search Options: 
                </div>
                <span className="select-label">
                        Number:
                        <input className="select-box" value={searchObject.number} type="number" min='1' onChange=
                            // onChange: set local search object to a copy of itself with the property changed
                            {e => setSearchObject({...searchObject, "number": e.target.value})}
                        />
                    </span>
                <span className="select-label">
                        Route:
                        <select className="select-box" value={searchObject.route} children={routes} onChange=
                            {e => setSearchObject({...searchObject, "route": e.target.value})}
                        />
                        <div onClick={setToFavorites} className='form-button' style={{border:'none'}}>{currentRouteFavorited ? favoriteIcon : nonFavoriteIcon}</div>
                    </span>
                <span className="select-label">
                        Station:
                        <select className='select-box' value={searchObject.station} children={stations} onChange=
                            {e => setSearchObject({...searchObject, "station": e.target.value})}
                        />
                    </span>
                <span className="select-label">
                        Upcoming trains only: 
                        <input checked={searchObject.upcoming} type="checkbox" onChange=
                            {e => setSearchObject({...searchObject, "upcoming": e.target.checked})}
                        />
                    </span>

                <span className="select-label">
                        To:
                        <select className="select-box" value={searchObject.toStation} children={stations} onChange=
                            {e => setSearchObject({...searchObject, "toStation": e.target.value})}
                        />
                    </span>
                
                <span className="select-label">
                        From:
                        <select className="select-box" value={searchObject.fromStation} children={stations} onChange=
                            {e => setSearchObject({...searchObject, "fromStation": e.target.value})}
                        />
                    </span>

                <span className='button-container'>
                    <div onClick={search} className='form-button'>Search <IoSearch/></div>
                    <div onClick={clear} className='form-button'>Clear <MdClear/></div>
                    <div onClick={refresh} className='form-button'>Refresh <MdRefresh/></div>
                </span>
              </form>
    );
    
}

export default Search;
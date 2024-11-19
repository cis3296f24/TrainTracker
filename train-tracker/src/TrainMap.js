import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, Polyline} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {TrainPos} from "./TrainInterpolation"
import L from "leaflet";
import { IoTrainOutline } from "react-icons/io5";
import { FaLocationDot } from "react-icons/fa6";
import { FaBuildingUser } from "react-icons/fa6";
import { renderToString } from "react-dom/server";
import colormap from "colormap";
import './styles/Map.css';

// Fix default icon issue
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import TrainPin from "./TrainPin";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const TrainMap = ({trains, userLocation, selectedStation, selectedRoute}) => {
    const [railLines, setRailLines] = useState(null);
    const [stations, setStations] = useState(null);
    const [routes, setRoutes] = useState(null);
    // const [trains, setTrains] = useState([]);
    // const [trainColors, setTrainColors] = useState({}); // Commented out trainColors state
    // const apiInstance = useRef(new APIInstance());
    const mapRef = useRef();

    useEffect(() => {
        fetch("/TrainTracker/geojson/amtrak-track.geojson")
            .then(response => response.json())
            .then(data => setRailLines(data));

        fetch("/TrainTracker/geojson/amtrak-stations.geojson")
            .then(response => response.json())
            .then(data => setStations(data));


        fetch("/TrainTracker/geojson/NTAD_Amtrak_Routes_flipped.json")
            .then(response => response.json())
            .then(data => setRoutes(data));

        const handleResize = () => {
            if (mapRef.current) {
                mapRef.current.invalidateSize();
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const updateTrainData = () => {
        // removed update button functionality temporarily
        //apiInstance.current.update();
        //setTrains(apiInstance.current.trains || []);
    };

        // Commented out the logic for assigning random colors
        /*
        setTrainColors(prevColors => {
            const updatedColors = { ...prevColors };
            newTrains.forEach(train => {
                if (!updatedColors[train.number]) {
                    updatedColors[train.number] = getRandomColor();
                }
            });
            return updatedColors;
        });
        */

    /*useEffect(() => {
        apiInstance.current.onUpdated = updateTrainData;
        updateTrainData();
        const intervalId = setInterval(updateTrainData, 600000);

        return () => clearInterval(intervalId);
    }, []);*/

    // Commented out getRandomColor function
    /*
    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };
    */

    // Apply a static blue color to TrainIcon
    const TrainIcon = () => (
        <div className="custom-icon-container" style={{ color: "blue" }}>
            <IoTrainOutline size={20} />
        </div>
    );

    const UserLocationIcon = () => (
        <div className="custom-icon-container" style={{ color: "red" }}>
            <FaLocationDot size={20} />
        </div>
    );

    const SelectedStationIcon = () => (
        <div className="custom-icon-container" style={{ color: "black" }}>
            <FaBuildingUser size={20} />
        </div>
    );

    function UserLocationMarker(){
        if (userLocation){
            return (
                <Marker
                    key={'userLocation'}
                    position={[userLocation.coords.latitude, userLocation.coords.longitude]}
                    icon={L.divIcon({
                        html: renderToString(<UserLocationIcon />),
                        className: 'custom-icon',
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    })}>

                    <Popup>
                        <p>Your location.</p>
                    </Popup>
                </Marker>)
        }
    }

    function SelectedStationMarker(){
        if (selectedStation){
            return (
                <Marker
                    key={'selectedStation'}
                    position={[selectedStation.lat, selectedStation.lon]}
                    icon={L.divIcon({
                        html: renderToString(<SelectedStationIcon />),
                        className: 'custom-icon',
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    })}>

                    <Popup>
                        <strong>Selected Station</strong>
                        <p>{selectedStation.stationCode} - {selectedStation.stationName ? selectedStation.stationName : selectedStation.name}</p>
                    </Popup>
                </Marker>)
        }
    }

    function RouteLines(){
        if (routes){
            let colors = colormap({
                colormap: 'jet',
                nshades: routes.length,
                format: 'hex',
                alpha: 1
            });
            let routesToDisplay = routes.features;
            const name_map = new Map([
                ['Amtrak Cascades', 'Cascades'],
                ['Carolinian / Piedmont', 'Carolinian'],
                ['Downeaster', 'The Downeaster'],
                ['Hiawatha', 'Hiawathas'],
                ['Illinois Service', 'Illini (Illinois_Service)'],
                ['Keystone', 'Keystone Service'],
                ['Lincoln Service Missouri River Runner', 'Kansas City - St. Louis (Missouri River Runner)'],
                ['Missouri River Runner', 'Kansas City - St. Louis (Missouri River Runner)'],
                ['Michigan Services', 'Wolverines (Michigan_Services)'],
                ['Northeast Regional', 'Regional'],
                ['Silver Service / Palmetto', 'Palmetto'],
            ]);

            if (selectedRoute){
                if (name_map.has(selectedRoute)){
                    routesToDisplay = routes.features.filter((feature) => feature.properties.name === name_map.get(selectedRoute));
                }
                else{
                    routesToDisplay = routes.features.filter((feature) => feature.properties.name === selectedRoute)
                }

            }
            if (routesToDisplay){
                return (<div>
                    {routesToDisplay.map((feature) => {
                        return(<Polyline positions={feature.geometry.coordinates} pathOptions={{ color: colors[feature.id-1], weight:'5'}} key={feature.properties.name}>
                            {<Popup>
                                {feature.properties.name}
                            </Popup>}
                        </Polyline>)
                    })}
                </div>)
            }
        }
        else{
            return <div></div>
        }
    }

    function TrainMarkers() {
        if(trains.length !== 0){
            return(
                <div>
                    {trains.map((train,index) =>
                        <TrainPin train={train} key={index} trackData={railLines}/>
                    )}
                </div>
            )
        } else {
            return <div></div>;
        }   
    }

    return (
        <>
        <button onClick={updateTrainData}>Refresh Trains</button>
        <MapContainer
            ref={mapRef}
            center={[39.8283, -98.5795]}
            zoom={4}
            style={{ width: "100%", height: "100%" }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {railLines && (
                <GeoJSON data={railLines} style={{ color: "black", weight: 1 }} />
            )}
            {stations && (
                <GeoJSON
                    data={stations}
                    pointToLayer={(feature, latlng) =>
                        L.circleMarker(latlng, { radius: 1, color: "red" })
                    }
                />
            )}
            <RouteLines/>
            <TrainMarkers/>
            <UserLocationMarker/>
            <SelectedStationMarker/>
        </MapContainer>
     </>
    );
};

export default TrainMap;

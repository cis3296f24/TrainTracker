import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline} from "react-leaflet";
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

const TrainMap = ({trains, userLocation, selectedStation, selectedFromStation, selectedToStation, selectedRoute}) => {
    const [routes, setRoutes] = useState(null);
    const mapRef = useRef();
    

    useEffect(() => {

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

    function SelectedStationMarker({station, name}){
        if (station){
            return (
                <Marker
                    key={'selectedStation'}
                    position={[station.lat, station.lon]}
                    icon={L.divIcon({
                        html: renderToString(<SelectedStationIcon />),
                        className: 'custom-icon',
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    })}>

                    <Popup>
                        <strong>{name}</strong>
                        <p>{station.stationCode} - {station.stationName ? station.stationName : station.name}</p>
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
                        <TrainPin train={train} index={index} trackData={railLines}/>
                    )}
                </div>
            )
        } else {
            return <div></div>;
        }   
    }

    return (
        <>
        <div className="full-map-page">
            <div className="map-container">
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
                    <RouteLines/>
                    <TrainMarkers/>
                    <UserLocationMarker/>
                    <SelectedStationMarker station={selectedToStation} name="To Station"/>
                    <SelectedStationMarker station={selectedStation} name="Selected Station"/>
                    <SelectedStationMarker station={selectedFromStation} name="From Station"/>
                </MapContainer>
            </div>
        </div>

     </>
    );
};

export default TrainMap;

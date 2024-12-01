import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import '../styles/Map.css';
import MapTrainMarkers from "./TrainMarkers";
import UserLocationMarker from "./UserLocationMarker";
import SelectedStationMarker from "./SelectedStationMarker";
import RouteLines from "./RouteLines";
// Fix default icon issue
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const TrainMap = ({trains, userLocation, selectedStation, mapRoute}) => {
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
                    <RouteLines routes={routes} mapRoute={mapRoute}/>
                    <MapTrainMarkers trains={trains}/>
                    <UserLocationMarker userLocation={userLocation}/>
                    <SelectedStationMarker selectedStation={selectedStation}/>
                </MapContainer>
            </div>
        </div>

     </>
    );
};

export default TrainMap;

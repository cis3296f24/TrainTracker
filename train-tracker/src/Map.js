import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {TrainPos} from "./TrainInterpolation"
import L from "leaflet";
import { IoTrainOutline } from "react-icons/io5";
import { renderToString } from "react-dom/server";
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

const Map = ({trains}) => {
    const [railLines, setRailLines] = useState(null);
    const [stations, setStations] = useState(null);
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
            <TrainMarkers/>
        </MapContainer>
     </>
    );
};

export default Map;

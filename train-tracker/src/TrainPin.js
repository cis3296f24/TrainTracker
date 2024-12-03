import {TrainFollower} from "./TrainInterpolation"
import L from "leaflet";
import {renderToString} from "react-dom/server";
import {Marker, Popup} from "react-leaflet";
import React, {useState, useRef, useEffect} from "react";
import {IoTrainOutline} from "react-icons/io5";

const MARKER_ANIM_INTERVAL_MS = 100

function TrainPin({train, trackData, index}) {
    const [position, setPosition] = useState([train.lat, train.lon]);
    const follower = useRef(null);

    useEffect(() => {
        if(train == null || trackData == null) return;

        follower.current = new TrainFollower(train, trackData);
        const refreshTimer = setInterval(() => setPosition(follower.current.getLatLon()), MARKER_ANIM_INTERVAL_MS)

        return () => clearInterval(refreshTimer);
    }, [train, trackData])

    const TrainIcon = () => (
        <div className="custom-icon-container" style={{ color: "blue" }}>
            <IoTrainOutline size={20} />
        </div>
    );
    return <Marker
        key={index}
        position={position}
        icon={L.divIcon({
            html: renderToString(<TrainIcon />),
            className: 'custom-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        })}
        eventHandlers={{
            mouseover: (event) => event.target.openPopup(),
            mouseout: (event) => event.target.closePopup()
        }}
    >
        <Popup>
            <strong>{train.routeName}</strong> - Train #{train.number}
            <br />
            Speed: {Math.round(train.speed)} mph
            <br />
            Punctuality: {train.punctuality}
            <br />
            Last update: {new Date(train.lastUpdate).toLocaleString()}
        </Popup>
    </Marker>
}

export default TrainPin;
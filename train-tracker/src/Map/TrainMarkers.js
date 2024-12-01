import { IoTrainOutline } from "react-icons/io5";
import { Marker, Popup} from "react-leaflet";
import L from "leaflet";
import { renderToString } from "react-dom/server";

const TrainIcon = () => (
    <div className="custom-icon-container" style={{ color: "blue" }}>
        <IoTrainOutline size={20} />
    </div>
);

const MapTrainMarkers = ({trains}) => { 
    if(trains.length !== 0){
        return(
            <div>
                {trains.map((train,index) =>
                    <Marker
                        key={index}
                        position={[train.lat, train.lon]}
                        icon={L.divIcon({
                            html: renderToString(<TrainIcon />),
                            className: 'custom-icon',
                            iconSize: [30, 30],
                            iconAnchor: [15, 15]
                        })}
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
                )}
            </div>
        )
    } else {
        return <div></div>;
    }   
}

export default MapTrainMarkers;
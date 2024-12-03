import './styles/TrainInfo.css';
import { isFavorited } from './LocalCache';
import {Link} from 'react-router-dom';
import { FaRegShareFromSquare } from "react-icons/fa6";
import {useState} from 'react'

function TrainInfo({train}){
    const [copiedPopup, setCopiedPopup] = useState(false);

    const renderedStops = train.stations.map((s) => {
        let arrivalStyle = "";
        let departureStyle = "";
        

        if(!s.hasArrived) {
            arrivalStyle = s.arrivalPunctuality?.endsWith("LATE") ? "late" : "ontime";
        }
        if(!s.hasDeparted) {
            departureStyle = s.departurePunctuality?.endsWith("LATE") ? "late" : "ontime";
        }

        return <tr key={s.stationCode}>
                <td>{s.stationCode}</td>
                <td className={arrivalStyle}>{s.arrivalTime ? (s.hasArrived ? "" : "Estimated: ") + s.arrivalTime : ""}</td>
                <td className={departureStyle}>{s.departureTime ? ((s.hasDeparted) ? "" : "Estimated: ") + s.departureTime : ""}</td>
            </tr>
        })
    let punctualityClassName = train.punctuality?.endsWith('LATE') ? 'late' : 'ontime';
    let punctualityToDisplay = train.punctuality?.replace('MI', 'min.').replace('HR', 'hr.').toLowerCase();

    const trainLink =`/trains/${train.number}?date=${encodeURIComponent(train.scheduledDeparture)}`;
    
    const handleShareClick = () => {
        navigator.clipboard.writeText(`I'm on Amtrak train #${train.number}, route ${train.routeName} 🚆! #TrackMyTrain: ${window.location.origin}/TrainTracker#${trainLink}`);

        setCopiedPopup(true);
        setTimeout(() => setCopiedPopup(false), 3000); // Hide popup after 3 seconds
    };

    let favorited = "";
    if(isFavorited(train.routeName)){
        favorited = <em>&#10003; Favorited</em>
    };

    return(
        <div className='train-info'>
            {copiedPopup && <div className="refresh-popup">Copied train info to clipboard!</div>}
            <h2 className='route'><Link to={trainLink} target="_blank">{train.routeName} (#{train.number})</Link>
                <FaRegShareFromSquare size={'1.1em'} className='copy-button' onClick={handleShareClick} />
            </h2>
            <h3 className='direction'>From: {train.from}</h3>
            <h3 className='direction'>To: {train.to}</h3>
            <div className={punctualityClassName} >{punctualityToDisplay}</div>
            <div>Last updated: {train.lastUpdate}</div>
            <div>{favorited}</div>
            <table className="train-table">
                <thead><tr><th>Station</th><th>Arrived</th><th>Departed</th></tr></thead>
                <tbody>{renderedStops}</tbody>
            </table>
        </div>
    )
}

export default TrainInfo;
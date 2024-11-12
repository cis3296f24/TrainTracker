import './styles/TrainInfo.css'

function TrainInfo({train}){
    console.log(train);
    const renderedStops = train.stations.map((s) => {
        let arrivalStyle = "";
        let departureStyle = "";

        if(!s.hasArrived) {
            arrivalStyle = s.arrivalPunctuality?.endsWith("LATE") ? "late" : "ontime";
        }
        if(!s.hasDeparted) {
            departureStyle = s.departurePunctuality?.endsWith("LATE") ? "late" : "ontime";
        }

        return <tr>
                <td>{s.stationCode}</td>
                <td className={arrivalStyle}>{s.arrivalTime ? (s.hasArrived ? "" : "Estimated: ") + s.arrivalTime : ""}</td>
                <td className={departureStyle}>{s.departureTime ? ((s.hasDeparted) ? "" : "Estimated: ") + s.departureTime : ""}</td>
            </tr>
        })
    let punctualityClassName = train.punctuality === 'ON TIME' ? 'ontime' : 'late';
    return(
        <div className='train-info'>
            <h2 className='route'>{train.routeName} (#{train.number})</h2>
            <h3 className='direction'>From: {train.from}</h3>
            <h3 className='direction'>To: {train.to}</h3>
            <div className={punctualityClassName} >{train.punctuality}</div>
            <div>Last updated: {train.lastUpdate}</div>
            <table>
                <thead><tr><th>Station</th><th>Arrived</th><th>Departed</th></tr></thead>
                <tbody>{renderedStops}</tbody>
            </table>
        </div>
    )
}

export default TrainInfo;
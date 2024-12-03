import './styles/TrainList.css';

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SearchObject } from './Search';
import { filterTrains } from './functionality/app';

import TrainInfo from './TrainInfo';

function TrainPage({allTrains}){
    const location = useLocation();
    const [isLoading,setIsLoading] = useState(true);

    const [number,setNumber] = useState("");
    const [date,setDate] = useState("");

    const [selectedTrains,setSelectedTrains] = useState([]);

    function findTrain(){
        let search = new SearchObject();
        search.number = number;
        search.date = date;
        let trains = filterTrains(allTrains,search);
        setSelectedTrains(trains);
    }

    // wait for allTrains to load
    if(isLoading){
        if(allTrains.length > 0){
            findTrain();
            setIsLoading(false);
        }
    }

    // updates on window location change
    useEffect(() =>{
        let url = window.location.href;
        let split = url.split("/");
        let params = split[split.length -1];

        if (params.includes("?date=")){
            let [n,d] = params.split("?date=");
            setNumber(n);
            setDate(decodeURIComponent(d));
        } else {
            setNumber(params);
            setDate("");
        }
    },[location])

    // updates on number or date change
    useEffect(() => {
        if(!isLoading){
            findTrain();
        } 
    },[number,date])

    let content = <h2>No Trains Found</h2>
    

    if(isLoading){
        content=<h2>Loading...</h2>
    }

    // Multiple Results
    if (selectedTrains.length > 1){
        content = <Tiebreaker trains={selectedTrains}/>
    } 
    
    if (selectedTrains.length == 1){
        content = <TrainInfo train={selectedTrains[0]}/>
    }

    return(
        <div className="train-page">
            {content}
        </div>
    )
}

function Tiebreaker(t){
    function MakeTrain({train}){
        const navigate = useNavigate();

        const handleClick = () => {
            navigate("/trains/"+train.number+"?date="+encodeURIComponent(train.scheduledDeparture));
        }

        return (
            <tr onClick={handleClick} className="train-row">
                <td>{train.routeName} #{train.number}</td>
                <td>{train.scheduledDeparture}</td>
                <td>{train.from}</td>
                <td>{train.to}</td>
            </tr>
        );
    }
    return(
        <div className='tiebreaker'>
            <h2>Multiple Results ({t.trains.length}):</h2>
            <div className="train-list-container">
                <table className="train-list">
                    <thead>
                        <tr>
                            <th>Train Name</th>
                            <th>Departed At</th>
                            <th>From</th>
                            <th>To</th>
                        </tr>
                    </thead>
                    <tbody>
                        {t.trains.map((t,index) =>
                            <MakeTrain train={t} key={index}/>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default TrainPage;
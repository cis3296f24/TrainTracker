import React from 'react';
import './styles/TrainList.css';

function TrainList({trains, handleTrainClick}){

    function MakeTrain({train}){
        const status = train.punctuality?.replace('MI', 'min.').replace('HR', 'hr.').toLowerCase();

        let punctualityClassName = train.punctuality?.endsWith('LATE') ? 'late' : 'ontime';

        const handleClick = () => {
            handleTrainClick(train);
        }

        return (
            <tr onClick={handleClick} className="train-row">
                <td>#{train.number}</td>
                <td>{train.routeName}</td>
                <td>{train.from}</td>
                <td>{train.to}</td>
                <td className={punctualityClassName}>{status}</td>
            </tr>
        );
    }

    if (trains.length !== 0){
        return (
            <div className="train-list-container">
                <table className="train-list">
                    <thead>
                        <tr>
                            <th>Train Number</th>
                            <th>Line Name</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trains.map(t =>
                            <MakeTrain train={t} 
                            key={`${t.heading} ${t.number} ${t.lastVisitedStation}`}/>
                        )}
                    </tbody>
                </table>
            </div>
        );
    } else {
        return (
            <div>
                <table className="train-list">
                <thead>
                        <tr>
                            <th>Train Number</th>
                            <th>Line Name</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                </table>
                <h3>Oops! It looks like we couldn't find the train you were looking for &#128647;</h3>
            </div>
        )
    }
}

export default TrainList;
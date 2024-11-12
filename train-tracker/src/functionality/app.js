export function filterTrains(allTrains, selectedNumber, selectedRoute, selectedStation, upcoming, fromStation, toStation) {
    let trains = allTrains;
    if (selectedNumber > 0){
        trains = trains.filter(t => t.number === selectedNumber)
    } if (selectedRoute){
        trains = trains.filter(t => t.routeName === selectedRoute)
    } if (selectedStation){
        trains = trains.filter((t) => (t.stations.findIndex((station) => station.stationCode === selectedStation) !== -1));
        if (upcoming){
            trains = trains.filter((t) => {
                let station = t.stations.find((station) => station.stationCode === selectedStation);
                if (station.stationCode === t.from && station.hasDeparted){
                    return undefined;
                }
                if (!station.hasArrived || !station.hasDeparted){
                    return t;
                }
            })
        }
    } if (fromStation && toStation){
        trains = trains.filter((t) =>{
            return t.stations.findIndex((station) => station.stationCode === fromStation) < t.stations.findIndex((station) => station.stationCode === toStation);
        })
    }
    // sort results by number (ascending)
    trains = sortTrains(trains, (a,b) => a.number - b.number);
    return trains;
}

function sortTrains(trains, sortingCriteria){
    return trains.sort(sortingCriteria);
}
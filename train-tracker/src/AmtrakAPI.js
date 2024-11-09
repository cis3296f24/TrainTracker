//Client-Side Objects and Functions for reading/manipulating decoded data returned from server

const API_HOST = process.env.REACT_APP_API_HOST;

/**
 * Represents a Station as seen by a Train
 * found in a train's {@link Train.stations} member
 * @constructor
 * */
function Station() {
    this.stationCode = null;
    // this.getStationName = function(){
        //use table to convert from 3-letter codes
    // }

    this.hasArrived = false;
    this.hasDeparted = false;

    //if hasDeparted and/or hasArrived are false, departureTime and arrivalTime are estimates

    this.arrivalTime = null;
    this.departureTime = null;

}

/**
 * Information about a train, including:
 * list of scheduled [stations]{@link Station}
 * train number
 * speed,
 * heading,
 * punctuality,
 * route name,
 * etc.
 *
 * will include helper functions to determine gps coords, eta for a given station name, etc.
 * @constructor
 */
function Train() {
    this.number = null;
    this.routeName = null;
    this.from = null;
    this.to = null;
    this.speed = null;
    this.heading = null;
    this.lastUpdate = null;
    this.lastVisitedStation = null;
    this.punctuality = null;
    this.state = null;
    this.stations = [];//of type StationInfo[]
    this.toString = function() {
        return this.routeName + " Train #" + this.number +
            "\nGoing " + Math.trunc(this.speed) + " Mph Heading " + this.heading + " from " + this.from + " to " + this.to +
            "\nReported running " + this.punctuality + " by most recently visited stop " + this.lastVisitedStation + 
            "\nStation List: " + this.stations.map(station => station.stationCode).join(", ");
    }
}

/**
 * For managing data from amtrak api
 * includes functions like getting filtered lists of trains, updating data
 * @constructor
 */
function APIInstance() {
    this.lastUpdate = null;
    this.trains = null;
    this.routes = null;
    this.stations = null;

    /**
     * user-defined function gets called when dataset is updated
     */
    this.onUpdated = function(){};
    this.update = function() {
        if(this.routes === null) {
            getRoutesJSONData().then(data => {
                this.routes = data;
            })
        }
        if(this.stations === null) {
            getStationsJSONData().then(data => {
                this.stations = data;
            })
        }
        getTrainList().then(data => {
            this.trains = data;
            this.lastUpdate = Date.now();
            this.onUpdated();
        })
    }
}


async function getTrainsJSONData() {
    return fetch(API_HOST + "/getTrains").then(
        res => res.json()
    )
}

async function getRoutesJSONData() {
    return fetch(API_HOST + "/getRoutes").then(
        res => res.json()
    )
}

async function getStationsJSONData() {
    return fetch(API_HOST + "/getStations").then(
        res => res.json()
    )
}


async function getTrainList() {
    let apiData = await getTrainsJSONData();

    let trainList = new Array(apiData.features.length);

    for(let i = 0; i < apiData.features.length; i++) {
        let train = apiData.features[i].properties;

        let lastStationReport = null;
        let nextStationReport = null;
        let lastStationIndex = -1;

        for(let stationNumber = 1; stationNumber <= 20; stationNumber++) {
            let currentStation = train["Station"+stationNumber];
            if(currentStation == null) break;
            currentStation = JSON.parse(currentStation);

            if(currentStation.postdep == null) {
                lastStationIndex = stationNumber - 2;
                nextStationReport = currentStation;
                break;
            }
            lastStationReport = currentStation;
        }

        let stations = [];
        for(let stationNum = 1; stationNum <= 40; stationNum++) {
            let currentStation = train["Station"+stationNum];
            currentStation = JSON.parse(currentStation);
            if(currentStation == null) break;

            let station = new Station();
            station.stationCode = currentStation.code;
            station.hasArrived = currentStation.postarr != null;
            station.hasDeparted = currentStation.postdep != null;
            station.arrivalTime = currentStation.postarr;
            station.departureTime = currentStation.postdep;
            stations.push(station);
        }

        if(lastStationReport == null) {
            lastStationReport = nextStationReport
        }


        const tempTrain = new Train()
        tempTrain.number = train.TrainNum;
        tempTrain.routeName = train.RouteName
        tempTrain.speed = train.Velocity;
        tempTrain.heading = train.Heading;
        tempTrain.from = train.OrigCode;
        tempTrain.to = train.DestCode;
        tempTrain.scheduledDeparture = train.OrigSchDep;
        tempTrain.lastUpdate = train.updated_at;
        tempTrain.punctuality = lastStationReport.postcmnt;
        tempTrain.lastVisitedStation = lastStationIndex;
        tempTrain.state = train.TrainState;
        tempTrain.stations = stations;

        trainList[i] = tempTrain;
    }

    return trainList;
}

module.exports = {
    Station,
    Train,
    APIInstance
}

getTrainsJSONData().then(data => {
    console.log(data.features[0]);
});

const trainData = new APIInstance()
trainData.onUpdated = function () {
    for(let train of trainData.trains) {
        console.log(train.toString());
    }
    for(let route of trainData.routes) {
        console.log(route);
    }
}
trainData.update()

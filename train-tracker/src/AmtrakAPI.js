//Client-Side Objects and Functions for reading/manipulating decoded data returned from server

const API_HOST = process.env.REACT_APP_API_HOST;

/**
 * Represents a Stop as seen by a Train
 * found in a train's {@link Train.stations} member
 * @constructor
 * */
function Stop() {
    this.stationCode = null;
    // this.getStationName = function(){
        //use table to convert from 3-letter codes
    // }

    this.hasArrived = false;
    this.hasDeparted = false;

    //if hasDeparted and/or hasArrived are false, departureTime and arrivalTime are estimates

    this.arrivalTime = null;
    this.departureTime = null;

    this.arrivalPunctuality = null;
    this.departurePunctuality = null;
}

/**
 * represents a station
 * @constructor
 */
function Station() {
    this.stationCode = null;
    this.name = null;

    this.addr1 = null;
    this.addr2 = null;
    this.city = null;
    this.state = null;
    this.zip = null;

    this.lat = null;
    this.lon = null;
}

/**
 * Information about a train, including:
 * list of scheduled [stops]{@link Stop}
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
    this.lat = null;
    this.lon = null;
    this.state = null;
    this.stations = [];//of type Stop[]
    this.toString = function () {
        return this.routeName + " Train #" + this.number +
            "\nGoing " + Math.trunc(this.speed) + " Mph Heading " + this.heading + " from " + this.from + " to " + this.to +
            "\nReported running " + this.punctuality + " by most recently visited stop " + this.lastVisitedStation +
            "\nLat: " + this.lat + " Lon: " + this.lon +
            "\nStation List: " + this.stations.map(station => station.stationCode).join(", ");
    }
}

function stationFromRaw(data) {
    const station = new Station();

    station.stationCode = data.Code;
    station.name = data.StationName;
    station.addr1 = data.Address1;
    station.addr2 = data.Address2;
    station.city = data.City;
    station.state = data.State;
    station.zip = data.Zipcode;
    station.lon = data.lon;
    station.lat = data.lat;

    return station;
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
                if(this.trains !== null && this.stations !== null) {
                    this.onUpdated()
                }
            })
        }
        if(this.stations === null) {
            getStationsJSONData().then(data => {
                this.stations = data.StationsDataResponse.features.map(m => stationFromRaw(m.properties));
                if(this.trains !== null && this.routes !== null) {
                    this.onUpdated()
                }
            })
        }
        getTrainList().then(data => {
            this.trains = data;
            this.lastUpdate = Date.now();
            if(this.routes !== null && this.stations !== null) {
                this.onUpdated();
            }
        })
    }

    this.getStationInfo = function(stationCode) {
        return this.stations.find(station => station.stationCode === stationCode).name;
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

            let station = new Stop();
            station.stationCode = currentStation.code;
            station.hasArrived = currentStation.postarr != null;
            station.hasDeparted = currentStation.postdep != null;
            if(station.hasArrived) {
                station.arrivalTime = currentStation.postarr;
            } else {
                station.arrivalTime = currentStation.estarr;
                station.arrivalPunctuality = currentStation.estarrcmnt
            }
            if(station.hasDeparted) {
                station.departureTime = currentStation.postdep;
            } else {
                station.departureTime = currentStation.estdep;
                station.departurePunctuality = currentStation.estdepcmnt;
            }
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
        tempTrain.lat = apiData.features[i].geometry.coordinates[1]; //Flipped because AmtrakAPI has flipped lat-long
        tempTrain.lon = apiData.features[i].geometry.coordinates[0]; //Flipped because AmtrakAPI has flipped lat-long
        tempTrain.stations = stations;

        trainList[i] = tempTrain;
    }

    return trainList;
}

module.exports = {
    Station,
    Stop,
    Train,
    APIInstance
}

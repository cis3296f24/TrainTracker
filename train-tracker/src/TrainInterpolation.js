function dist(p1, p2) {
    return Math.sqrt((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2)
}

function featureByID(trackData, node) {
    return trackData.features.find(feature => {
        return feature.properties.FRFRANODE === node;
    })
}
function previousFeature(trackData, node) {
    return trackData.features.find(feature => {
        return feature.properties.TOFRANODE === node;
    })
}

function TrainFollower(train, trackData) {
    const MILES_PER_DEGREE = 1/69;
    this.train = train;
    this.stationLocked = false;
    this.time0 = Date.parse(train.lastUpdate);
    this.estlat = train.lat;
    this.estlon = train.lon;
    this.currentSegment = null;
    this.nextSegment = null;
    this.accumulatedSegmentMiles = 0;
    this.followForward = true;
    let closestOriginNode = {
        distance: Number.POSITIVE_INFINITY,
        coordIndex: 0,
        lat: 0,
        lon: 0,
        segmentID: 0,
        toSegment: 0,
        segmentLength: 0
    };
    this.getLatLon = function() {
        //TODO: consistent train speed
        if(this.stationLocked) {
            return [this.estlat, this.estlon];
        }

        const dTime = Date.now() - this.time0;
        let dMiles = train.speed * (dTime)/3600000;

        //advance to projected segment
        while(dMiles >= this.accumulatedSegmentMiles) {
            this.currentSegment = this.nextSegment;

            if(this.currentSegment == null) {
                this.stationLocked = true;
                return [this.estlat, this.estlon];
            }

            this.accumulatedSegmentMiles += this.currentSegment.properties.MILES;
            this.nextSegment = this.followForward ? featureByID(trackData, this.currentSegment.properties.TOFRANODE) : previousFeature(trackData,this.currentSegment.FRFRANODE);
            console.log("moved to next segment")
        }

        let milesIntoSegment = this.accumulatedSegmentMiles - dMiles;

        let segmentCoords = this.currentSegment.geometry.coordinates;

        let coordFactor = milesIntoSegment / this.currentSegment.properties.MILES;

        let indexFactor = coordFactor * (segmentCoords.length - 1)



        let fromCoord;
        let toCoord;
        let coordIndex;
        let interpolateFactor;

        if(!this.followForward) {
            coordIndex = Math.ceil(indexFactor);
            if(coordIndex === 0) {
                coordIndex -= 1;
                return [this.estlat, this.estlon];
            }
            fromCoord = segmentCoords[coordIndex];
            toCoord = segmentCoords[coordIndex - 1];
            interpolateFactor = coordIndex - indexFactor;
        } else {
            coordIndex = Math.floor(segmentCoords.length - indexFactor - 1);
            if(coordIndex > segmentCoords.length - 1) {
                coordIndex -= 1;
                return [this.estlat, this.estlon];
            }
            fromCoord = segmentCoords[coordIndex];
            toCoord = segmentCoords[coordIndex + 1];
            interpolateFactor = 1 - (indexFactor - Math.floor(indexFactor));
        }


        this.estlat = fromCoord[1] * (1 - interpolateFactor) + toCoord[1] * interpolateFactor;
        this.estlon = fromCoord[0] * (1 - interpolateFactor) + toCoord[0] * interpolateFactor;

        return [this.estlat, this.estlon];
    }

    if(train.state !== "Active") {
        this.stationLocked = true;
        return;
    }

    const CULLING_THRESHOLD = 5 * MILES_PER_DEGREE;//search only within 5 miles of train

    //TODO: detect proximity to stations
    let closeToStation = false;
    if(closeToStation) {
        this.stationLocked = true;
        return;
    }

    for(let [featureIndex, feature] of trackData.features.entries()) {
        for(let [coordIndex, coord] of feature.geometry.coordinates.entries()) {
            //ignore obvious non-matches
            if(Math.abs(coord[0] - train.lon) > CULLING_THRESHOLD) continue;
            if(Math.abs(coord[1] - train.lat) > CULLING_THRESHOLD) continue;

            let distance = dist(coord, [train.lon, train.lat])
            if(closestOriginNode.distance > distance) {
                closestOriginNode = {
                    distance: distance,
                    featureIndex: featureIndex,
                    coordIndex: coordIndex,
                    lat: coord[1],
                    lon: coord[0],
                    segmentID: feature.properties.FRFRANODE,
                    toSegment: feature.properties.TOFRANODE,
                    segmentLength: feature.properties.MILES
                }
            }
        }
    }

    this.currentSegment = featureByID(trackData, closestOriginNode.segmentID);
    if(this.currentSegment == null) {
        this.stationLocked = true;
        return;
    }

    this.accumulatedSegmentMiles = this.currentSegment.properties.MILES;

    let currentFeatureCoords = trackData.features[closestOriginNode.featureIndex].geometry.coordinates

    let prevCoord;
    let nextCoord;
    if(closestOriginNode.coordIndex === 0) {
        let prevSegment = previousFeature(trackData, closestOriginNode.segmentID);
        let lastCoordIndex = prevSegment.geometry.coordinates.length - 1;
        prevCoord = prevSegment.geometry.coordinates[lastCoordIndex];
    } else {
        prevCoord = currentFeatureCoords[closestOriginNode.coordIndex - 1]
    }
    if(closestOriginNode.coordIndex === currentFeatureCoords.length-1) {
        let nextSegment = featureByID(trackData, closestOriginNode.toSegment);
        if(nextSegment == null) {
            nextCoord = currentFeatureCoords[closestOriginNode.coordIndex];
        } else {
            nextCoord = nextSegment.geometry.coordinates[0];
        }
    } else {
        nextCoord = currentFeatureCoords[closestOriginNode.coordIndex + 1];
    }

    let trackdx = nextCoord[0] - prevCoord[0];
    let trackdy = nextCoord[1] - prevCoord[1];

    let traindx = 0;
    let traindy = 0;

    if(train.heading == null) {
        this.stationLocked = true;
        return;
    }

    if(train.heading.includes("N")) traindy = 1;
    if(train.heading.includes("S")) traindy = -1;
    if(train.heading.includes("W")) traindx = -1;
    if(train.heading.includes("E")) traindx = 1;

    this.followForward = trackdx * traindx + trackdy * traindy > 0;

    this.nextSegment = this.followForward ? featureByID(trackData, this.currentSegment.properties.TOFRANODE) : previousFeature(trackData,this.currentSegment.FRFRANODE);
}

module.exports = {
    TrainFollower
}
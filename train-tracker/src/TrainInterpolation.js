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
    const MILES_PER_DEGREE = 69;
    this.train = train;
    this.stationLocked = false;
    this.time0 = Date.parse(train.lastUpdate);
    this.estlat = train.lat ?? 0;
    this.estlon = train.lon ?? 0;
    this.currentSegment = null;
    this.nextSegment = null;
    this.fromCoordIndex = -1;
    this.fromCoord = null;
    this.toCoord = null;
    this.coordMiles = 0;
    this.accumulatedSegmentMiles = 0;
    this.accumulatedCoordMiles = 0;
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
            this.accumulatedCoordMiles = 0;
            this.fromCoordIndex = -1;
            this.coordMiles = 0;
        }

        let segmentCoords = this.currentSegment.geometry.coordinates;

        if(this.fromCoordIndex === -1) {
            this.fromCoordIndex = this.followForward ? -1 : segmentCoords.length;
        }

        const milesIntoSegment = this.currentSegment.properties.MILES - (this.accumulatedSegmentMiles - dMiles);

        //advance to projected fromCoordIndex
        while(milesIntoSegment >= this.accumulatedCoordMiles) {
            if(this.followForward) {
                if(this.fromCoordIndex >= segmentCoords.length - 2) {
                    return [this.estlat, this.estlon];
                }
                this.fromCoordIndex += 1;
                this.toCoord = segmentCoords[this.fromCoordIndex + 1];
            } else {
                if(this.fromCoordIndex <= 2) {
                    return [this.estlat, this.estlon];
                }
                this.fromCoordIndex -= 1;
                this.toCoord = segmentCoords[this.fromCoordIndex - 1];
            }
            this.fromCoord = segmentCoords[this.fromCoordIndex];
            this.coordMiles = dist(this.fromCoord, this.toCoord)*MILES_PER_DEGREE;
            this.accumulatedCoordMiles += this.coordMiles;
        }


        let interpolateFactor = 1 - (this.accumulatedCoordMiles - milesIntoSegment) / this.coordMiles;

        this.estlat = this.fromCoord[1] * (1 - interpolateFactor) + this.toCoord[1] * interpolateFactor;
        this.estlon = this.fromCoord[0] * (1 - interpolateFactor) + this.toCoord[0] * interpolateFactor;

        return [this.estlat, this.estlon];
    }

    if(train.state !== "Active") {
        this.stationLocked = true;
        return;
    }

    const CULLING_THRESHOLD = 5 / MILES_PER_DEGREE;//search only within 5 miles of train

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
        if(prevSegment == null) {
            prevCoord = currentFeatureCoords[closestOriginNode.coordIndex]
        } else {
            let lastCoordIndex = prevSegment.geometry.coordinates.length - 1;
            prevCoord = prevSegment.geometry.coordinates[lastCoordIndex];
        }
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
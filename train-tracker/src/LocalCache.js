const LOCAL_CACHE="LOCAL"

export const getLocalCache=()=>{

    let localCache={
        data:{},
    }  

    try {
        const data=localStorage.getItem(LOCAL_CACHE)

        if(data){
            localCache=JSON.parse(data)
        }
    }
    catch(e){
        console.error(e.message)
    }

    return localCache
}

export const removeRouteFromCache=(selectedRoute)=>{
    if (selectedRoute === ""){
        alert("No route selected");
        return 1;
    }
    const localCache=getLocalCache()
    let data=localCache.data
    delete data[selectedRoute]
    try{
        localStorage.setItem(LOCAL_CACHE,JSON.stringify(localCache))
    }
    catch(e){
        alert("Unable to remove from Favorites");
        return 1;
    }
    return 0;
}

export const setRouteToCache=(selectedRoute)=>{
    if (selectedRoute === ""){
        alert("No route selected");
        return 1;
    }

    const localCache=getLocalCache()
    let data=localCache.data

    const item={
        route:selectedRoute,
    }

    data[selectedRoute]=item

    try{
        localStorage.setItem(LOCAL_CACHE,JSON.stringify(localCache))
    }
    catch(e){
        alert("Unable to Save to Favorites");
        return 1;
    }
    return 0;

}

export const isFavorited=(routeName)=>{
    const localCache = getLocalCache();
    const data = localCache.data;
    if(routeName in data){
        return true;
    }
    return false;
}
function TrainPage(){
    const url = window.location.href;
    const split = url.split("/");
    const params = split[split.length -1];

    return(
        <div>
            <h2>This is the train page</h2>
            <p>Params = {params}</p>
        </div>
    )
}
export default TrainPage;
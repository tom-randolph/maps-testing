const coll = setupFirebase('dev');

function initMap(){
    let map;
    let store = [];
    let placeZone;

    const startLoc = {lat:36.563707, lng:-81.646534};

    map = new google.maps.Map(
        document.getElementById('map'), {center: startLoc, mapTypeId: "satellite",zoom: 14, });

    coll.onSnapshot(snapshot =>{
        store.forEach(zone => zone.hide());
        store = snapshot.docs.map(doc=> new Zone(map, doc.data().bounds, doc.id));
    });

    google.maps.event.addListener(map, 'bounds_changed', (e) =>{
        store.forEach(zone => zone.renderInView());
    })

    google.maps.event.addListener(map,'click', (e)=>
    {   

        if(!placeZone || !placeZone.rendered){
            const pos = e.latLng.toJSON();
            let bounds = {  sw:{lat: pos.lat -.001,
                                lng: pos.lng -.001},
                            ne:
                                {lat: pos.lat +.001,
                                lng: pos.lng +.001}
                        }
            placeZone = new Zone(map, bounds);
        }      
    });
}
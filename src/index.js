const fbConfig = {
    apiKey: "AIzaSyAceP9aR-KV7LSb1_9ESMR9rlUgc6mcE-c",
    authDomain: "tree-maps-7cc04.firebaseapp.com",
    databaseURL: "https://tree-maps-7cc04.firebaseio.com",
    projectId: "tree-maps-7cc04",
    storageBucket: "tree-maps-7cc04.appspot.com",
    messagingSenderId: "332200082190"
  };

firebase.initializeApp(fbConfig);

const db = firebase.firestore();

let store = [];

db.settings({timestampsInSnapshots: true});

const coll = db.collection('testing');

document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelectorAll('#map').length > 0)
    {
      if (document.querySelector('html').lang)
        lang = document.querySelector('html').lang;
      else
        lang = 'en';
  
      var js_file = document.createElement('script');
      js_file.type = 'text/javascript';
      js_file.src = 'https://maps.googleapis.com/maps/api/js?callback=initMap&key=AIzaSyBfcZgz_Mh9avHOvWF_4NJd27ZqGALhiN4';
      document.getElementsByTagName('head')[0].appendChild(js_file);
    }
  });

let map;
let selectors = [];

function initMap() {

    const startLoc = {lat:36.563707, lng:-81.646534};

    map = new google.maps.Map(
        document.getElementById('map'), {center: startLoc, mapTypeId: "satellite",zoom: 18, });

    coll.onSnapshot(snapshot =>{
        store = snapshot.docs.map(doc=>{
            let zone = new Zone(map, doc.data().bounds, doc.id)
            return zone;
        })
    });

    let zone;

    google.maps.event.addListener(map, 'bounds_changed', (e) =>{
        renderZones(store);
    })

    google.maps.event.addListener(map,'click', (e)=>
    {   

        const pos = e.latLng.toJSON();

        let bounds = { sw:{lat: pos.lat -.001,
                            lng: pos.lng -.001},
            ne:
                {lat: pos.lat +.001,
                lng: pos.lng +.001}
            }

        if(!zone || !zone.rendered){zone = new Zone(map, bounds);}
        
    });


}

function renderZones(zones){

    zones.forEach(zone =>{
        zone.renderInView();
    });
}



function updateSelector(sel){
    let i;
    for(; i<selctors.length;i++){
        if(selctors[i].id===sel.id){
            selectors[i]=sel;
            return true
        }

    }
    return false;
}



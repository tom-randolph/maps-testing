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

const coll = db.collection('zones');


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


  class Zone {

    constructor(map, bounds, id='placeholder'){
        this.map = map;
        this.id = id;
        this.bounds = new google.maps.LatLngBounds(bounds.sw,bounds.ne);
        this.isPlaceholder = (this.id==='placeholder') ? true : false;
        this.addMarker(this.isPlaceholder);
        this.addRectangle(this.isPlaceholder);
        this.addInfoWindow(this.isPlaceholder);
    }

    addMarker(active){

        //create (render) the marker

        this.marker = new google.maps.Marker({
            position: this.bounds.getCenter(),
            map: this.map,
            draggable: active,
            opacity: active ? 1 : .5,
            icon: active ? "../img/marker_info_white_xsmall.png" : "../img/marker_info_white_xsmall2.png",
                        
        })

        //implement movement adjustments

        this.marker.addListener('dragstart', ()=> this.marker.setOpacity(.4));

        this.marker.addListener('dragend', ()=>{

            const centerMarker = this.marker.getPosition().toJSON();
            const centerRect = this.rectangle.getBounds().getCenter().toJSON();

            const diff = {lat: centerMarker.lat - centerRect.lat, lng: centerMarker.lng - centerRect.lng}
            let bounds = this.rectangle.getBounds().toJSON();
            bounds.north+= diff.lat;
            bounds.south+= diff.lat;
            bounds.east+= diff.lng;
            bounds.west+= diff.lng;
            this.rectangle.setBounds(bounds);
            this.marker.setOpacity(1)
        });
    } 

    addRectangle(active){


        //create the rectangle (render)

        this.rectangle = new google.maps.Rectangle({
            bounds : this.bounds,
            map: this.map,
            editable: active,
            draggable: active,
                
            });

        //implement movement adjustments
        
        this.rectangle.addListener('dragstart', ()=>{
            this.marker.setOpacity(.4)
        });

        this.rectangle.addListener('dragend', ()=>{
            this.marker.setOpacity(1)
        });

        this.rectangle.addListener('bounds_changed', ()=>{
            this.marker.setPosition(this.rectangle.getBounds().getCenter());
            this.bounds = this.rectangle.getBounds();
        });
        
    }

    addInfoWindow(active){

        //info window content

        const deleteBtn = document.createElement('button');
        deleteBtn.className = "mx-2 btn btn-danger delete";
        deleteBtn.textContent = 'Delete';

        const confirmBtn = document.createElement('button');
        confirmBtn.className = "mx-2 btn btn-success delete";
        confirmBtn.textContent = 'Confirm';
        confirmBtn.style.display = active ? 'inline-block': 'none';

        const editBtn = document.createElement('button');
        editBtn.className = "mx-2 btn btn-primary delete";
        editBtn.textContent = 'Edit';
        editBtn.style.display = active ?'none' : 'inline-block';

        // add event handlers

        deleteBtn.addEventListener('click', ()=>{this.remove()});

        confirmBtn.addEventListener('click', (e)=>{
            confirmBtn.style.display = 'none';
            editBtn.style.display = 'inline-block';
            this._confirm()
        });

        editBtn.addEventListener('click', ()=>{
            editBtn.style.display = 'none';
            confirmBtn.style.display = 'inline-block';
            this._edit()
        });

        //render window

        this.infoWindow = new google.maps.InfoWindow(
            {
            content: `<div id ="${this.id}" class='btn-toolbar'></div>`
            }
        );
    
        if(active) this.infoWindow.open(this.map,this.marker);
        
        //handle dynamic opening

        this.marker.addListener('click', () => this.infoWindow.open(this.map, this.marker));

        //handle dom events

        google.maps.event.addListener(this.infoWindow, 'domready', ()=> {

            const div = document.getElementById(this.id);;
            div.appendChild(confirmBtn);
            div.appendChild(editBtn);
            div.appendChild(deleteBtn);

        });
    }


    remove(){
        coll.doc(this.id).delete().then(()=>{
            this.hide();
        });
    }

    hide(){
        this.infoWindow.close();
        this.marker.setMap(null);
        this.rectangle.setMap(null);
        this.removed = true;
    }

    _confirm(){
        this.infoWindow.close();
        this.marker.setOptions({
            draggable:false,
            opacity:.5,
            icon: "../img/marker_info_white_xsmall2.png"
        });
        this.rectangle.setOptions({
            editable:false,
            draggable: false,
            strokeOpacity:.5,
        });

        this.submit();
        
        
    }

    submit(){

        coll.doc(this.id).get().then(query =>{
            if(query.exists){

                coll.doc(this.id).update({
                    bounds: {
                        ne: this.bounds.getNorthEast().toJSON(),
                        sw: this.bounds.getSouthWest().toJSON(),
                    }
                })
            }
            else{

                coll.add({
                    bounds: {
                                ne: this.bounds.getNorthEast().toJSON(),
                                sw: this.bounds.getSouthWest().toJSON(),
                            }
                    })
                this.hide();
                }
                
            }); 
               
    }

    _edit(){
        this.infoWindow.close();
        this.marker.setOptions({
            draggable:true,
            opacity:1,
            icon: "../img/marker_info_white_xsmall.png"
        });
        this.rectangle.setOptions({
            editable:true,
            draggable: true,
            strokeOpacity:1,
        });
    }

    list(){
        const list = document.querySelector('.list');
    }

}


let map;
let selectors = [];

function initMap() {

    const startLoc = {lat:36.563707, lng:-81.646534};

    map = new google.maps.Map(
        document.getElementById('map'), {center: startLoc, mapTypeId: "satellite",zoom: 18, });
   
    let isActive = false;

    coll.onSnapshot(snapshot =>{
        store.forEach(zone=>{
            zone.hide();
        });
        store = snapshot.docs.map(doc=>{
            let zone = new Zone(map, doc.data().bounds, doc.id)
            return zone;
        })
        console.log(store);
    });

    let zone;

    google.maps.event.addListener(map,"click", (e)=>
    {   

        // if(isActive) return;

        //state managment
        // isActive = true;

        
        const pos = e.latLng.toJSON();

        let bounds = { sw:{lat: pos.lat -.001,
                            lng: pos.lng -.001},
            ne:
                {lat: pos.lat +.001,
                lng: pos.lng +.001}
            }
        if(!zone || zone.removed){zone = new Zone(map, bounds);}
        

        // id++;

        // let selector = {
        //     marker,
        //     rectangle,
        //     id: markerID,
        //     pos,
        //     bounds: rectangle.getBounds().toJSON()
        // }
        // selectors.push(selector);
        // renderSelector(selector);
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





function deleteSelector(id){
    selectors = selectors.filter(e => e.id != id)

    // parentNode = document.querySelector(".list-group")
    item = document.getElementById(id.toString())

    item.parentNode.removeChild(item);

}

function renderSelector(sel){
    container=document.querySelector(".list-group")
    item = document.createElement("a")
    item.classList.add("list-group-item");
    item.classList.add("list-group-item-action");
    
     
    item.innerHTML = sel.id;
    item.role = "tab";
    item.href = "#";
    item.id = sel.id;
    item.onclick = () =>{
    sel.rectangle.setOptions({
        strokeColor:"red"
    })}
    container.appendChild(item);
    
}


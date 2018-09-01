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

    constructor(map, pos, id=0, bounds){
        this.map = map;
        this.pos = pos;
        this.id = id;
        if(!bounds){
            this.bounds = [{lat: this.pos.lat -.001,
                lng: this.pos.lng -.001}, 
                {
                    lat: this.pos.lat +.001,
                    lng: this.pos.lng +.001
                }];
        }

        else{
            this.bounds = bounds;
        }
        this.addMarker();
        this.addRectangle();
        this.addInfoWindow();
    }

    addMarker(){

        //create (render) the marker

        this.marker = new google.maps.Marker({
            position: this.pos,
            map: this.map,
            draggable: true,
            icon: "../img/marker_info_white_xsmall.png",
                        
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

    addRectangle(){


        //create the rectangle (render)

        this.rectangle = new google.maps.Rectangle({
            bounds : new google.maps.LatLngBounds( ...this.bounds),
            map: this.map,
            editable: true,
            draggable: true,
                
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
        });
        
    }

    addInfoWindow(){

        //info window content

        const deleteBtn = `<button type="button"  class="mx-2 btn btn-danger delete">Delete</button>`;
        const confirmBtn = `<button type="button"  class="mx-2 btn btn-success confirm">Confirm</button>`;
        const editBtn = `<button type="button"  class="mx-2 btn btn-primary edit" style="display:none">Edit</button>`;
        const content = `<div id ="${this.id}" class='btn-toolbar'>${confirmBtn + editBtn + deleteBtn}</div>`;

        //render window

        this.infoWindow = new google.maps.InfoWindow(
            {
            content
            }
        );
    
        this.infoWindow.open(this.map,this.marker);
        
        //handle dynamic opening

        this.marker.addListener('click', () => this.infoWindow.open(this.map, this.marker));

        //handle dom events

        google.maps.event.addListener(this.infoWindow, 'domready', ()=> {

            const div = document.getElementById(this.id);
            const deleteElem = div.querySelector('.delete');
            const confirmElem = div.querySelector('.confirm');
            const editElem = div.querySelector('.edit');

            deleteElem.addEventListener('click', ()=>{this.remove()});
            confirmElem.addEventListener('click', ()=>{
                confirmElem.style.display = 'none';
                editElem.style.display = 'inline-block';
                this._confirm()
            });
            editElem.addEventListener('click', ()=>{
                editElem.style.display = 'none';
                confirmElem.style.display = 'inline-block';
                this._edit()
            });

        });
    }


    remove(){
        this.infoWindow.close();
        this.marker.setMap(null);
        this.rectangle.setMap(null);
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




let map;
let id = 0;
let selectors = [];

function initMap() {

    const startLoc = {lat:36.563707, lng:-81.646534};

    map = new google.maps.Map(
        document.getElementById('map'), {center: startLoc, mapTypeId: "satellite",zoom: 18, });
   
    let isActive = false;


    google.maps.event.addListener(map,"click", (e)=>
    {   
    
        if(isActive) return;

        //state managment
        // isActive = true;

        
        const pos = e.latLng.toJSON();

        let zone = new Zone(map, pos, id);

        id++;

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







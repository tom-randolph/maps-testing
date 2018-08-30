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
        isActive = true;

        let markerID = id;
        id++;
        const pos = e.latLng.toJSON();


        //marker
        let marker = new google.maps.Marker({
            position: pos,
            map,
            draggable: true,
            icon: "../img/marker_info_white_xsmall.png",
                        
        })

        //rectangle
        let rectangle = new google.maps.Rectangle({
            bounds : new google.maps.LatLngBounds( {lat: pos.lat -.001,
                                                lng: pos.lng -.001}, 
                                                {
                                                    lat: pos.lat +.001,
                                                    lng: pos.lng +.001
                                                }),
            map,
            editable: true,
            draggable: true,
                
            });
        
        //movement
        rectangle.addListener('dragstart', ()=>{
            marker.setOpacity(.4)
        });

        marker.addListener('dragstart', ()=>{  
            marker.setOpacity(.4)
        });

        rectangle.addListener('dragend', ()=>{
            marker.setOpacity(1)
        });

        rectangle.addListener('bounds_changed', ()=>{
            marker.setPosition(rectangle.getBounds().getCenter());
        });

        marker.addListener('dragend', ()=>{
            const centerMarker = marker.getPosition().toJSON();
            const centerRect = rectangle.getBounds().getCenter().toJSON();

            const diff = {lat: centerMarker.lat - centerRect.lat, lng: centerMarker.lng - centerRect.lng}
            let bounds = rectangle.getBounds().toJSON();
            console.log(diff)
            bounds.north+= diff.lat;
            bounds.south+= diff.lat;
            bounds.east+= diff.lng;
            bounds.west+= diff.lng;
            rectangle.setBounds(bounds);
            marker.setOpacity(1)
        });

        //info button content
        
        const deleteBtn = `<button type="button" id = "${markerID.toString()}d" class="mx-2 btn btn-danger">Delete</button>`;

        const confirmBtn = `<button type="button" id = "${markerID.toString()}c" class="mx-2 btn btn-success">Confirm</button>`;
        const editBtn = `<button type="button" id = "${markerID.toString()}e" class="mx-2 btn btn-primary" style="display:none">Edit</button>`;
        const content = `<div class='btn-toolbar'>${confirmBtn + editBtn + deleteBtn}</div>`;


        let infowindow = new google.maps.InfoWindow({
                content
        });

        infowindow.open(map,marker);


        marker.addListener('click', function() {
            infowindow.open(map, this);
        });

        google.maps.event.addListener(infowindow, 'domready', function() {
            console.log(markerID)

            //delete
            google.maps.event.addDomListener(document.getElementById(markerID.toString()+"d"), 'click', function() {

                    infowindow.close();
                    isActive=false;
                    marker.setMap(null);
                    rectangle.setMap(null);
                    deleteSelector(markerID);
                    console.log(selectors);
            });
            //confirm
            google.maps.event.addDomListener(document.getElementById(markerID.toString()+"c"), 'click', function() {
                document.getElementById(markerID.toString()+"c").style.display="none"
                document.getElementById(markerID.toString()+"e").style.display="inline-block"
                infowindow.close();
                isActive = false;
                marker.setOptions({
                    draggable:false,
                    opacity:.5,
                    icon: "../img/marker_info_white_xsmall2.png"
                });
                rectangle.setOptions({
                    editable:false,
                    draggable: false,
                    strokeOpacity:.5,
                });
                
            });

            //edit
            google.maps.event.addDomListener(document.getElementById(markerID.toString()+"e"), 'click', function() {
                document.getElementById(markerID.toString()+"e").style.display="none"
                document.getElementById(markerID.toString()+"c").style.display="inline-block"
                infowindow.close();
                isActive = true;
                marker.setOptions({
                    draggable:true,
                    opacity:1,
                    icon: "../img/marker_info_white_xsmall.png"
                });
                rectangle.setOptions({
                    editable:true,
                    draggable: true,
                    strokeOpacity:1,
                });
            });
        });

        let selector = {
            marker,
            rectangle,
            id: markerID,
            pos,
            bounds: rectangle.getBounds().toJSON()
        }
        selectors.push(selector);
        renderSelector(selector);
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





class Zone {

    constructor(map, bounds, id='placeholder'){
        this.map = map;
        this.id = id;
        this.bounds = new google.maps.LatLngBounds(bounds.sw,bounds.ne);
        this.isPlaceholder = this.id==='placeholder' ? true : false;
        this.rendered = false;
        this.renderInView();
    }

    renderInView(){
        
        try{
            const inView = this.map.getBounds().intersects(this.bounds) || this.map.getBounds().contains(this.bounds.getCenter());
        
        if(inView){
            if(!this.rendered) this.render(this.isPlaceholder);

        }
        
        else if(this.rendered) this.hide();
        }
        catch(e){
            console.error(e);
        }

    }

    render(active){
        this._addMarker(active);
        this._addRectangle(active);
        this._addInfoWindow(active);
        this.rendered = true;
    }

    _addMarker(active){

        //create (render) the marker

        this.marker = new google.maps.Marker({
            position: this.bounds.getCenter(),
            map: this.map,
            draggable: active,
            opacity: active ? 1 : .5,
            icon: active ? "marker_info_white_xsmall.png" : "marker_info_white_xsmall2.png",
                        
        })

        // implement movement adjustments

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

    _addRectangle(active){


        // create the rectangle (render)

        this.rectangle = new google.maps.Rectangle({
            bounds : this.bounds,
            map: this.map,
            editable: active,
            draggable: active,
            strokeOpacity: active ? 1 :.5
                
            });

        // implement movement adjustments
        
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

    _addInfoWindow(active){

        // info window content

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

        // render window

        this.infoWindow = new google.maps.InfoWindow(
            {
            content: `<div id ="${this.id}" class='btn-toolbar'></div>`
            }
        );
    
        if(active) this.infoWindow.open(this.map,this.marker);
        
        // handle dynamic opening

        this.marker.addListener('click', () => this.infoWindow.open(this.map, this.marker));

        // handle dom events

        google.maps.event.addListener(this.infoWindow, 'domready', ()=> {

            const div = document.getElementById(this.id);;
            div.appendChild(confirmBtn);
            div.appendChild(editBtn);
            div.appendChild(deleteBtn);
        });
    }


    remove(){
        coll.doc(this.id).delete()
        .then(()=> this.hide());
    }

    hide(){
        if(this.rendered){
            this.infoWindow.close();
            this.marker.setMap(null);
            this.rectangle.setMap(null);
            this.rendered = false;
        }
    }

    _confirm(){
        this.infoWindow.close();
        this.marker.setOptions({
            draggable:false,
            opacity:.5,
            icon: "marker_info_white_xsmall2.png"
        });
        this.rectangle.setOptions({
            editable:false,
            draggable: false,
            strokeOpacity:.5,
        });
        this.submit();
    }

    submit(){
        const bounds = {
            ne: this.bounds.getNorthEast().toJSON(),
            sw: this.bounds.getSouthWest().toJSON(),
        }
        coll.doc(this.id).get().then(query =>{
            if(query.exists) coll.doc(this.id).update({bounds});
    
            else {
                coll.add({bounds});
                this.hide();
                }    
        });         
    }

    _edit(){
        this.infoWindow.close();
        this.marker.setOptions({
            draggable:true,
            opacity:1,
            icon: "marker_info_white_xsmall.png"
        });
        this.rectangle.setOptions({
            editable:true,
            draggable: true,
            strokeOpacity:1,
        });
    }
}
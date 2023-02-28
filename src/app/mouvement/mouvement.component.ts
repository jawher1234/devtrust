import { MouvementService } from './../service/mouvement.service';
import { NotificationService } from '../service/notification.service';
import { Component, OnInit } from '@angular/core';
import { TravelMarker, TravelMarkerOptions, TravelData, TravelEvents, EventType } from 'travel-marker';
import locationData from "../data/locations.json";




declare var google: any;
@Component({
  selector: 'app-mouvement',
  templateUrl: './mouvement.component.html',
  styleUrls: ['./mouvement.component.scss']
})
export class MouvementComponent {
  mapIcon: any = {
    url: 'assets/images/map-marker2.png',
    scaledSize: {
      width: 13,
      height: 13
    }
  }
  // google maps zoom level
  zoom: number = 20;
  markerShow: boolean = true;
  // initial center position for the map
  lat: number = 36.855183;
  lng: number = 10.229045;

  map: any;
  line: any;
  directionsService: any;
  marker: any = null;
  locations: any = locationData
  // speedMultiplier to control animation speed
  speedMultiplier = 1;
  iconTravel: any = 'Default';
  
  constructor(private notifyService: NotificationService, private markerEvent: MouvementService) {

  }

  ngOnInit() {

  }

  onShowMarkersFalse() {
    this.markerShow = false
  }
  onShowMarkersTrue() {
    this.markerShow = true
  }
  onMapReady(map: any) {
    console.log(map);
    this.map = map;
    // this.calcRoute();
    this.mockDirections();
    // this.initEvents();
  }

  // get locations from direction service
  calcRoute() {
    this.line = new google.maps.Polyline({
      strokeOpacity: 0.5,
      path: [],
      map: this.map
    });

    const start = new google.maps.LatLng(36.865961, 10.229809);
    const end = new new google.maps.LatLng(36.841874, 10.224497);
    const request = {
      origin: start,
      destination: end,
      travelMode: google.maps.TravelMode.BICYCLING
    };
    this.directionsService = new google.maps.DirectionsService();
    this.directionsService.route(request, (response: any, status: any) => {
      // Empty response as API KEY EXPIRED
      console.log(response);
      if (status == google.maps.DirectionsStatus.OK) {
        var legs = response.routes[0].legs;
        for (let i = 0; i < legs.length; i++) {
          var steps = legs[i].steps;
          for (let j = 0; j < steps.length; j++) {
            var nextSegment = steps[j].path;
            for (let k = 0; k < nextSegment.length; k++) {
              this.line.getPath().push(nextSegment[k]);
            }
          }
        }
        this.initRoute();
      }
    });
  }



  mockDirections() {
    const locationArray = locationData.map(l => new google.maps.LatLng(l[0], l[1]));
    // Define a symbol using a predefined path (an arrow)
    // supplied by the Google Maps JavaScript API.
    const lineSymbol = {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
    };

    this.line = new google.maps.Polyline({
      strokeOpacity: 0.5,
      strokeColor: '#FF0000',

      path: []
      ,
      icons: [
        {
          icon: lineSymbol,
          offset: "100%",
          repeat: '100px'
        },
      ],
      map: this.map
    });
    locationArray.forEach(l => this.line.getPath().push(l));
    
    const start = new google.maps.LatLng(36.865961, 10.229809);
    const end = new google.maps.LatLng(36.841874, 10.224497);
    
    const startMarker = new google.maps.Marker({ position: start, map: this.map, label: 'A' });
    const endMarker = new google.maps.Marker({ position: end, map: this.map, label: 'B' });
    this.initRoute();
  }

  // initialize travel marker
  initRoute() {
    const route = this.line.getPath().getArray();

    // options
    const options: TravelMarkerOptions = {
      map: this.map,  // map object
      speed: 50,  // default 10 , animation speed
      interval: 10, // default 10, marker refresh time
      cameraOnMarker: true,  // default false, move camera with marker
      speedMultiplier: this.speedMultiplier,

      markerOptions: {
        title: 'Travel Marker',
        animation: google.maps.Animation.DROP,
        icon: {
          url: 'assets/airplane-seeklogo.com.svg',
          // This marker is 20 pixels wide by 32 pixels high.
          animation: google.maps.Animation.DROP,
          // size: new google.maps.Size(256, 256),
          scaledSize: new google.maps.Size(128, 128),
          // The origin for this image is (0, 0).
          origin: new google.maps.Point(0, 0),
          // The anchor for this image is the base of the flagpole at (0, 32).
          anchor: new google.maps.Point(53, 110)
        }
      },
    };

    // define marker
    this.marker = new TravelMarker(options);

    // add locations from direction service 
    this.marker.addLocation(route);

    setTimeout(() => this.play(), 2000);
    /*  EventType = 'play' | 'paused' | 'finished' | 'reset' | 'checkpoint' | 'previous' | 'next'; 
     // checkpoint - when marker arrives on a location present in locationArray
     TravelData = {
       location: LatLng; // marker current location
       playing: boolean; // is animation playing?
       index: number;  // index in locationArray
       status: 'reset' | 'playing' | 'paused' | 'finished';  // animation status
     }
 */
    this.marker.event.onEvent((event: EventType, data: TravelData) => {
      // .... do something
      console.log(data.status)
      if (data.status != 'playing') {
        this.notifyService.showInfo("This is warning", data.status)

      } else {
        this.notifyService.clearNotiifcation()
      }
    });
  }

  // play animation
  play() {
    this.markerEvent.play(this.marker);
  }

  // pause animation
  pause() {
    this.markerEvent.pause(this.marker);
  }

  // reset animation
  reset() {
    this.markerEvent.reset(this.marker);
  }

  // jump to next location
  next() {
    this.markerEvent.next(this.marker);
  }

  // jump to previous location
  prev() {
    this.markerEvent.prev(this.marker);
  }

  // fast forward
  fast() {
    this.speedMultiplier *= 2;
    this.markerEvent.fast(this.marker, this.speedMultiplier);
  }

  // slow motion
  slow() {
    this.speedMultiplier /= 2;
    this.markerEvent.slow(this.marker, this.speedMultiplier)
  }

  initEvents() {
    this.marker.event.onEvent((event: EventType, data: TravelData) => {
      console.log(event, data);
    });
  }
}

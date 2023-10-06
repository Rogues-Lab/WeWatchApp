import React, {useEffect, useRef, useState} from 'react';
import * as turfdistance from '@turf/distance';

import * as mapboxgl from 'mapbox-gl'; 
import { mapboxglAccessToken, mapboxglStyle, defaultInitialLat, defaultInitialLng, defaultInitialZoom } from '../util/mapbox';
import { IonFab, IonFabButton, IonIcon } from '@ionic/react';
import { locate, navigate, reload, search } from 'ionicons/icons';
import { getCurrentLocation } from '../util/location';


export const MapDraggableMarker = ({initialLat=defaultInitialLat, initialLng=defaultInitialLng, initialZoom=defaultInitialZoom, sendLocationFnc, autoLocate=false, resetCenter=null}) => {
    // console.log('initial L L', initialLng, initialLat)
    const [lng, setLng] = useState(initialLng);
    const [lat, setLat] = useState(initialLat);
    const [zoom, setZoom] = useState(initialZoom);
    const [marker, setMarker] = useState<any>();

    const [geoLocateCtl, setGeoLocateCtl] = useState<any>();
    const [currentLocation, setCurrentLocation] = useState<any>();
    const [userLocation, setUserLocation] = useState<any>();
    const [distanceToIncident, setDistanceToIncident] = useState<number>();
    
    const draggableMapContainer = useRef<any>(null);
    const draggableMap = useRef<any>(null);

    const centerMap = async () => {
      const position = await getCurrentLocation();
      const center = new mapboxgl.LngLat(position?.coords?.longitude, position?.coords?.latitude)
      draggableMap.current.flyTo({
        center: center,
        zoom: zoom,
        essential: true // this animation is considered essential with respect to prefers-reduced-motion
      });

      setCurrentLocation(position?.coords);
      setLat(position?.coords?.latitude);
      setLng(position?.coords?.longitude);
      setUserLocation(position?.coords);

    }

    const reloadPosition = () => {
        const center = new mapboxgl.LngLat(initialLng, initialLat)
        marker?.setLngLat([initialLng, initialLat])
        // Center the map
        draggableMap.current.flyTo({
            center: center,
            essential: true // this animation is considered essential with respect to prefers-reduced-motion
        });
        setCurrentLocation({
            longitude: initialLng,
            latitude: initialLat
          });

        setLat(initialLat);
        setLng(initialLng);
    }

    useEffect(() => {
        if(userLocation && currentLocation){
          // calc in meters
          const distanceToIncident = turfdistance.default([userLocation.latitude,userLocation.longitude], [currentLocation.latitude,currentLocation.longitude],{units: 'kilometers'}) ;
          setDistanceToIncident(distanceToIncident)

          if (sendLocationFnc){
            sendLocationFnc(currentLocation, distanceToIncident);
          }
        } else {
            // No access to GPS, so default location then drag
            if (sendLocationFnc){
                sendLocationFnc(currentLocation, null);
            } 
        }
    }, [userLocation, currentLocation])
    
    useEffect(() => {
        if (currentLocation && currentLocation.longitude && currentLocation.latitude){

          setLat(currentLocation.latitude);
          setLng(currentLocation.longitude);
    
          if (draggableMap.current && currentLocation.longitude && currentLocation.latitude){
            const center = new mapboxgl.LngLat(currentLocation.longitude, currentLocation.latitude);
            
            // Center the map
            // draggableMap.current.setCenter(center);
            draggableMap.current.flyTo({
                center: center,
                zoom: zoom,
                essential: true // this animation is considered essential with respect to prefers-reduced-motion
            });
    
            //Redo marker?
            if (marker) {
                marker.remove();
            }

            const mapMarker = new mapboxgl.Marker({draggable: true, color: '#F15A24'})
              .setLngLat([lng, lat])
              .addTo(draggableMap.current);
    
            mapMarker.on('dragend', ()=>{
              const lngLat = mapMarker.getLngLat();
              if(lngLat?.lng){
                setCurrentLocation({
                    longitude: lngLat.lng,
                    latitude: lngLat.lat
                });
    
                setLat(lngLat.lat);
                setLng(lngLat.lng);
              }
            });
    
            setMarker(mapMarker);
    
            
          }
        }
      },[draggableMap, currentLocation])


      useEffect(() => {
        
        if (draggableMap.current) return; // initialize map only once
        if (!draggableMapContainer.current) return; // initialize map only once container is there
        draggableMap.current = new mapboxgl.Map({
          accessToken: mapboxglAccessToken,
          container: draggableMapContainer.current,
          style: mapboxglStyle,
          center: [lng, lat],
          zoom: zoom
        });

        if(sendLocationFnc) {
            // Send first map location 
            sendLocationFnc({ latitude: lat, longitude: lng});
        }
    
        // const geoLocate = new mapboxgl.GeolocateControl({
        //   positionOptions: {
        //   enableHighAccuracy: true
        //   },
        //   // When active the map will receive updates to the device's location as it changes.
        //   trackUserLocation: false,
        //   // Draw an arrow next to the location dot to indicate which direction the device is heading.
        //   showUserHeading: true
        // });
    
        // setGeoLocateCtl(geoLocate);
        // draggableMap.current.addControl(geoLocate);
    
        // geoLocate.on('geolocate', (geo) => {
        //     console.log('A geolocate event has occurred.', geo);
        //     let geo_coords = geo as any;
        //     setCurrentLocation(geo_coords?.coords);
        //     setUserLocation(geo_coords?.coords);
        // });
    
        const mapMarker = new mapboxgl.Marker({draggable: true, color: '#F15A24'})
            .setLngLat([lng, lat])
            .addTo(draggableMap.current);
        
        mapMarker.on('dragend', ()=>{
          const lngLat = mapMarker.getLngLat();
          if(lngLat?.lng){
            setCurrentLocation({
              longitude: lngLat.lng,
              latitude: lngLat.lat
            });
    
            setLat(lngLat.lat);
            setLng(lngLat.lng);
          }
        });

        
    
        setMarker(mapMarker);

        setTimeout(function(){
          draggableMap.current.resize();
        }, 200);
    
      }, [draggableMap, draggableMapContainer]);

      useEffect(() => {
        //default to location of user.
        const getAsyncCurrentLocation = async () => {
          try {
            const position = await getCurrentLocation();
            if(autoLocate){
                setCurrentLocation(position?.coords);
                setLat(position?.coords?.latitude);
                setLng(position?.coords?.longitude);
            }
            setUserLocation(position?.coords);
          } catch (error) {
            console.error(error);
          }
        };
        getAsyncCurrentLocation();
      }, []);


      draggableMap.current?.on('idle', function () {
        // Resize to fill space
        console.log('idle resize')
        draggableMap.current.resize();
      });

      // draggableMap.current?.on('load', function () {
      //   // Resize to fill space
      //   draggableMap.current.resize();
      // });

    return (
        <div className="area-map-section h-64">
             
            <div ref={draggableMapContainer} className="w-full h-64">
                <IonFab slot="fixed" horizontal="start" vertical="top">
                    <IonFabButton size="small" color={'medium'} onClick={reloadPosition}>
                        <IonIcon icon={reload} />
                    </IonFabButton>
                </IonFab>  
                <IonFab slot="fixed" horizontal="end" vertical="top">
                    <IonFabButton size="small" color={'medium'} onClick={centerMap}>
                        <IonIcon icon={locate} />
                    </IonFabButton>
                </IonFab>  
            </div> 
        </div>
    )
};

export default MapDraggableMarker;
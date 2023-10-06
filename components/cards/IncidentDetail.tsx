import Card from '../ui/Card';
import IncidentCarousel from './IncidentCarousel';
import {
  IonFab,
  IonFabButton,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonItem,
  IonIcon,
  IonToast,
  IonLabel,
  IonContent,
  IonMenuButton,
  IonFabList,
  IonSegment,
  IonSegmentButton,
  IonList,
} from '@ionic/react';
import {CopyToClipboard} from 'react-copy-to-clipboard';

import { search, navigate, bookmark, locate, share, bus, create, shareSocial, information, reload } from 'ionicons/icons';
import React, { useRef, useEffect, useState } from 'react';

// import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import * as mapboxgl from 'mapbox-gl'; 
import { Chat } from '../chat/Chat';
import { findObjectChat } from '../../store/chat';
import { mapboxglStyle, mapboxglAccessToken, defaultInitialZoom } from '../util/mapbox';
import { Share } from '@capacitor/share';
import IconKey from '../modals/IconKey';
import { displayCoverImage, displayLevelColor } from '../util/display';
import Categories from '../ui/Categories';
import ToggleDateDisplay from '../ui/ToggleDatesDisplay';
import UserProfile from '../modals/UserProfile';
import UserProfileAvatar from '../ui/UserProfileAvatar';
import { FabUgcIncidentActions } from './FabUgcIncidentActions';
import { useRouter } from 'next/router';
import { useUser } from '@supabase/auth-helpers-react';
import { useStoreState } from 'pullstate';
import { useUserStore, UserStore } from '../../store/user';
import * as selectors from '../../store/selectors';
import NoUserCard from './NoUserCard';

export const IncidentDetail = ({incident, files, supabase}) => {
  
  const img0 = displayCoverImage(incident?.cover_image_url);
  // const { authUser, authUserProfile, userProfiles } = useStore({userId: incident?.user_id})
  const authUser = useUser();
  const {userIds} = useUserStore({userId: incident?.user_id});
  const authUserProfile = useStoreState(UserStore, selectors.getAuthUserProfile);
  const userProfiles = useStoreState(UserStore, selectors.getUserProfiles);

  const mapContainer = useRef<any>(null);
  const map = useRef<any>(null);

  const [marker, setMarker] = useState<any>();
  const [currentLocation, setCurrentLocation] = useState<any>();
  const [isToastOpen, setIsToastOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | undefined>();
  const [segmentMode, setSegmentMode] = useState<string | undefined>('messages');
  const [chatId, setChatId] = useState<any>();
  const [canShare, setCanShare] = useState<boolean>(false);
  const [creator, setCreator] = useState<any>();
  const [openIconKey, setOpenIconKey] = useState(false);
  const [openCreator, setOpenCreator] = useState(false);
  const [userMarker, setUserMarker] = useState<mapboxgl.Marker | undefined>();

  const location = useStoreState(UserStore, selectors.getLocation);

  const reloadPosition = () => {
    const center = new mapboxgl.LngLat(incident?.longitude, incident?.latitude)
    // Center the map
    map?.current.flyTo({
        center: center,
        zoom: defaultInitialZoom,
        essential: true // this animation is considered essential with respect to prefers-reduced-motion
    });
  }

  const redrawMarker = () => {
    if(map.current){
      if(marker){
        marker.remove();
      }

      const markerColor = displayLevelColor(incident);
      const newMarker = new mapboxgl.Marker({color: markerColor})
          .setLngLat([incident.longitude, incident.latitude])
          .addTo(map.current);
      setMarker(newMarker);
    }
  }
  
  useEffect(() => {
    //Check for share web api
    const handleAsync = async () => {
      const canShare = await Share.canShare();
      setCanShare(canShare.value);
    }
    handleAsync();
  }, []);

  useEffect(() => {
    //load incident chat
    findObjectChat('incidents', incident.id, setChatId, supabase);
    
    if (map.current) {
      redrawMarker();
      return; // initialize map only once
    }

    map.current = new mapboxgl.Map({
      accessToken: mapboxglAccessToken,
      container: mapContainer.current,
      style: mapboxglStyle,
      center: [incident.longitude, incident.latitude],
      zoom: 13
    });

    // const geoLocate = new mapboxgl.GeolocateControl({
    //   positionOptions: {
    //   enableHighAccuracy: true
    //   },
    //   // When active the map will receive updates to the device's location as it changes.
    //   trackUserLocation: true,
    //   // Draw an arrow next to the location dot to indicate which direction the device is heading.
    //   showUserHeading: true
    // });

    // setGeoLocateCtl(geoLocate);
    // map.current.addControl(geoLocate);

    // geoLocate.on('geolocate', (geo) => {
    //     console.log('A geolocate event has occurred.', geo);
    //     let geo_coords = geo as any;
    //     setCurrentLocation(geo_coords?.coords);
    // });
    const markerColor = displayLevelColor(incident);
    const marker = new mapboxgl.Marker({color: markerColor})
        .setLngLat([incident.longitude, incident.latitude])
        .addTo(map.current);
    setMarker(marker);

    if (incident.longitude && incident.latitude && location) {
      map.current.flyTo({
        center: [incident.longitude, incident.latitude]
      });

      if(map.current && userMarker) {
        userMarker.setLngLat([ location.coords.longitude, location.coords.latitude])
    
      } else {

        const el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundColor = `blue`;
        el.style.width = `10px`;
        el.style.height = `10px`;
        el.style.borderRadius = `10px`;
        el.style.backgroundSize = '100%';


        const marker = new mapboxgl.Marker(el)
          .setLngLat([ location.coords.longitude, location.coords.latitude])
          .addTo(map.current);
        setUserMarker(marker);
        
      }
    }

    setTimeout(function(){
      map.current.resize();
    }, 200);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incident]);

  useEffect(() => {
    if(incident?.user_id) {

      if(userProfiles && userProfiles.size > 0 && userProfiles.has(incident?.user_id)){
        // Set the creator profile
        const creator = userProfiles.get(incident?.user_id)
        setCreator(creator);
      }
    }
  }, [userProfiles, incident, authUser, authUserProfile]);

  const flyToMe = () => {
    if (incident.longitude && incident.latitude && location) {
      map?.current.flyTo({
        center: [incident.longitude, incident.latitude]
      });
    }
  }

  const externalMaps = ()=>{
    window.open(`http://maps.apple.com/?q=${incident.latitude},${incident.longitude}`)
  }

  const toggleUserModal = () => {
    setOpenCreator(!openCreator);
  }

  const handleSegment = (event) => {
    if (event?.detail?.value == 'photos'){
      setSegmentMode('photos')
    } else {
      setSegmentMode('messages')
    }
  }

  const shareIncident = async() => {
    if (canShare) {
      await Share.share({
        title: 'WeWatch - Incident #'+incident?.id,
        text: 'Stay informed about Incident #'+incident?.id,
        url: 'https://app.wewatchapp.com/tabs/incidents/'+incident?.id,
        dialogTitle: 'Share with the socials',
      })
    } else {
      alert('can not share in this Browser')
    }

  }
  
  return (
    <>
    <Card className="mt-0 mx-auto">
      
      <div className="h-64 w-full relative">
        {authUser && <FabUgcIncidentActions incident={incident} creator={creator} />}


        <img className="h-64 px-auto w-full object-cover object-center" src={img0} alt="image" />
      </div>
      <div className="px-4 py-4 bg-white rounded-b-xl dark:bg-black">
        <h2 className="font-bold text-2xl text-gray-800 dark:text-gray-100">#{incident.id} - {incident.name}</h2>

        {creator && 
          <div className="flex items-center space-x-4 py-4" onClick={toggleUserModal}>
                <UserProfileAvatar userProfile={creator} size={12}/>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-gray-200">{creator?.username}</p>
                  <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700 dark:text-gray-500 dark:group-hover:text-gray-700">Creator&apos;s Profile</p>
                </div>
                <UserProfile open={openCreator} onDidDismiss={()=>{toggleUserModal}} userProfile={creator} />
          </div> 
        }

        <label htmlFor="categories" className="block text-xl font-medium text-gray-700 dark:text-gray-300 sm:mt-px sm:pt-2 mt-4 mb-2">
            <IonButton onClick={()=>{setOpenIconKey(!openIconKey)}} slot="icon-only" shape="round" color={"warning" } fill={"outline"}  size="small" className='float-right'>
              <IonIcon  icon={information} />
            </IonButton>
            Categories             
        </label>

        <div id="categories" >
          <Categories  incident={incident} showAll={false} />
        </div>

        <div className="w-full">
        <label htmlFor="when" className="block text-xl font-medium text-gray-700 dark:text-gray-300 sm:mt-px sm:pt-2 mt-4 mb-2">
            When             
        </label>
        <div id="when" className="">
          <ToggleDateDisplay input_date={incident.inserted_at} />
        </div>
        </div>

        <label htmlFor="about" className="block text-xl font-medium text-gray-700 dark:text-gray-300 sm:mt-px sm:pt-2 mt-4 mb-2">
            What happened             
        </label>
        <div id="about" className="font-bold py-0 text-l text-gray-400 dark:text-gray-200">{incident.about || "-"}</div>

        <label htmlFor="location" className="block text-xl font-medium text-gray-700 dark:text-gray-300 sm:mt-px sm:pt-2 mt-4 mb-2">
            Where             
        </label>
        <div id="location" className="area-map-section h-64 mb-10">
          <div ref={mapContainer} className="w-full h-64">
            <IonFab slot="fixed" horizontal="start" vertical="top">
                <IonFabButton size="small" color={'medium'} onClick={reloadPosition}>
                    <IonIcon icon={reload} />
                </IonFabButton>
            </IonFab>  

            <IonFab slot="fixed" horizontal="end" vertical="top">
              <IonFabButton size="small" color={'medium'} onClick={flyToMe}>
                  <IonIcon icon={locate} />
              </IonFabButton>
            </IonFab>  

          </div> 
        </div>

        <CopyToClipboard 
            text={`${incident.latitude},${incident.longitude}`}
            onCopy={
              ()=>{
                setToastMessage("Copied latitude, longitude to clipboard!");
                setIsToastOpen(true);
              }
            }>
          <IonItem color={"light"} className="my-8">
            <IonIcon slot="end" icon={locate} />
            <IonLabel className="ion-text-wrap">
              Longitude: {incident.longitude} <br/>
              Latitude: {incident.latitude}
            </IonLabel>
            
          </IonItem>
        </CopyToClipboard>

        <div className="w-full my-2">
            { canShare &&
              <IonButton onClick={() => shareIncident()} className="text-sm">
                <IonIcon slot="start" icon={shareSocial} />
                Share
              </IonButton>
            }

            <IonButton onClick={() => externalMaps()} className="float-right text-sm">
              <IonIcon slot="start" icon={share} />
              Maps
            </IonButton>
        </div>
        



      </div>

      <div className="px-4 py-4 bg-white rounded-b-xl dark:bg-black">

      <IonSegment value={segmentMode} onIonChange={handleSegment}>
          <IonSegmentButton value="messages">
            Messages
          </IonSegmentButton>
          <IonSegmentButton value="photos">
            Photos
          </IonSegmentButton>
        </IonSegment>
        
        { !authUser &&
            <div className="mx-2">
              <NoUserCard  />
            </div>
        }

        {authUser && segmentMode == 'photos' && 
          <div className="my-4 mx-auto mt-10 w-full" >
            <IncidentCarousel files={files} creator={creator} />
          </div>
        }

        {authUser && segmentMode == 'messages' &&
          <div className="my-4 mx-auto mt-10 w-full" >
            <Chat chatId={chatId}/>
          </div>
        }
        
      </div>
      <IconKey open={openIconKey} onDidDismiss={() => setOpenIconKey(false)} />
      <IonToast
            isOpen={isToastOpen}
            message={toastMessage}
            duration={4000}
            position={'top'}
            color={'medium'}
            onDidDismiss={() => setIsToastOpen(false)}
        />
    </Card>
    </>
  );
}
  
export default IncidentDetail;
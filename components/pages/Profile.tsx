import {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonNote,
    IonLabel,
    IonPage,
    IonToast,
    IonButtons,
    IonMenuButton,
    IonToggle,
  } from '@ionic/react';
  import Store from '../../store';
  import { getNotifications } from '../../store/selectors';
  
  import { close, locate, moon, notifications } from 'ionicons/icons';
  import React, { useEffect, useState } from 'react';
  import { updateProfile, UserStore, useUserStore } from '../../store/user';
  import UserProfileAvatar from '../ui/UserProfileAvatar';
  import { SingleImageUploader } from '../uploader/SingleImageUploader';
  import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
  import { fileUrl, updateFileRelatedObject } from '../../store/file';
  import NoUserCard from '../cards/NoUserCard';
  import MapDraggableMarker from '../map/MapDraggableMarker';
  import { defaultInitialLat, defaultInitialLng, distanceMaxBase } from '../util/mapbox';
  import { ErrorCard } from '../cards/ErrorCard';
  import { useStoreState } from 'pullstate';
  import * as selectors from '../../store/selectors';
import { set } from 'date-fns';
import RemoveUser from '../modals/RemoveUser';

  const ProfilePage = ({history}) => {
 
    const authUser = useUser();
    const {userIds} = useUserStore({userId: authUser?.id});
    const authUserProfile = useStoreState(UserStore, selectors.getAuthUserProfile);
    const pushToken = useStoreState(UserStore, selectors.getPushToken);
    const currentLocation = useStoreState(UserStore, selectors.getLocation);

    const supabase = useSupabaseClient();
    const [error, setError] = useState("");

    const [ avatarFile, setAvatarFile] = useState<any>();
    const [ username, setUsername] = useState<string >('');
    const [ about, setAbout] = useState<string >('');
    const [ location, setLocation] = useState<any >();
    const [ pushEnabled, setPushEnabled] = useState<boolean>(false);

  const [openReporter, setOpenReporter] = useState(false);


    const [ distance, setDistance] = useState<number >();
    const [ newProfile, setNewProfile] = useState<any>();

    const [isToastOpen, setIsToastOpen] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string | undefined>();

    const resetData = () => {
      setError('');
      if (authUserProfile) {
        setUsername(authUserProfile.username)
        setAbout(authUserProfile.about);
        setNewProfile({...authUserProfile});
        const location = {
          longitude:
          (authUserProfile.longitude ? authUserProfile.longitude : (currentLocation?.coords?.longitude ? currentLocation.coords.longitude : defaultInitialLng)),
          latitude:
          (authUserProfile.latitude ? authUserProfile.latitude : (currentLocation?.coords?.latitude ? currentLocation.coords.latitude : defaultInitialLat))
         
        };
        
        setLocation(location);
        if (authUserProfile.push_token){
          setPushEnabled(true);
        } else {
          setPushEnabled(false);
        }
      }
    }

    const locationSetter = (markerLocation, distance) => {
      //Location from mapDraggableMarker
      if(markerLocation){
        setLocation(markerLocation);
      } 
      //if location is on, gets distance from current location
      setDistance(distance);
    } 

    useEffect(() => {
      //Set data
      if(authUserProfile){
        resetData();
      }
    },[authUserProfile])

    useEffect(() => {
      //Keep new profile object in sync for update
      let avatar_url = authUserProfile?.avatar_url;
      if (avatarFile){
        avatar_url = fileUrl(avatarFile);
      }
      const profile = {...authUserProfile, username: username, about: about, avatar_url: avatar_url}
      setNewProfile(profile)
    },[username, about, avatarFile, authUserProfile])
    
    const selectAvatarFile = async (uploadedFile) => {
      if (uploadedFile){
        setAvatarFile(uploadedFile);
        // update generic file upload to user image
        const fileRes = await updateFileRelatedObject(uploadedFile?.id, 'users', authUser.id, supabase);
      }
    }

    const handleUsername = (event) => {
      setUsername(event.target.value || '');
    }

    const handleAbout = (event) => {
      setAbout(event.target.value || '');
    }

    const handleCancel = () => {
      resetData();
      // history.push('/tabs/home');
    }

    const handleToggleNotification = () => {
      setPushEnabled(!pushEnabled);
    }

    const handleSubmit = async (event) => {
      event.preventDefault();
      setError('');

      // Check if close to base
      if (distance) {
        if ( distance > distanceMaxBase){
          setError('Too far from location to set as base');
          return;
        }
      }

      // Storage location
      if(location){
        newProfile.geom = {
          type: 'Point',
          coordinates: [location.longitude,location.latitude]
        };
        newProfile.longitude = location.longitude;
        newProfile.latitude = location.latitude;
      }

      if (pushEnabled && pushToken){
        newProfile.push_token = pushToken;
      } else if (pushEnabled === false ){
        newProfile.push_token = null;
      }
     

      //Update user profile (RLS active)
      const res = await updateProfile(newProfile, supabase);
      if (res?.error) {
        //Show error
        setError(res.error?.message)
      } else {
        //Notify User
        setToastMessage('Updated Profile');
        setIsToastOpen(true);

        //Move to home after update
        history.push('/tabs/home');
      }
    }

    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle>Profile</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">Profile</IonTitle>
            </IonToolbar>
          </IonHeader>

          {(!authUser) && 
            <div className="mx-2">
              <NoUserCard  />
            </div>
          }

          {authUser &&
            <form onSubmit={handleSubmit} className="mt-6 space-y-4 overflow-scroll mx-4">
              <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
                <div className="space-y-6 sm:space-y-5">
                  <div>
                    {/* <h3 className="text-lg font-medium leading-6 text-gray-900">My Public Profile</h3> */}
                    <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-200">
                      This information will be displayed publicly so be careful what you share.
                    </p>
                  </div>

                  <div className="space-y-6 sm:space-y-5">

                  <div className="sm:grid sm:grid-cols-3 sm:items-center sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                      <label htmlFor="photo" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Avatar
                      </label>
                      <div className="mt-1 sm:col-span-2 sm:mt-0">
                        <div className="flex items-center w-full justify-center">
                          <UserProfileAvatar userProfile={newProfile} size={16}/>
                        </div>
                        <div className="flex items-center w-full justify-center">
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">How will you be seen in the App.</p>
                        </div>
                        <div className="flex items-center justify-center mt-2">
                          <SingleImageUploader 
                            authUser={authUser} 
                            supabase={supabase} 
                            addFileFnc={selectAvatarFile}/>
                        </div>
                      </div>
                    </div>

                    
                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 sm:mt-px sm:pt-2">
                        Username
                      </label>
                      <div className="mt-1 sm:col-span-2 sm:mt-0">
                        <div className="flex max-w-lg rounded-md shadow-sm">
                          <input
                            type="text"
                            name="username"
                            id="username"
                            value={username}
                            onChange={handleUsername}
                            className="block w-full min-w-0 flex-1 rounded-md dark:bg-black dark:text-white rounded-r-md border-gray-300 focus:border-ww-secondary focus:ring-ww-secondary caret-ww-secondary sm:text-sm"
                          />
                          
                        </div>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">This needs to unique, and meet our terms of service.</p>
                      </div>
                    </div>

                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                      <label htmlFor="about" className="block text-sm font-medium text-gray-700 dark:text-gray-300 sm:mt-px sm:pt-2">
                        About
                      </label>
                      <div className="mt-1 sm:col-span-2 sm:mt-0">
                        <textarea
                          id="about"
                          name="about"
                          rows={3}
                          value={about}
                          onChange={handleAbout}
                          className="block w-full max-w-lg rounded-md border-gray-300 text-gray-500 dark:text-gray-300  dark:bg-black shadow-sm focus:border-ww-secondary focus:ring-ww-secondary caret-ww-secondary  focus:caret-ww-secondary sm:text-sm"
                        />
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Write a few sentences about yourself.</p>
                      </div>
                    </div>


                    <div className="grid grid-cols-1 sm:items-center sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Location
                      </label>
                      <IonItem color={"light"} className="my-2">
                        <IonIcon slot="end" icon={locate} />
                        <IonLabel className="ion-text-wrap">
                          Longitude: {location?.longitude} <br/>
                          Latitude: {location?.latitude} <br/>
                          
                          <span className={(distance > distanceMaxBase) ? 'text-red-700' : ''}>
                            {distance > 0 && distance <= 5 &&
                              "Distance from you (~km): "+ distance.toFixed(2)
                            }
                            {distance > 5 &&
                              "Distance from you (~km): "+ Math.floor(distance)
                            }
                          </span>

                        </IonLabel>
                      </IonItem>
                      <div className="mt-1 sm:col-span-2 sm:mt-0">
                        {authUserProfile && 
                          <MapDraggableMarker 
                            sendLocationFnc={locationSetter} 
                            initialLng={
                              authUserProfile.longitude ? authUserProfile.longitude : (currentLocation?.coords?.longitude ? currentLocation.coords.longitude : defaultInitialLng)} 
                            initialLat=
                            {authUserProfile.latitude ? authUserProfile.latitude : (currentLocation?.coords?.latitude ? currentLocation.coords.latitude : defaultInitialLat)}
                           />
                        }
                      </div>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Drag marker to your base location for notifications (not public).</p>
                      
                    </div>


                    <div className="w-full sm:border-t sm:border-gray-200 pt-4">
                      <IonList>
                        <IonItem>
                          <IonIcon slot="start" icon={notifications}/>
                          <IonLabel>Incident Push Notifications</IonLabel>
                          <IonToggle
                            checked={pushEnabled}
                            disabled = {!pushToken}
                            onIonChange={e => {handleToggleNotification()}}
                          />
                        </IonItem>
                        
                      </IonList>
                      {pushToken && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">for Incident within radius of 1km from location.</p>}
                      {!pushToken && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Push notifications are not available on this device.</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                {error && 
                  <ErrorCard errorMessage={error}/>
                }
              </div>

              <div className="pb-4">
              <div className="flex justify-between">
                  <div className='flex w-50'>
                      <button
                        type="button"
                        onClick={() => setOpenReporter(true)}
                        className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-ww-secondary focus:ring-offset-2"
                      >
                        Delete
                      </button>
                  </div>
                
                  <div className='flex w-50'>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-ww-secondary focus:ring-offset-2"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-ww-primary  py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-ww-secondary focus:outline-none focus:ring-2 focus:ring-ww-secondary focus:ring-offset-2"
                  >
                    Save
                  </button>
                  </div>
                </div>
              </div>
              
            </form>
          }
          <RemoveUser open={openReporter} onDidDismiss={() => setOpenReporter(false)} person={authUser}/>
          <IonToast
            isOpen={isToastOpen}
            message={toastMessage}
            duration={4000}
            position={'top'}
            color={'success'}
            onDidDismiss={() => setIsToastOpen(false)}
          />
        </IonContent>
      </IonPage>
    );
  };
  
  export default ProfilePage;
  
import {
    IonPage,
    IonHeader,
    IonItem,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonToggle,
    IonLabel,
    IonCard,
    IonCardContent,
    IonButtons,
    IonMenuButton,
    IonBadge,
    IonButton,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
    RefresherEventDetail,
  } from '@ionic/react';
  

  import * as selectors from '../../store/selectors';
  import React, { useState } from 'react';
  import { UserStore } from '../../store/user';
  import { NotificationStore, useNotificationsStore } from '../../store/notifications';
  import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

  import { useEffect } from 'react';
  import IncidentCardMini from '../cards/IncidentCardMini';
  import { ageInHours, localIncidentDistance } from '../util/mapbox';
  import { getPagination } from '../util/data';
  import { fetchUserIncidents, fetchUserIncidentsPages, geoTimedSearchPaged } from '../../store/incident';
  import Card from '../ui/Card';
  import NoUserCard from '../cards/NoUserCard';
  import { notificationsOutline } from 'ionicons/icons';
  import Notifications from '../modals/Notifications';
  import { useStoreState } from 'pullstate';
import HomeNonUser from '../auth/HomeNonUser';
  
  const Home = ({history}) => {
    const supabase = useSupabaseClient();

    const [showNotifications, setShowNotifications] = useState(false);

    const [localIncidents, setLocalIncidents] = useState([]);
    const [myIncidents, setMyIncidents] = useState([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [showRefreshTrigger, setShowRefreshTrigger] = useState<boolean>(true);


    const [advertData, setAdvertData] = useState<any>(null);
    
    const user = useUser();
    const authUserProfile = useStoreState(UserStore, selectors.getAuthUserProfile);
    const activeNotifications = useStoreState(NotificationStore, selectors.getActiveNotifications);
    const {userId} = useNotificationsStore({userId: user?.id});

    useEffect(() => {
      const fetchData = async() => {
        // You can await here
        const { data, error } = await supabase
          .from('ref_data')
          .select('data')
          .eq('ref', 'advert')
        if(data && data.length > 0){
          const remoteAdvertData = data[0]?.data;
          setAdvertData(JSON.parse(remoteAdvertData));
       }
      }
      fetchData();
  
  
    }, []);
    

    const goToIncident = (incident) => {
      if (incident && incident.id){
        history.push('/tabs/incidents/'+incident?.id);
      }
    }
    
    const gotoProfile = () => {
      history.push('/tabs/profile');
    }
    

    const loadUserData = async () => {
   
      setLoading(true);
      setLocalIncidents([]);
      setMyIncidents([]);

      // Get User Home Base and search for incidents.
      if (authUserProfile?.longitude) {
        const {data, error} = await geoTimedSearchPaged(authUserProfile.longitude, authUserProfile.latitude, localIncidentDistance, user.id, ageInHours, 0, 3, supabase) ;
        setLocalIncidents(data);
      }

      const {data, count, page, pageSize} = await fetchUserIncidentsPages(authUserProfile?.id, 0, 3, supabase);
      console.log("myIncidents",{data, count, page, pageSize});
      setMyIncidents(data)
      setLoading(false);
    }

    const handleRefresh = async(event: CustomEvent<RefresherEventDetail>) => {
      setTimeout(async () => {
        await loadUserData();
        event.detail.complete();
      }, 2000);
    }

    // Hide the pull trigger after 3 seconds
    useEffect(() => {
      setShowRefreshTrigger(true)
      setTimeout(async () => {
        setShowRefreshTrigger(false)
      }, 5000);
    }, []);
  

    useEffect(() => {
      //Check for share web api
      const handleAsync = async () => {
        await loadUserData()
      }
      if (authUserProfile) {
        handleAsync();
        // console.log('new user profile',authUserProfile)
      }
    }, [authUserProfile]);
  

    const nonUserHomepage = () => {
      return (
        <>
          <HomeNonUser history={history} />
        </>
      )
    }

    const userHomepage = () => {
      return (
        <>
          { showRefreshTrigger &&
              <div className="flex items-center ease-in-out">
                <div className=" rounded-md bg-gray-50 dark:bg-gray-900 p-4 w-full">
                  <div className="flex w-full justify-between">
                    <p className="text-sm text-gray-500 w-fill">Pull this down to trigger a refresh.</p>
                  </div>
                </div>
            </div>  
          }
        

          { user && authUserProfile?.username && <div className="max-w-xl my-4 mx-auto px-4 pt-4 pb-4 ">
              <h2 className="font-bold text-xl text-gray-600 dark:text-gray-100">Welcome back <span className="font-bold text-xl text-ww-secondary">{authUserProfile?.username}</span></h2>
            </div>
          }

          { user && !authUserProfile?.username && <div className="max-w-xl my-4 mx-auto px-4 pt-4 pb-4 ">
              <h2 className="font-bold text-xl text-gray-600 dark:text-gray-100" onClick={() => gotoProfile()}>Lets get you a <span className="font-bold text-xl text-ww-secondary">Username</span></h2>
            </div>
          }


          { user &&
            <div className="max-w-xl my-4 mx-auto" key="recent-incidents">
              <label className="block text-sm px-6 font-medium text-gray-700 dark:text-white"  key="recent-incident-label">
                  Recent Incidents Nearby
              </label>
            </div>
          }
          { user && localIncidents && localIncidents.map((i, index) => (
            <IncidentCardMini key={"local-"+index} onClickFnc={goToIncident} incident={i} />
          ))}

          { !loading && localIncidents && localIncidents.length === 0 && authUserProfile && (authUserProfile.longitude == null || authUserProfile.longitude == 0) &&
            <Card className="my-4 mx-auto" key="profile-location">
              <div className="px-4 pt-10 pb-4  rounded-xl ">
                <h2 className="font-bold text-l text-gray-800 dark:text-gray-100">We need your location..</h2>
                <p className="font-bold text-gray-800 dark:text-gray-100">head over to your profile to add it</p>
              </div>
            </Card>
          }

          {!loading && localIncidents && localIncidents.length === 0 && authUserProfile && authUserProfile.longitude  &&
            <Card className="my-4 mx-auto" key="profile-no-recent">
              <div className="px-4 pt-10 pb-4  rounded-xl ">
                <h2 className="font-bold text-l text-gray-800 dark:text-gray-100">No recent incidents..</h2>
              </div>
            </Card>
          }
       
          {(!user && !loading) && <NoUserCard/>}

          { !advertData &&
            <Card className="my-4 mx-auto" key="advert">
              <a href='mailto:admin@wewatchapp.com?subject=WeWatch Advert' target='_blank' rel='noreferrer noopener'>
              <div className="px-4 pt-12 pb-4 bg-ww-secondary rounded-xl ">
                <h2 className="font-bold text-l text-gray-800 dark:text-gray-100">This is Ad Space...</h2>
                <p className="font-bold text-gray-800 dark:text-gray-100">Support us and advertise here</p>
              </div>
              </a>
            </Card>
          }

          { advertData && advertData?.url &&
            <>
              <div className="max-w-xl my-4 mx-auto" key="recent-incidents">
                <a href='mailto:admin@wewatchapp.com?subject=WeWatch Advert' target='_blank' rel='noreferrer noopener'>
                  <label className="block text-sm px-6 font-medium text-gray-700 dark:text-white"  key="recent-incident-label">
                    Advert
                  </label>
                </a>
              </div>
              <Card className="my-4 mx-auto max-h-48 " key="advert">
                <a href={advertData?.url} target='_blank' rel='noreferrer noopener'>
                <div className="rounded-xl ">
                  <img src={advertData?.img} className='object-cover w-full h-48 rounded-xl' alt='advert' />
                </div>
                </a>
              </Card>
            </>
          }

          { user &&
            <div className="max-w-xl my-4 mx-auto my-4 mx-auto" key="Your-incidents">
              <label className="block text-sm px-4 font-medium text-gray-700 dark:text-white"  key="my-incident-label">
                  Your Recent Incidents
              </label>
            </div>
          }

          { user && myIncidents && myIncidents?.length> 0 &&  myIncidents?.map((i, index) => (
            <IncidentCardMini key={"my-"+index} onClickFnc={goToIncident} incident={i} />
          ))}
          { !loading &&  user && myIncidents && myIncidents.length === 0 &&
            <Card className="my-4 mx-auto rounded-b-xl" key="my-incident-empty">
              <div className="px-4 pt-10 pb-4  rounded-xl ">
                <h2 className="font-bold text-l text-gray-800 dark:text-gray-100">No Incidents created ..</h2>
                <p className="font-bold text-gray-800 dark:text-gray-100">let us know if there is an issue near by</p>
              </div>
            </Card>
          }

        </>
      )
    }
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>{user && <img  src="/imgs/WeWatch/WeWatch_LogoStrap_orange.svg" className="h-8"/>}</IonTitle>
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowNotifications(true)}>
                <IonIcon icon={notificationsOutline} />
                {activeNotifications.length > 0 && 
                  <IonBadge color="primary">{activeNotifications.length}</IonBadge>
                }
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className='dark:bg-black bg-red mx-auto'>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
         <Notifications open={showNotifications} history={history} onDidDismiss={() => setShowNotifications(false)} />
        
           {user && userHomepage()}
           {!user && nonUserHomepage()}
        </IonContent>
      </IonPage>
    );
  };
  
  export default Home;


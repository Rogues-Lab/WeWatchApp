import { StatusBar, Style } from '@capacitor/status-bar';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { cog, bookmark, map,home, list, logOut, logIn, newspaper, person, earthOutline, construct, chatbubbles, chatbox, create, callOutline, call } from 'ionicons/icons';

import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router';
import { useStoreState } from 'pullstate';
import { useUserStore, UserStore } from '../store/user';
import * as selectors from '../store/selectors';


const pages = [
  {
    title: 'Profile',
    icon: person,
    url: '/tabs/profile',
  },
  {
    title: 'Home',
    icon: home,
    url: '/tabs/home',
  },
 
  {
    title: 'Incidents',
    icon: map,
    url: '/tabs/map',
  },
  {
    title: 'Bookmarked',
    icon: bookmark,
    url: '/tabs/bookmarked',
  },  
  {
    title: 'My Incidents',
    icon: create,
    url: '/tabs/mine',
  }, 
  {
    title: 'Messages',
    icon: chatbubbles,
    url: '/tabs/chats',
  }, 
  {
    title: 'Settings',
    icon: cog,
    url: '/tabs/settings',
  },
  {
    title: 'Tour',
    icon: earthOutline,
    url: '/tour',
  },
  {
    title: 'Terms of Use',
    icon: newspaper,
    url: '/tabs/terms',
  },
  {
    title: 'Home',
    icon: home,
    url: '/tabs/home',
  }
];



const Menu = () => {
  // const [isDark, setIsDark] = useState(true);
  const user = useUser();
  const supabase = useSupabaseClient();
  const {userIds} = useUserStore({userId: user?.id});
  const authUserProfile = useStoreState(UserStore, selectors.getAuthUserProfile);


  const router = useRouter();
  const goToAdmin = () => {
    router.push('/admin/dashboard');
  }

  const callPoPo = () => {
    router.push('tel:000');
  }

  const signOut = async() => {
    const { error } = await supabase.auth.signOut()
  }

  const handleOpen = async () => {
    try {
      // debugger;
      // await StatusBar.setStyle({
      //   style: isDark ? Style.Dark : Style.Light,
      // });
    } catch {}
  };
  const handleClose = async () => {
    try {
      // await StatusBar.setStyle({
      //   style: isDark ? Style.Dark : Style.Light,
      // });
    } catch {}
  };

  // useEffect(() => {
  //   setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
  // }, []);

  return (
    <IonMenu side="start" contentId="main" onIonDidOpen={handleOpen} onIonDidClose={handleClose} swipeGesture={false} >
      <IonHeader>
        <IonToolbar>
          <IonTitle>
          <img
            height={'10px'}
                className="h-6 w-auto"
                src="/imgs/WeWatch/WeWatch_LogoStrap_white.svg"
                alt="WeWatch"
              />
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent >
        <IonList>


           { !user &&
            <IonMenuToggle autoHide={false} key='user'>
              <IonItem routerLink={'/tabs/login'} routerDirection="none" detail={false} lines="none">
                <IonIcon icon={logIn} slot="start" />
                <IonLabel>Sign In</IonLabel>
              </IonItem>
            </IonMenuToggle>
          }

          {pages.map((p, k) => (
            <IonMenuToggle autoHide={false} key={k}>
              <IonItem routerLink={p.url} routerDirection="none" detail={false} lines="none">
                <IonIcon icon={p.icon} slot="start" />
                <IonLabel>{p.title}</IonLabel>
              </IonItem>
            </IonMenuToggle>
          ))}

          <IonMenuToggle autoHide={false} key='popo'>
              <IonItem onClick={callPoPo} detail={false} lines="none">
                <IonIcon icon={call} slot="start" />
                <IonLabel>Emergency</IonLabel>
              </IonItem>
            </IonMenuToggle>

          { user &&
            <IonMenuToggle autoHide={false} key='user'>
              <IonItem onClick={signOut} detail={false} lines="none">
                <IonIcon icon={logOut} slot="start" />
                <IonLabel>Sign Out</IonLabel>
              </IonItem>
            </IonMenuToggle>
          }
          
          { authUserProfile?.admin &&
            <IonMenuToggle autoHide={false} key='admin'>
              <IonItem onClick={goToAdmin} detail={false} lines="none">
                <IonIcon icon={construct} slot="start" />
                <IonLabel>Admin</IonLabel>
              </IonItem>
            </IonMenuToggle>
          }


        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;

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
import { cog, bookmark, map,home, list, logOut, logIn, newspaper, person, earthOutline, construct, chatboxEllipses, chatbox } from 'ionicons/icons';

import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router';
import { useStore } from '../store/user';

const pages = [
  {
    title: 'Home',
    icon: home,
    url: '/tabs/home',
  },
  {
    title: 'Tour',
    icon: earthOutline,
    url: '/tour',
  },
  {
    title: 'Map',
    icon: map,
    url: '/tabs/map',
  },
  {
    title: 'List',
    icon: list,
    url: '/tabs/incidents',
  },
  {
    title: 'Bookmarked',
    icon: bookmark,
    url: '/tabs/bookmarked',
  },  
  {
    title: 'Messages',
    icon: chatbox,
    url: '/tabs/chats',
  }, 
  {
    title: 'Profile',
    icon: person,
    url: '/tabs/profile',
  },
  {
    title: 'Settings',
    icon: cog,
    url: '/tabs/settings',
  },

  {
    title: 'Terms of Use',
    icon: newspaper,
    url: '/tabs/terms',
  },
];



const Menu = () => {
  // const [isDark, setIsDark] = useState(true);
  const user = useUser();
  const supabase = useSupabaseClient();
  const { authUserProfile } = useStore({});


  const router = useRouter();
  const goToAdmin = () => {
    router.push('/admin/dashboard');
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
    <IonMenu side="start" contentId="main" onIonDidOpen={handleOpen} onIonDidClose={handleClose} swipeGesture={false}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>WeWatch</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          { user &&
            <IonMenuToggle autoHide={false} key='user'>
              <IonItem onClick={signOut} detail={false} lines="none">
                <IonIcon icon={logOut} slot="start" />
                <IonLabel>Sign Out</IonLabel>
              </IonItem>
            </IonMenuToggle>
          }

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

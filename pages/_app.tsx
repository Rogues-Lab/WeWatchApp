import Head from 'next/head';
import Script from 'next/script';

import 'tailwindcss/tailwind.css';
import '@ionic/react/css/core.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

import '../styles/global.css';
import '../styles/mapbox.css';
import '../styles/variables.css';
import React, { useEffect, useState } from 'react';
import { updatePushToken } from '../store/user';
import { SessionContextProvider,  } from '@supabase/auth-helpers-react'
import { createCapacitorSupabaseClient } from '../components/util/supabase';
import { ActionPerformed, PushNotifications, PushNotificationSchema, Token } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

function MyApp({ Component, pageProps }) {

  const registerPush = () => {
    {
      // Register with Apple / Google to receive push via APNS/FCM
      PushNotifications.register();

      // On success, we should be able to receive notifications
      PushNotifications.addListener('registration', 
        (token: Token) => {
          console.log('Push registration success, token:', token);
          updatePushToken(token.value);
        }
      );

      // Some issue with our setup and push will not work
      PushNotifications.addListener('registrationError', 
        (error: any) => {
          console.log('Error on registration:', JSON.stringify(error));
          updatePushToken(null);
        }
      );

      // Show us the notification payload if the app is open on our device
      PushNotifications.addListener('pushNotificationReceived', 
        (notification: PushNotificationSchema) => {
          console.log('Push received:', notification);
        }
      );

      // Method called when tapping on a notification
      PushNotifications.addListener('pushNotificationActionPerformed', 
        (action: ActionPerformed) => {
          console.log('Push action performed:', JSON.stringify(action));

          console.log('Push action data:', JSON.stringify(action?.notification?.data));
          // TODO: Can be used for logic and deep links (we decide data and logic)


          // TODO: probably use a pullstate store for global data then later component can decide what to do with it


          // Remove notification from the notification center (as you have actioned one)
          PushNotifications.removeAllListeners();
        }
      );
    }
  }

  const requestPermissions = async () => {
    let permStatus = await PushNotifications.checkPermissions();
    console.log('permStatus', permStatus?.receive);
    let permReqStatus = await PushNotifications.requestPermissions();
    console.log('permReqStatus', permReqStatus?.receive);
    
    await registerPush();  
    // if (permStatus.receive === 'prompt') {
    //   permReqStatus = await PushNotifications.requestPermissions();
    // }
  
    // if (permStatus.receive === 'granted') {
    //   registerPush();  
    // } else {
    //   console.error('User denied permissions!');
    // }
  };  

  useEffect(() => {
    // Request permission to use push notifications
    if (Capacitor.getPlatform() !== 'web') {
      requestPermissions().then(() => {
        console.log('requestPermissions done');
      });
    }
  }, []);

  // have custom supabase client for capacitor ios (uses perferences over cookies otherwise nextjs client)  
  const [supabaseClient] = useState(() => createCapacitorSupabaseClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }))

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        ></meta>
    </Head>
      <SessionContextProvider
        supabaseClient={supabaseClient}
        initialSession={pageProps.initialSession}
        >
          <Component {...pageProps} />
      </SessionContextProvider>
      
      <Script type="module" src="https://unpkg.com/ionicons@6.0.3/dist/ionicons/ionicons.esm.js"></Script>
      <Script src="https://unpkg.com/ionicons@6.0.3/dist/ionicons/ionicons.js"></Script>

      <Script type="module" src="https://unpkg.com/@ionic/pwa-elements@latest/dist/ionicpwaelements/ionicpwaelements.esm.js"></Script>
      <Script src="https://unpkg.com/@ionic/pwa-elements@latest/dist/ionicpwaelements/ionicpwaelements.js"></Script>
    </>
  );
}

export default MyApp;

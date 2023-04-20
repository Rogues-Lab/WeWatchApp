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
import React, { useState } from 'react';

import { SupabaseClient, createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider, Session } from '@supabase/auth-helpers-react'
import { createCapacitorSupabaseClient } from '../components/util/supabase';

function MyApp({ Component, pageProps }) {

  // const [supabaseClient] = useState(() => createBrowserSupabaseClient())
  const SUPABASE_url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_anon_key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;  
  const [supabaseClient] = useState(() => createCapacitorSupabaseClient({
    supabaseUrl: SUPABASE_url,
    supabaseKey: SUPABASE_anon_key
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

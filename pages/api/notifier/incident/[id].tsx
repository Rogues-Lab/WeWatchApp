import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import admin from 'firebase-admin';
import TelegramBot from 'node-telegram-bot-api';

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const telegramBotApi = process.env.TELEGRAM_BOT_API;
const telegramBotChannel = process.env.TELEGRAM_CHAT_ID;

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export default async function processIncidentCreation(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.API_ROUTE_SECRET !== process.env.API_ROUTE_SECRET) {
    return res.status(401).json({ error: 'Invalid API Route Secret.' });
  }

  // Retrieve incident ID from query parameters
  const { id } = req.query;
  console.log("processIncidentCreation id", id);
  try {
    // Retrieve incident record from Supabase
    const { data: incident, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('id',  id)
      .single();
    console.log("incident", incident);
    console.log("error", error);
    if (error) {
      console.error("can't find incident "+ id);
      throw new Error(error.message);
    }

    // Determine if I should send an incident
    // Also needs to match the notify_incident function 
    // same distance for notification and incident push
    // FROM geo_users(new.longitude, new.latitude, 1000) gu;
    const distance = 1000;

    const query = supabase.rpc('geo_users', { x: incident.longitude, y: incident.latitude, distance: distance });
    query.not('push_token', 'is', null); // only users with push_token

    // temporary-order-creation (not incidented_at, so we see newest, top for clicking)
    const result = await query.select("*").order('inserted_at',{ascending: false});
    console.log("result", result);

    const pushUsers = result.data;


    // const incident_user_id = incident.user_id;
    // // Retrieve user record associated with the incident
    // const { data: user, error: userError } = await supabase
    //   .from('users')
    //   .select('*')
    //   .eq('id', incident_user_id)
    //   .single();
    // console.log("user", user);
    // if (userError) {
    //   throw new Error(userError.message);
    // }
    //     if (user?.push_token) {
    if(pushUsers && pushUsers.length > 0){
    const userTokens = pushUsers.map((user) => user.push_token);
    // Construct message payload
    const message = {
      data: {
        type: 'incident',
        incident_id: ""+incident?.id,
        mode: ""+incident?.mode,
        object_type: ""+incident?.object_type,
        object_id: ""+incident?.object_id,
      },
      notification: {
        title: 'New Incident Reported #' + incident?.id,
        body: ""+incident?.name  
      },
      android: {
        notification: {
          sound: 'default'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default'
          }
        }
      },
      tokens: userTokens
    };

    // Send message using Firebase Admin Messaging
    const resp = await admin.messaging().sendEachForMulticast(message);
    console.log("send message to ", userTokens)
  } else {
    console.log('no activated users to send to');
  }

  try {
      // Send Telegram message
      const bot = new TelegramBot(telegramBotApi, { polling: false });
      const telegramMessage = `New Incident #${incident.id} - ${incident.name}`;
      const teleRepsonse = await bot.sendMessage(telegramBotChannel, telegramMessage);
      console.log("send bot alert")
    } catch (err) {
      // Handle errors
      console.error("telegram alert error", err);
    }


    // Return success response
    res.status(200).json({ message: 'Push notification sent. #' + userTokens.length });
  } catch (err) {
    // Handle errors
    res.status(500).json({ error: err.message });
  }
}
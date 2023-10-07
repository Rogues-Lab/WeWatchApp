import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import TelegramBot from 'node-telegram-bot-api';


// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const telegramBotApi = process.env.TELEGRAM_BOT_API;
const telegramChatId = process.env.TELEGRAM_CHAT_ID;

export default async function processReportCreation(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.API_ROUTE_SECRET !== process.env.API_ROUTE_SECRET) {
    return res.status(401).json({ error: 'Invalid API Route Secret.' });
  }

  // Retrieve incident ID from query parameters
  const { id } = req.query;
  console.log("processReportCreation id", id);
  try {
    // Retrieve incident record from Supabase
    const { data: report, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id',  id)
      .single();
    console.log("report", report);
    console.log("error", error);
    if (error) {
      console.error("can't find reports "+ id);
      throw new Error(error.message);
    }

    // Send Telegram message
    const bot = new TelegramBot(telegramBotApi, { polling: false });
    const message = `New UGC Report #:${report.id}`;
    const teleRepsonse = await bot.sendMessage(telegramChatId, message);
    console.log("bot", telegramChatId, message, teleRepsonse);

    // Return success response
    res.status(200).json({ message: 'Process report' });
  } catch (err) {
    // Handle errors
    res.status(500).json({ error: err.message });
  }
}
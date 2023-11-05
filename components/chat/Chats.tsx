import { IonButton, IonIcon, IonItem } from "@ionic/react";
import { NotificationStore, useNotificationsStore } from '../../store/notifications';
import { useStoreState } from 'pullstate';
import * as selectors from '../../store/selectors';
import { ChatStore, useChatStore } from "../../store/chat";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import ChatLinkouts from "./ChatLinkouts";
import { eye, chatbox, chatbubbles } from "ionicons/icons";
import Link from "next/link";
import { useEffect, useState } from "react";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}
``

  const ChatItem = ({ chat, chaturl='/tabs/chats/' }) => (
    
    <IonItem key={"chatitem-"+chat.id} className="" routerLink={chaturl} routerDirection="none" detail={false} lines="none">
    <div className="col-span-1 w-full flex rounded-md shadow-sm">
      <div className='flex bg-ww-secondary w-16 items-center justify-center text-white rounded-l-md text-sm font-medium text-white rounded-l-md border-b border-l border-t border-gray-200' >
        #{chat?.object_id ? chat?.object_id : chat?.id}
      </div>

      <div className="flex flex-1  w-full items-center justify-between truncate rounded-r-md border-b border-r border-t border-gray-200 ">
        <Link href={chaturl} className="font-medium  w-full text-gray-200 hover:text-gray-100">
          <div className="flex flex-1 w-full  items-center justify-between">
            <div className="flex-1 w-full px-4 py-2 text-sm">
              <div  className="font-medium text-gray-200 hover:text-gray-100">
                {chat?.object_id ? "Incident #"+chat.object_id : "Chat: "+chat?.slug }
              </div>
              <p className="text-gray-500"></p>
            </div>
            <div className="flex-shrink-0 px-auto m-2">
                < IonIcon icon={chat?.object_id ? chatbox : chatbubbles} size="large" />
            </div>
          </div>
        </Link>
      </div>


    </div>
  </IonItem>
  );
  
  
  export default function Chats() {
    const user = useUser();
    const {userId} = useNotificationsStore({userId: user?.id});
    const {userIds} = useChatStore({userId: user?.id});
    const activeNotifications = useStoreState(NotificationStore, selectors.getActiveNotifications);
    const publicChats = useStoreState(ChatStore, selectors.getPublicChats);
    const membershipChats = useStoreState(ChatStore, selectors.getMembershipChats);

    const supabase = useSupabaseClient();
    const [remoteChatPublic, setRemoteChatPublic] = useState(null);

    useEffect(() => {
      const fetchData = async() => {
        // You can await here
        const { data, error } = await supabase
          .from('ref_data')
          .select('data')
          .eq('ref', 'chat_public')
        if(data && data.length > 0){
          const remoteAppVersionData = data[0];
          setRemoteChatPublic(remoteAppVersionData?.data);
       }
      }
      fetchData();
  
    }, []);
  
    
    return (
      <div className="max-w-xl my-4 mx-auto">
        {remoteChatPublic === 'false' &&
          <ChatLinkouts/>
        }

        {remoteChatPublic === 'true' && 
        <>
          <label className="block text-sm px-6 font-medium text-gray-700 dark:text-white"  key="public-channel-label">
              Public Channels
            </label>
      
            <ul role="list" className="mt-3 grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 overflow-y-scroll h-1/2">
              {publicChats.map((chatItem) => (
                <ChatItem chat={chatItem} chaturl={'/tabs/chats/'+chatItem?.id} key={"pub"+chatItem.id}  />
              ))}
            </ul>

            <br/>
          </>
        }

        <br/>

        <label className="block text-sm px-6 font-medium text-gray-700 dark:text-white"  key="member-channel-label">
          Your Incident Channels
        </label>
  
        <ul role="list" className="mt-3 grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 overflow-y-scroll h-1/2">
          {membershipChats.map((chatItem) => (
            <ChatItem chat={chatItem} chaturl={'/tabs/incidents/'+chatItem?.object_id} key={"mc"+chatItem.id} />
          ))}
        </ul>
      </div>
    )
  }
  
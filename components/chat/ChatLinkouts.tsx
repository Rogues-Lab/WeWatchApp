

import { IonButton, IonIcon } from '@ionic/react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import UserProfileAvatar from '../ui/UserProfileAvatar';
import { eyeOff, eye, peopleCircleOutline } from 'ionicons/icons';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState, useRef } from 'react';
import UserProfile from '../modals/UserProfile';
import { FabUgcMessageActions } from '../cards/FabUgcMessageActions';
import Link from 'next/link';


const examplProjects = [
  { "name": "We Watch General", "initials": "WW", "href": "https://www.facebook.com/groups/nosmallcreator", "subtext": "Facebook Group", "bgColor": "bg-ww-primary" },
  { "name": "We Watch Help", "initials": "HP", "href": "#", "subtext": "Facebook Group", "bgColor": "bg-purple-600" },
  { "name": "Cairns", "initials": "CN", "href": "#", "subtext": "WeWatch Partner Group", "bgColor": "bg-yellow-500" },
  { "name": "Townsville", "initials": "TV", "href": "#",  "subtext": "WeWatch Partner Group", "bgColor": "bg-green-500" },
  { "name": "Far North Qld", "initials": "NQ", "href": "#",  "subtext": "WeWatch Partner Group", "bgColor": "bg-pink-600" },
  { "name": "Regional Qld", "initials": "RQ", "href": "#",  "subtext": "WeWatch Partner Group", "bgColor": "bg-green-600" },
  { "name": "South East Qld", "initials": "CD", "href": "#",  "subtext": "WeWatch Partner Group", "bgColor": "bg-purple-600" },
  { "name": "New South Wales", "initials": "NSW", "href": "#",  "subtext": "WeWatch Partner Group", "bgColor": "bg-blue-500" },
  { "name": "Victoria", "initials": "RC", "href": "#",  "subtext": "WeWatch Partner Group", "bgColor": "bg-green-500" }
]



export default function ChatLinkouts() {
  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
  }

  const supabase = useSupabaseClient();
  const [projects, setProjects] = useState<any>(null);

  useEffect(() => {
    const fetchData = async() => {
      // You can await here
      const { data, error } = await supabase
        .from('ref_data')
        .select('data')
        .eq('ref', 'chat_external')
      debugger;
      if(data && data.length > 0){
        const remoteData = data[0]?.data;
      
        setProjects(JSON.parse(remoteData));
     }
    }
    fetchData();
  
  
  }, []);

  const listRef = useRef(null);

  return (
    <>
    <h2 className="text-sm py-2 font-medium text-gray-300 mx-10 px-auto">Facebook Groups</h2>
    <div className="overflow-y-scroll h-60 rounded-md border-b border-l border-t border-b border-gray-200'">
     
      <ul ref={listRef} role="list" className="mt-3 px-6 grid grid-cols-1 gap-5  sm:gap-4 lg:grid-cols-2">
        {projects && projects.map((project) => (
          <li key={project.name} className="col-span-1 flex rounded-md shadow-sm">
            <div
              className={classNames(
                project.bgColor,
                'flex w-16 flex-shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white rounded-l-md border-b border-l border-t border-gray-200'
              )}
            >
              {project.initials}
            </div>
            <div className="flex flex-1  w-full items-center justify-between truncate rounded-r-md border-b border-r border-t border-gray-200 ">
              <Link href={project.href} target='_blank' rel='noreferrer noopener' className="font-medium  w-full text-gray-200 hover:text-gray-100">
                <div className="flex flex-1 w-full  items-center justify-between">
                  <div className="flex-1 w-full px-4 py-2 text-sm">
                    <div  className="font-medium text-gray-200 hover:text-gray-100">
                      {project.name}
                    </div>
                    <p className="text-gray-500">{project.subtext}</p>
                  </div>
                  <div className="flex-shrink-0 px-auto m-2">
                      < IonIcon icon={peopleCircleOutline} size="large" />
                  </div>
                </div>
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
    </>
  );
}
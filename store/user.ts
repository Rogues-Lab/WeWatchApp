import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useState, useEffect } from 'react'
import { addToNewMap, arrayToMap } from '../components/util/data'
import { Store, useStoreState } from 'pullstate';
import { enableMapSet } from 'immer';
import * as selectors from './selectors';
enableMapSet();

export const UserStore = new Store({
  userProfiles: new Map(),
  userIds: [],
  authUser: undefined,
  authUserProfile: undefined,
  pushToken: undefined,
  location: undefined,
  updatedTab: undefined,
});

/**
 * @param {number} userId load user profile
 * @param {array[number]} userIds load users profile
 */
export const useUserStore = (props) => {
  const authUser = useUser();
  const supabase = useSupabaseClient();
  const [userIds, setUserIds] = useState([])
  
  // Update when the props changes (effect to listen for [props.userId])
  useEffect(() => {
    if (props?.userId?.length > 0) {
      if(userIds.includes(props.userId)){
        return;
      }
      if(!userIds.includes(props.userId)){
          setUserIds([...userIds, props.userId]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.userId, supabase])

  useEffect( () => {
    if (props.userIds && props.userIds.length > 0){
      setUserIds(props.userIds)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.userIds, supabase])


  useEffect( () => {
    const handleAsync = async () => {
      const result = await fetchUsers(userIds, supabase);
      // console.log("userIds", userIds, result)
      UserStore.update(s => {
        s.userProfiles = arrayToMap(result.data,'id')
      });
    }
    if (userIds && userIds.length > 0){
      handleAsync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userIds, supabase])

  useEffect( () => {
    // load auth user profile
    const handleAsync = async () => {
      const result = await fetchUser(authUser.id, supabase);
      UserStore.update(s => {
        s.authUser = authUser;
        s.authUserProfile = result.data;
      });

      return result; 
    }

    // check if authuser and profile
    if (authUser){
      // load from supabase
      handleAsync();
    } else{
      // clear profile
      UserStore.update(s => {
        s.authUser = null;
        s.authUserProfile = null;
      });
    }
    
  }, [authUser, supabase])


  return {
    // We can export computed values here to map the authors to each message
    userIds,
  }
}

/**
 * Fetch a single user
 * @param {number} userId
 */
export const fetchUser = async (userId,  supabase) => {
  try {
    let { data, error } = await supabase.from('users').select(`*`).eq('id', userId).single()
    return { data, error }
  } catch (error) {
    console.error('error', error)
  }
}

/**
 * Fetch a multiple user
 * @param {array} userIds
 */
export const fetchUsers = async (userIds, supabase) => {
  try {
    const { data, error } = await supabase.from('users').select(`*`).in('id', userIds)
    return { data, error }
  } catch (error) {
    console.error('error', error)
  }
}


/**
 * hide a message from the display
 * @param {number} message_id
 */
export const updateProfile = async (newProfile, supabase) => {
  try {
    let result = await supabase.from('users')
          .update(newProfile).eq('id', newProfile.id);
    UserStore.update(s => {
      s.userProfiles = s.userProfiles.set(result.newProfile.id, newProfile)
    });
    return result
  } catch (error) {
    console.log('error', error)
  }
}

export const updateUser = async (authUser) => {
  try {
    UserStore.update(s => {
      s.authUser = authUser
    });
    return authUser
  } catch (error) {
    console.log('error', error)
  }
}

export const removeUser1 = async (userId, supabase) => {
  try {

    const { data, error } = await supabase.from('users').select(`*`).in('id', userId)

    // TODO CASCADE DELETE
    // userId = '9af98cc8-4734-40d6-ada9-9626650136d4'
    // delete from public.files where user_id in ('9af98cc8-4734-40d6-ada9-9626650136d4');
    // delete from public.notifications where user_id in ('9af98cc8-4734-40d6-ada9-9626650136d4');
    // delete from public.messages where user_id in ('9af98cc8-4734-40d6-ada9-9626650136d4');
    // delete from public.chat_members where user_id in ('9af98cc8-4734-40d6-ada9-9626650136d4');
    // delete from public.chats where user_id in ('9af98cc8-4734-40d6-ada9-9626650136d4');
    // delete from public.incidents where user_id in ('9af98cc8-4734-40d6-ada9-9626650136d4');
    // delete from public.reports where user_id in ('9af98cc8-4734-40d6-ada9-9626650136d4');
    // delete from public.users where id in ('9af98cc8-4734-40d6-ada9-9626650136d4');
    // delete from auth.users where id in ('9af98cc8-4734-40d6-ada9-9626650136d4');


    // TODO remove deleted user from UserStore
  } catch (error) {
    console.log('error', error)
  }
}

export const removeUser = async (userId: string, supabase) => {
  try {
    const result = await supabase.rpc('remove_user', { user_id: userId});
    // TODO remove deleted user from UserStore
    return result;
  } catch (error) {
    console.log('error', error);
  }
};

export const updatePushToken = async (pushToken) => {
  try {
    UserStore.update(s => {
      s.pushToken = pushToken
    });
    return pushToken
  } catch (error) {
    console.log('error', error)
  }
}

export const updateLocation = async (location) => {
  try {
    UserStore.update(s => {
      s.location = location
    });
    return location
  } catch (error) {
    console.log('error', error)
  }
}


export const updateTab = async (updated) => {
  try {
    UserStore.update(s => {
      s.updatedTab = updated
    });
    return updated
  } catch (error) {
    console.log('error', error)
  }
}
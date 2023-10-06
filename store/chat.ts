import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Store } from 'pullstate';
import { useState, useEffect } from 'react'
import { arrayToMap, getPagination } from '../components/util/data'

export const ChatStore = new Store({
  authors: new Map(),
  membershipChats: [],
  userIds: [],
  chats: [],
  messages: [],
});

/**
 * @param {number} chatId the currently selected Chat
 */
export const useChatStore = (props) => {

  const [userIds, setUserIds] = useState([])
  const messages = ChatStore.useState(s => s.messages);

  const [newMessage, handleNewMessage] = useState(null)
  const [updateMessage, handleUpdatedMessage] = useState(null)
  const [newChat, handleNewChat] = useState(null)
  const [newOrUpdatedUser, handleNewOrUpdatedUser] = useState(null)
  const [deletedChat, handleDeletedChat] = useState(null)
  const [deletedMessage, handleDeletedMessage] = useState(null)

  const supabase = useSupabaseClient();

  const chats = ChatStore.useState(s => s.chats);
  const publicChats = ChatStore.useState(s => s.chats.filter(chat=> chat.public));
  // Load initial data and set up listeners
  useEffect(() => {

    //Load Chats
    fetchChats((chats) => {
      ChatStore.update(s => {
        s.chats = chats;
      });
     }, supabase);

    // Listen for new and deleted messages
    const messageListener = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => handleNewMessage(payload.new)
      ).on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        (payload) => handleUpdatedMessage(payload.new)
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages' },
        (payload) => handleDeletedMessage(payload.old)
      )
      .subscribe()

    // Listen for new and deleted chats
    const chatListener = supabase
      .channel('public:chats')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chats' },
        (payload) => handleNewChat(payload.new)
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'chats' },
        (payload) => handleDeletedChat(payload.old)
      )
      .subscribe()
    // Cleanup on unmount
    return () => {

      const channels = supabase.getChannels();
      channels.forEach(channel => {
        if (channel.topic === 'public:messages' || channel.topic === 'public:chats') {
          console.log("unsubscribe channel", channel)
          channel.unsubscribe();
        }
      });
    }
  }, []);

  // Update when the route changes
  useEffect(() => {
    if (props?.chatId > 0) {
      fetchMessages(props.chatId, (messages) => {
        //Update the store
        ChatStore.update(s => {
          s.messages = messages;
        });
        const userIds = messages.map(message => message.user_id);
        if(userIds?.length > 0){
            const _userIds = Array.from(new Set(userIds));
            setUserIds(_userIds);
            ChatStore.update(s => {
              s.userIds = _userIds;
            });
        } else {
            setUserIds([]);
        }
      }, supabase)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.chatId])



  // Update when the route changes
  useEffect(() => {
    const handleAsync = async () => {
      const result = await fetchUserChatMemberships(props.userId,null, supabase);
      ChatStore.update(s => {
        s.membershipChats = result.data;
      });
      return result
    }

    if (props?.userId?.length > 0) {
      handleAsync()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.userId])

  // New message received from Postgres
  useEffect(() => {
    if (newMessage && newMessage.chat_id === Number(props.chatId)) {
      const handleAsync = async () => {
        let authorId = newMessage.user_id
        if (!userIds.includes(authorId)) await fetchUser(authorId, (user) => handleNewOrUpdatedUser(user), supabase)
        ChatStore.update(s => {
          s.messages = messages.concat(newMessage);
        });
      }
      handleAsync()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMessage])

  // Updated message received from Postgres
  useEffect(() => {
    if (updateMessage && updateMessage.chat_id === Number(props.chatId)) {
      const handleAsync = async () => {
        let authorId = updateMessage.user_id
        if (!userIds.includes(authorId)) await fetchUser(authorId, (user) => handleNewOrUpdatedUser(user), supabase)

        const index = messages.findIndex(rect => rect?.id === updateMessage?.id)
        if (index !== -1) {
          // Object exists in the array, replace it
          const newMessages = [...messages]
          newMessages[index] = updateMessage;
          //Update the store

          ChatStore.update(s => {
            s.messages = newMessages;
          });
        }
      }
      handleAsync()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateMessage])



  // Deleted message received from postgres
  useEffect(() => {
    if (deletedMessage)  {
      ChatStore.update(s => {
        s.messages = messages.filter((message) => message.id !== deletedMessage.id )
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletedMessage])

  // New chat received from Postgres
  useEffect(() => {
    if (newChat) {
      ChatStore.update(s => {
        s.chats = chats.concat(newChat)
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newChat])

  // Deleted chat received from postgres
  useEffect(() => {
    if (deletedChat) {
      ChatStore.update(s => {
        s.chats = chats.filter((chat) => chat.id !== deletedChat.id);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletedChat])

  // New or updated user received from Postgres
  useEffect(() => {
    if (newOrUpdatedUser) {
        if (!userIds.includes(newOrUpdatedUser.id)){
             ChatStore.update(s => {
              s.userIds = [...s.userIds, newOrUpdatedUser.id];
              s.authors = s.authors.set(newOrUpdatedUser.id, newOrUpdatedUser);
            });
            
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newOrUpdatedUser]);

  useEffect( () => {
    const handleAsync = async () => {
      const result = await fetchUsers(userIds, null, supabase);
      ChatStore.update(s => {
        s.authors = arrayToMap( result.data,'id');
      });
    }
    if (userIds && userIds.length > 0){
      handleAsync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userIds])


  return {
    userIds,
  }
}

/**
 * Fetch all chats
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export const fetchChats = async (setState, supabase) => {
  try {
    let { data } = await supabase.from('chats').select('*').order('inserted_at');
    if (setState) setState(data)
    return data
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Fetch paged chats
 */
export const fetchPagedChats = async (page=0, pageSize = 20, supabase) => {
  try {
    const { from, to } = getPagination(page, pageSize);
    let { data } = await supabase.from('chats').select('*').order('inserted_at').range(from, to);
    let { count } = await supabase.from('chats').select('*', { count: 'exact' });

    return { data, count, page, pageSize }

  } catch (error) {
    console.log('error', error)
  }
}


/**
 * Fetch a single chat
 * @param {number} chatId
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export const fetchChat = async (chatId, setState, supabase) => {
  try {
    let { data, error } = await supabase.from('chats').select(`*`).eq('id', chatId).single()
 
    if (setState) setState(data)
    return {data, error}
  } catch (error) {
    console.log('error', error)
  }
}


/**
 * Fetch a single user
 * @param {number} userId
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export const fetchUser = async (userId, setState, supabase) => {
  try {
    let { data, error } = await supabase.from('users').select(`*`).eq('id', userId).single()
    if (setState) setState(data)
    return { data, error }
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Fetch a multiple user
 * @param {array} userIds
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export const fetchUsers = async (userIds, setState, supabase) => {
  try {
    const { data, error } = await supabase.from('users').select(`*`).in('id', userIds)
    if (setState) setState(data)
    return { data, error }
  } catch (error) {
    console.log('error', error)
  }
}

export const findObjectChat = async (object_type, object_id, setState, supabase) => {
  const { data } = await supabase.from('chats').select(`id`).eq('object_type',object_type).eq('object_id',object_id)
  if (setState && data && data.length > 0) setState(data[0].id)
  return data
}

/**
 * Fetch all messages and their authors
 * @param {number} chatId
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export const fetchMessages = async (chatId, setState, supabase) => {
  try {
    let { data } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('inserted_at')
    if (setState) setState(data)
    return data
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Fetch all messages and their authors
 * @param {number} userId
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export const fetchUserChatMemberships = async (userId, setState, supabase) => {
  try {

    let { data, error } = await supabase
      .from('chats')
      .select('*, chat_members!inner(*)')
      .eq('chat_members.user_id', userId)
      .eq('public', false)
      .order('inserted_at', {ascending: false})
    if (setState) setState(data)
    return {data, error}
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Insert a new chat into the DB
 * @param {string} slug The chat name
 * @param {number} user_id The chat creator
 */
export const addChat = async (slug, user_id, isPublic, visible, object_type, object_id, supabase) => {
  try {
    let { data } = await supabase.from('chats').insert([{ slug, user_id, public: isPublic, visible, object_type, object_id }]).select()
    return data
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Insert a new message into the DB
 * @param {string} message The message text
 * @param {number} chat_id
 * @param {number} user_id The author
 */
export const addMessage = async (text, chat_id, user_id, supabase) => {
  try {
    let { data } = await supabase.from('messages').insert([{ text, chat_id, user_id }]).select()
    return data
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Delete a chat from the DB
 * @param {number} chat_id
 */
export const deleteChat = async (chat_id, supabase) => {
  try {
    let { data } = await supabase.from('chats').delete().match({ id: chat_id })
    return data
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Delete a message from the DB
 * @param {number} message_id
 */
export const deleteMessage = async (message_id, supabase) => {
  try {
    let { data } = await supabase.from('messages').delete().match({ id: message_id });
    return data
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * hide a message from the display
 * @param {number} message_id
 */
export const hideMessage = async (message_id, supabase) => {
    try {
      let { data } = await supabase.from('messages')
            .update({visible: false} ).eq('id', message_id);
      return data
    } catch (error) {
      console.log('error', error)
    }
  }

/**
 * unhide a message from the display
 * @param {number} message_id
 */
  export const unhideMessage = async (message_id, supabase) => {
    try {
      let { data } = await supabase.from('messages')
            .update({visible: true} ).eq('id', message_id);
      return data
    } catch (error) {
      console.log('error', error)
    }
  }
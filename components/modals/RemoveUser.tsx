import {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonNote,
    IonLabel,
    IonToast,
  } from '@ionic/react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { SupabaseClient } from '@supabase/supabase-js';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { close } from 'ionicons/icons';
import { useStoreState } from 'pullstate';
import React, { useRef, useState } from 'react';
import { createReport } from '../../store/report';
import { UserStore, useUserStore } from '../../store/user';
import { ErrorCard } from '../cards/ErrorCard';
import UserProfileAvatar from '../ui/UserProfileAvatar';
import * as selectors from '../../store/selectors';
  
  const RemoveUser = ({ open, onDidDismiss, reportMode="removeAccount", incident=null, personId=null, person=null, cover_photo_url=null, file=null, message=null }) => {  
  
    const [reason, setReason] = useState('');
    const authUser = useUser();
    const supabase = useSupabaseClient();

    const [error, setError] = useState("");
    const [isToastOpen, setIsToastOpen] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string | undefined>();

    const resetData = () => {
      setReason('');
      setError('');
    }

    const handleReason = (event) => {
      setReason(event.target.value || '');
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();    

      const report = newReportData();
      try{ 
       setError('');
       const {data, error} = await createReport(report, supabase);

       if(data && data[0]){
        //Notify User
        setToastMessage("Lodged Request #"+data[0]?.id);
        setIsToastOpen(true);
       }
        if (error){
          setError(error?.message)
        }

      } catch (e) {
        console.error('failed to lodged',e);
        if (e){
          setError(e?.message)
        }
      }
      resetData();
      onDidDismiss();
    }

    const newReportData = () => {


      const object_type='person';
      let object_id = personId ? personId : person?.id;
      
      let reportJson = {
        user_id: authUser?.id ,
        reason: reason,
        mode: reportMode,
        object_type: object_type,
        object_id: object_id
      }

      return (reportJson)
    }

    const handleCancel = () => {
      resetData();
      onDidDismiss();
    }

    return (
      <IonModal isOpen={open} onDidDismiss={onDidDismiss}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Remove my Account</IonTitle>
            <IonButton slot="end" fill="clear" color="primary" onClick={onDidDismiss}>
              <IonIcon icon={close} />
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4 overflow-scroll mx-4">
            <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
              <div className="space-y-6 sm:space-y-5">
                <div>
                  {/* <h3 className="text-lg font-medium leading-6 text-gray-900">My Public Profile</h3> */}
                  <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-200">
                    This information will be sent to moderators for deletion.
                  </p>
                </div>

                <div className="space-y-6 sm:space-y-5">

                  <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                    <label htmlFor="about" className="block text-sm font-medium text-gray-700 dark:text-gray-300 sm:mt-px sm:pt-2">
                      Reason for Account deletion
                    </label>
                    <div className="mt-1 sm:col-span-2 sm:mt-0">
                      <textarea
                        id="about"
                        name="about"
                        rows={3}
                        value={reason}
                        onChange={handleReason}
                        className="block w-full max-w-lg rounded-md border-gray-300 text-gray-500 dark:text-gray-300  dark:bg-black shadow-sm focus:border-ww-secondary focus:ring-ww-secondary caret-ww-secondary sm:text-sm"
                      />
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Write a few sentences for the moderators.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              {error && 
                <ErrorCard errorMessage={error}/>
              }
            </div>
            <div className="pb-4">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-ww-secondary focus:ring-offset-2"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-ww-primary  py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-ww-secondary focus:outline-none focus:ring-2 focus:ring-ww-secondary focus:ring-offset-2"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
          <IonToast
            isOpen={isToastOpen}
            message={toastMessage}
            duration={2000}
            position={'bottom'}
            color={'success'}
            onDidDismiss={() => setIsToastOpen(false)}
        />
        </IonContent>
      </IonModal>
    );
  };
  
  export default RemoveUser;
  

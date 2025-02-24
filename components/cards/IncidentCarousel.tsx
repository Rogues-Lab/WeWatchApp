import {
  IonFab,
  IonFabButton,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonItem,
  IonIcon,
  IonToast,
  IonLabel,
  IonContent,
  IonMenuButton,
  IonFabList,
} from '@ionic/react';
import React from 'react';
import { FabUgcAvatar } from './FabUgcAvatar';
import { FabUgcFileActions } from './FabUgcFileActions';

export const IncidentCarousel = ({files, creator}) => {

  const fileUrl = (file) => {
    return "https://raxdwowfheboqizcxlur.supabase.co"+ file.file_name;
  }

  return (
    <div className="w-full mx-auto " >
      { files && files?.length > 0 ? <IonTitle size="large">Photos</IonTitle> : <IonTitle size="large">No Photos</IonTitle>}
      {
       files && files?.map((file, index) => {
          return (
            <div key={index} className="w-full my-2 mx-auto relative">
              {/* assuming the files are only the incident creator */}
              <FabUgcAvatar profile={creator} />
              <FabUgcFileActions file={file} creator={creator} />
              <img src={fileUrl(file)} alt="Incident Photo" />
            </div>
          );
        })
      }
    </div>
  );
}
    
  export default IncidentCarousel;
import React, {useState} from 'react';
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

import { eye, easel } from 'ionicons/icons';
import CategoriesIcons from '../ui/CategoriesIcons';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';

const MapInfo = (props) => {
  const { incident, history } = props;
  const displayName = `#${incident?.id} - ${incident?.name}`;

  const handleClick = () => {
    history.push(`/tabs/incidents/${incident.id}`);
  }

  return (
    <div className="grid grid-rows-2 text-gray-800 bg-white dark:bg-black dark:text-white" onClick={() => handleClick()}>
      <div className='text-2xl'>
        <CategoriesIcons incident={incident} showAll={false}/>
      </div>
      
      <div className='text-md'>
        <h2 className="text-gray-800 bg-white dark:bg-black dark:text-white">{displayName}</h2>
        
        <div className="text-ww-primary float-right">
          {formatDistanceToNow(new Date(incident.incident_at),{addSuffix: true})}
        </div>
      </div>
    </div>
  );
}

export default React.memo(MapInfo);
import {
  IonPage,
  IonHeader,
  IonItem,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonToggle,
  IonLabel,
  IonCard,
  IonCardContent,
} from '@ionic/react';
import React, { useState } from 'react';
import Login from '../auth/Login';
import Signup from '../auth/Signup';
import { Verify } from '../auth/Verify';
import { displayPhone } from '../util/display';
  
export const SignupPage = ({history}) => {

  const [phoneNumber, setPhoneNumber] = useState<string>();
  const [displayPhoneNumber, setDisplayPhoneNumber] = useState<string>();
  const [authMode, setAuthMode] = useState<'login' | 'verify' | 'signup' | 'post'>('signup');

  const callSetPhoneNumber = (phoneNumber) => {
    setPhoneNumber(phoneNumber);
    setDisplayPhoneNumber(displayPhone(phoneNumber));
  }

  const handlePost = async() => {
    history.push('/tour');
    //reset state to login
    setTimeout(async () => {
      setAuthMode('login');
    }, 1000);
  }

  const callSetAuthMode = (verify) => {
    setAuthMode(verify);
    if (verify === 'post'){
      handlePost();
    }
  }
  
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle></IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className='h-full'>
            { authMode == 'login' && <Login sendPhoneNumberFnc={callSetPhoneNumber} sendAuthStateFnc={callSetAuthMode} />}
            { authMode == 'signup' && <Signup sendPhoneNumberFnc={callSetPhoneNumber} sendAuthStateFnc={callSetAuthMode} />}
            { authMode == 'verify' && <Verify phoneNumber={phoneNumber} displayPhoneNumber={displayPhoneNumber} sendAuthStateFnc={callSetAuthMode}/>}
            { authMode == 'post' && <p>Logged in....</p>}
          </div>
        </IonContent>
    </IonPage>
    );
  }

  export default SignupPage;


import { Capacitor } from '@capacitor/core';
import { Geolocation, Position } from '@capacitor/geolocation';

export const checkLocationPermissions = async () => {
    const platform = Capacitor.getPlatform();
    console.log(`Current platform: ${platform}`);
    if (platform === 'ios' || platform === 'android') {
      const state = await Geolocation.requestPermissions();
      console.log('Location permission status: ', state);
      if (state.location !== 'granted') {
        console.log('Location permission not granted');
        return false;
      }
    }
    if (platform === 'web') {
      console.log('navigator?.geolocation:',navigator?.geolocation);
      navigator?.geolocation?.getCurrentPosition(
        (position) => {
          console.log('Latitude:', position.coords.latitude);
          console.log('Longitude:', position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
        });
      }
    return true;
  };

const getNavigatorCurrentPosition = (options?: PositionOptions): Promise<Position> => {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
};

export const getCurrentLocation = async () => {
    const platform = Capacitor.getPlatform();
    console.log(`Current platform: ${platform}`);
    if (platform === 'ios' || platform === 'android') {
        const positionArgs = {enableHighAccuracy: true}
        const position = await Geolocation.getCurrentPosition(positionArgs);
        return position;
    }
    if (platform === 'web') {
        console.log('navigator?.geolocation:', navigator?.geolocation);
        const position = await getNavigatorCurrentPosition();
        console.log('Latitude:', position.coords.latitude);
        console.log('Longitude:', position.coords.longitude);
        return position;
    }
}
        

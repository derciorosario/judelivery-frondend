// src/services/push.js
import { PushNotifications } from '@capacitor/push-notifications';
import client from '../api/client';


// Send token to backend
async function sendTokenToServer(userId, token, platform = 'android') {
  return client.post('/device-tokens', {
    token,
    userId,
    platform
  });
}

export async function registerPush(userId,navigate,data) {

  console.log('registerPush',userId)

  if(!data) return

  try {
    const perm = await PushNotifications.checkPermissions();
    let status = perm.receive;

    if (status !== 'granted') {
      const request = await PushNotifications.requestPermissions();
      status = request.receive;
    }

    if (status !== 'granted') {
      console.warn('Push permission not granted');
      return;
    }

    await PushNotifications.register();

    // Fires when registration token is created
    PushNotifications.addListener('registration', async (token) => {

      console.log('Device token:', token.value);
      try {
        await sendTokenToServer(userId, token.value, getPlatform());
        data.setPushRegistered(true)
      } catch (err) {
        console.error('Failed to send token to server', err);
      }

    });

    PushNotifications.addListener('registrationError', (err) => {
      console.error('Registration error:', err);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received', JSON.stringify(notification));
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {

      console.log({a:action?.notification?.data,b:action?.notification})
       
        console.log('pushNotificationActionPerformed',action?.notification?.data?.link)
        try{
            if(action?.notification?.data?.path){
                 navigate(action?.notification?.data?.path)
            }else if(action?.notification?.data?.type=='account_status_update'){
                 navigate('/profile')
            }
        }catch(e){
          console.error('pushNotificationActionPerformed error', e);
        }

      /****eg:
       * 
       * {"actionId":"tap","notification":{"id":"0:1764348682303507%57cf760e57cf760e","data":{"google.delivered_priority":"high","google.original_priority":"high","from":"255602847382","link":"https://54links.com/profile","type":"account_status_update","collapse_key":"com.panafricanbi.fiftyfourlinks"}}}
       */

        console.log('Action performed', JSON.stringify(action));
    });

  } catch (e) {
    console.error('registerPush error', e);
  }
}

function getPlatform() {
  return navigator.userAgent.match(/android/i) ? 'android' : 'web';
}

// Remove device token
export async function unregisterTokenFromServer(token) {
  return client.delete('/api/device-tokens', {
    data: { token }
  });
}

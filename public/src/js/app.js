if(!window.Promise) {
    window.Promise = Promise;
}

var deferredPrompt;
var enableNotificationsButtons = document.querySelectorAll('.enable-notifications');
if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function () {
      console.log('Service worker registered!');
    })
    .catch(function(err) {
      console.log(err);
    });
}

window.addEventListener('beforeinstallprompt', function(event) {
  console.log('beforeinstallprompt fired');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});


if("Notification" in window) {
  console.log('In Resgister notification',enableNotificationsButtons)
  if (Notification.permission != "granted") {
  for(var i=0; i< enableNotificationsButtons.length; i++){
    enableNotificationsButtons[i].style.display = 'inline-block';
    enableNotificationsButtons[i].addEventListener('click',notifyMe);
    console.log('Adding Not Handler')
  }
}
}

function HideNotificationButtons(){
  for(var i=0; i< enableNotificationsButtons.length; i++){
    enableNotificationsButtons[i].style.display = 'none';   
    }
}

function displayConfirmnotification() {
  if('serviceWorker' in  navigator) {
    var options = {
      body: ' You succesfully suscribed to Notification',
      icon: '/src/images/icons/app-icon-96x96.png',
      image: '/src/sf-boat.jpg',
      dir: 'ltr',
      lang: 'en-US',
      vibrate:[100,50,100],
      badge:'/src/images/icons/app-icon-96x96.png',
      tag: 'confirm-notification',
      renotify: false,
      actions: [
        {action: 'confirm', title:'Okay', icon: '/src/images/icons/app-icon-96x96.png'},
        {action: 'cancel', title:'Cancel', icon: '/src/images/icons/app-icon-96x96.png' }
      ]



    };

    navigator.serviceWorker.ready.then(function(swreg) {
      swreg.showNotification('Sussessfully Suscribed', options);
    })
  }
}

function configurePushSub() {
  if(!('serviceWorker' in navigator)) {
    return;
  }
  var reg;
  navigator.serviceWorker.ready.then(function(swreg){
    console.log('Ready Working ..');
    reg = swreg;
    return swreg.pushManager.getSubscription();
  })
  .then(function(sub){
    console.log('Sub',sub);
    if(sub === null) {
      // create a new Subscription
      var vapidPublicKey = 'BNqgW3udtCpfYFYS2BGmOrawCpik8jZWYxp0ZKM7JZ25Dijdsbo4r51y7mQqOOo6jvzRCHnIK54TnPcKxnvoiAQ';
      var convertedVK = urlBase64ToUint8Array(vapidPublicKey);
      return reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVK
      });
    } else {
      console.log('OMG IN ELSE BLOCK')
      // We have Subscription

    }
  }).then(function(newSub){
    console.log('New Subs', newSub);
    return fetch('https://loindia-6cb36.firebaseio.com/subList.json', {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
     },
     body: JSON.stringify(newSub)
     })
  })
  .then(function(res){
    if(res.ok){
      displayConfirmnotification();
    }
    }).catch(function(err){
      console.log(err);
    });
}

function notifyMe() {
  console.log('In Notify Me');
  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  }

  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    HideNotificationButtons();
    displayConfirmnotification();
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== "denied") {
    Notification.requestPermission(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        HideNotificationButtons();
        configurePushSub();
      }
    });
  }

  // At last, if the user has denied notifications, and you 
  // want to be respectful there is no need to bother them any more.
}

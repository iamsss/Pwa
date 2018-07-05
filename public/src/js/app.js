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


function notifyMe() {
  console.log('In Notify Me');
  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  }

  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    var notification = new Notification("Hi there!");
    HideNotificationButtons();
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== "denied") {
    Notification.requestPermission(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        HideNotificationButtons();
        var notification = new Notification("Hi there!");
      }
    });
  }

  // At last, if the user has denied notifications, and you 
  // want to be respectful there is no need to bother them any more.
}
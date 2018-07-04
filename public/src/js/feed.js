
var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
var form = document.querySelector('form');
var titleInput = document.querySelector('#title');
var locationInput = document.querySelector('#location');

function UnRegisterSw(){
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
            registration.unregister()
    }}).catch(function(err) {
        console.log('Service Worker registration failed: ', err);
    });
}
}


function openCreatePostModal() {
  
  UnRegisterSw();
  createPostArea.style.display = 'block';
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function(choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

// Disabling On Demand Cache
// function onSaveButtonClicked(event){
//   console.log('Clicked');
  // if('caches' in window){
  //   caches.open('user-requested')
  //   .then(function(cache){
  //     cache.add('https://httpbin.org/get');
  //     cache.add('/src/images/sf-boat.jpg');
  //   })
//   }
// }
shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

function clearCards() {
  while(sharedMomentsArea.hasChildNodes()){
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url('+ data.image +')';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardTitle.style.color = 'white';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  cardWrapper.appendChild(cardSupportingText);
  // var cardSaveButton = document.createElement('button');
  // cardSaveButton.textContent = 'Save';
  // cardSaveButton.addEventListener('click', onSaveButtonClicked)
  // cardSupportingText.appendChild(cardSaveButton);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

var url  = 'https://us-central1-loindia-6cb36.cloudfunctions.net/storePostData';
var networkDataReceived = false;

function updateUI(data) {
  for(var i = 0; i < data.length; i++) {
    createCard(data[i]);
  }
}

fetch(url)
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    console.log('Fetch data from web',data);
    networkDataReceived = true;
    clearCards();
    var DataArray = [];
    for(var key in data) {
      DataArray.push(data[key]);
    }
    updateUI(DataArray);
  });


  if('indexedDB' in window){
    
      readAllData('posts').then(function(data){
        if(!networkDataReceived){
        console.log('Fetching Data from Cache',data);
        clearCards()
        var DataArray = [];
        for(var key in data) {
          DataArray.push(data[key]);
        }
        updateUI(DataArray);
        }
      })
  }
form.addEventListener('submit', function(event) {
  event.preventDefault();

  if(titleInput.value.trim() === '' || locationInput.value.trim() === ''){
    alert('Please Enter Valid Data');
    return;
  }

  if('serviceWorker' in  navigator && 'SyncManager' in window) {
   
    console.log('In If Block');
    navigator.serviceWorker.register('/sw.js');
    navigator.serviceWorker.ready
    .then(function (sw) {
      console.log('Ready Work')
      var post ={post1: {
        id: new Date().toISOString(),
        title: titleInput.value,
        location: locationInput.value,
        image: 'https://i.pinimg.com/originals/f0/cd/89/f0cd89f679af6e1b004d9f00d96d18ae.jpg'
      }
    }
      console.log(post);
      writeData('sync-posts',post).then(function(){
        return sw.sync.register('sync-new-post');
      })
      .then(function(){
        var snackbarContainer = document.querySelector('#confirmation-toast');
        var data = {message: 'Your Post was saved for syncing'};
        snackbarContainer.MaterialSnackbar.showSnackbar(data);

      })
    });
  }else{
    sendData();
  }
  closeCreatePostModal();
})

function sendData() {
  fetch('https://us-central1-loindia-6cb36.cloudfunctions.net/storePostData', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      id: new Date().toISOString(),
      title: titleInput.value,
      location: locationInput.value,
      image: 'https://i.pinimg.com/originals/f0/cd/89/f0cd89f679af6e1b004d9f00d96d18ae.jpg'
    })
  }).then(function(res) {
    console.log('Data sent',res);
    updateUI();
  })
}
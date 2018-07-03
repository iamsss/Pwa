var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');

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

var url  = 'https://loindia-6cb36.firebaseio.com/posts.json';
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


  if('caches' in window){
    caches.match(url)
      .then(function(response) {
        if(response){
          return response.json();
        }
      })
      .then(function(data){
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

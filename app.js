const chooseSection = document.getElementById('choose-section');
const userSection = document.getElementById('user-section');
const userLetter = document.getElementById('user-letter');
const changeButton = document.getElementById('change-button');
const statusBar = document.getElementById('status-bar');
const userButtons = document.querySelectorAll('.user-button');
const STORAGE_KEY = 'bio-app-user-letter';

function showStatus(message) {
  statusBar.textContent = message;
}

function updateScreen(letter) {
  if (letter) {
    chooseSection.classList.add('hidden');
    userSection.classList.remove('hidden');
    userLetter.textContent = letter;
    showStatus('You are offline-ready. Install this app to your phone for quick access.');
  } else {
    chooseSection.classList.remove('hidden');
    userSection.classList.add('hidden');
    userLetter.textContent = '?';
    showStatus('Choose a user to continue.');
  }
}

function loadUser() {
  const letter = localStorage.getItem(STORAGE_KEY);
  updateScreen(letter);
}

function saveUser(letter) {
  localStorage.setItem(STORAGE_KEY, letter);
  updateScreen(letter);
}

function clearUser() {
  localStorage.removeItem(STORAGE_KEY);
  updateScreen(null);
}

userButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const letter = button.dataset.user;
    saveUser(letter);
  });
});

changeButton.addEventListener('click', () => {
  clearUser();
});

window.addEventListener('load', () => {
  loadUser();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('sw.js')
      .then(() => {
        showStatus('Service worker registered. App can work offline.');
      })
      .catch((error) => {
        showStatus('Service worker registration failed.');
        console.error(error);
      });
  } else {
    showStatus('Browser does not support service workers.');
  }
});

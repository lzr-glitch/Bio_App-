const STORAGE_KEY = 'revisio-ibo-state';
const TODAY = new Date().toISOString().slice(0, 10);
const pages = ['home','reading','flashcards','test','quiz','profile','stats','chapter','weaknesses','badges','recap','settings'];
const sampleQuestions = [
  {
    id: 1,
    chapter: 'Génétique',
    theme: 'Hérédité',
    question: 'Quelle molécule porte l’information génétique ?',
    options: ['ADN', 'ARN', 'Protéine', 'Glucose'],
    answer: 'ADN'
  },
  {
    id: 2,
    chapter: 'Photosynthèse',
    theme: 'Cycle de Calvin',
    question: 'Quelle molécule est produite par le cycle de Calvin ?',
    options: ['Oxygène', 'Glucose', 'ATP', 'Eau'],
    answer: 'Glucose'
  },
  {
    id: 3,
    chapter: 'Cellule',
    theme: 'Membrane',
    question: 'Quel composant assure la perméabilité sélective de la membrane ?',
    options: ['Protéines intégrales', 'ADN', 'Ribosomes', 'Paroi cellulaire'],
    answer: 'Protéines intégrales'
  }
];

const defaultState = {
  currentUser: null,
  streak: 0,
  pending: false,
  lastUpdate: TODAY,
  jokers: 0,
  users: {
    G: { name: 'G', jokers: 0, chapters: {}, flashcards: [], quizzes: [], reading: {}, tests: [], daily: {}, badges: [] },
    R: { name: 'R', jokers: 0, chapters: {}, flashcards: [], quizzes: [], reading: {}, tests: [], daily: {}, badges: [] }
  }
};

const state = loadState();
const startScreen = document.getElementById('start-screen');
const appScreen = document.getElementById('app-screen');
const currentUserBadge = document.getElementById('current-user-badge');
const otherUserBadge = document.getElementById('other-user-badge');
const streakCount = document.getElementById('streak-count');
const streakStatus = document.getElementById('streak-status');
const todayReading = document.getElementById('today-reading');
const todayFlashcards = document.getElementById('today-flashcards');
const todayTested = document.getElementById('today-tested');
const otherProgress = document.getElementById('other-progress');
const homeNotice = document.getElementById('home-notice');
const readingHistory = document.getElementById('reading-history');
const add5min = document.getElementById('add-5min');
const manualMinutes = document.getElementById('manual-minutes');
const setMinutes = document.getElementById('set-minutes');
const saveCardBtn = document.getElementById('save-card');
const clearCardBtn = document.getElementById('clear-card');
const cardQuestion = document.getElementById('card-question');
const cardAnswer = document.getElementById('card-answer');
const cardTags = document.getElementById('card-tags');
const cardExplanation = document.getElementById('card-explanation');
const cardNote = document.getElementById('card-note');
const todayCardsList = document.getElementById('today-cards-list');
const reviewCount = document.getElementById('review-count');
const startReview = document.getElementById('start-review');
const reviewCard = document.getElementById('review-card');
const reviewProgress = document.getElementById('review-progress');
const reviewQuestion = document.getElementById('review-question');
const reviewAnswer = document.getElementById('review-answer');
const showAnswer = document.getElementById('show-answer');
const correctBtn = document.getElementById('correct-btn');
const wrongBtn = document.getElementById('wrong-btn');
const reviewSummary = document.getElementById('review-summary');
const reviewResults = document.getElementById('review-results');
const finishReview = document.getElementById('finish-review');
const startQuiz = document.getElementById('start-quiz');
const quizCard = document.getElementById('quiz-card');
const quizMeta = document.getElementById('quiz-meta');
const quizQuestion = document.getElementById('quiz-question');
const quizOptions = document.getElementById('quiz-options');
const validateQuiz = document.getElementById('validate-quiz');
const quizSummary = document.getElementById('quiz-summary');
const quizResults = document.getElementById('quiz-results');
const finishQuiz = document.getElementById('finish-quiz');
const myJokers = document.getElementById('my-jokers');
const myTotalCards = document.getElementById('my-total-cards');
const myWeekCards = document.getElementById('my-week-cards');
const myTotalTests = document.getElementById('my-total-tests');
const mySuccessRate = document.getElementById('my-success-rate');
const myTotalReading = document.getElementById('my-total-reading');
const otherJokers = document.getElementById('other-jokers');
const otherTotalCards = document.getElementById('other-total-cards');
const otherWeekCards = document.getElementById('other-week-cards');
const otherTotalTests = document.getElementById('other-total-tests');
const otherSuccessRate = document.getElementById('other-success-rate');
const otherTotalReading = document.getElementById('other-total-reading');
const statsCharts = document.getElementById('stats-charts');
const chapterProgress = document.getElementById('chapter-progress');
const weaknessList = document.getElementById('weakness-list');
const badgeList = document.getElementById('badge-list');
const weeklyRecap = document.getElementById('weekly-recap');
const clearData = document.getElementById('clear-data');
const resetApp = document.getElementById('reset-app');

let reviewQueue = [];
let reviewIndex = 0;
let reviewCorrect = 0;
let quizState = null;

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return JSON.parse(JSON.stringify(defaultState));
  try {
    return Object.assign(JSON.parse(JSON.stringify(defaultState)), JSON.parse(raw));
  } catch (e) {
    return JSON.parse(JSON.stringify(defaultState));
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatMinutes(min) {
  return `${min} min`;
}

function getUser(id) {
  return state.users[id];
}

function getOtherUserId() {
  return state.currentUser === 'G' ? 'R' : 'G';
}

function getDaily(user, day = TODAY) {
  if (!user.daily[day]) {
    user.daily[day] = { reading: 0, cards: 0, tested: 0, complete: false };
  }
  return user.daily[day];
}

function initUserDaily() {
  const user = getUser(state.currentUser);
  getDaily(user);
  const other = getUser(getOtherUserId());
  getDaily(other);
}

function checkDayTransition() {
  const last = new Date(state.lastUpdate + 'T04:00:00');
  const now = new Date();
  if (now.toISOString().slice(0, 10) !== state.lastUpdate) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);
    const gDone = getDaily(getUser('G'), yesterdayKey).complete;
    const rDone = getDaily(getUser('R'), yesterdayKey).complete;
    if (now.getHours() >= 4) {
      if (gDone && rDone) {
        state.streak += 1;
        state.pending = false;
      } else if (gDone || rDone) {
        if (!state.pending) state.pending = true;
      } else {
        state.streak = 0;
        state.pending = false;
      }
      state.lastUpdate = now.toISOString().slice(0, 10);
      saveState();
    }
  }
}

function showSection(id) {
  pages.forEach((page) => {
    const el = document.getElementById(`page-${page}`);
    if (el) el.classList.toggle('hidden', page !== id);
    const tab = document.querySelector(`.tab-button[data-nav="${page}"]`);
    if (tab) tab.classList.toggle('active', page === id);
  });
}

function goToPage(page) {
  if (page === 'home') showSection('home');
  else if (page === 'profile') showSection('profile');
  else if (page === 'stats') showSection('stats');
  else if (page === 'chapter') showSection('chapter');
  else if (page === 'badges') showSection('badges');
  else if (page === 'weaknesses') showSection('weaknesses');
  else if (page === 'recap') showSection('recap');
  else if (page === 'settings') showSection('settings');
  else showSection(page);
}

function renderApp() {
  if (!state.currentUser) {
    startScreen.classList.remove('hidden');
    appScreen.classList.add('hidden');
    return;
  }
  startScreen.classList.add('hidden');
  appScreen.classList.remove('hidden');
  currentUserBadge.textContent = `Profil ${state.currentUser}`;
  otherUserBadge.textContent = `Autre profil ${getOtherUserId()}`;
  streakCount.textContent = state.streak;
  streakStatus.textContent = state.pending ? 'En attente' : 'Actif';
  updateHome();
  renderReading();
  renderFlashcards();
  renderProfile();
  renderStats();
  renderChapters();
  renderWeaknesses();
  renderBadges();
  renderRecap();
}

function updateHome() {
  const user = getUser(state.currentUser);
  const other = getUser(getOtherUserId());
  const today = getDaily(user);
  const otherToday = getDaily(other);
  todayReading.textContent = formatMinutes(today.reading);
  todayFlashcards.textContent = today.cards;
  todayTested.textContent = today.tested;
  otherProgress.textContent = otherToday.complete ? 'L’autre a terminé' : 'En cours';
  homeNotice.textContent = today.complete ? 'Tu as terminé ta journée !' : 'Il te reste encore des étapes à valider.';
}

function renderReading() {
  const user = getUser(state.currentUser);
  const daily = getDaily(user);
  readingHistory.innerHTML = '';
  const days = Object.keys(user.reading).sort((a,b)=>b.localeCompare(a)).slice(0, 7);
  days.forEach(day => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `<span>${day}</span><strong>${user.reading[day]} min</strong>`;
    readingHistory.appendChild(item);
  });
  if (days.length === 0) {
    readingHistory.innerHTML = '<div class="history-item"><span>Aucun historique encore</span></div>';
  }
}

function renderFlashcards() {
  const user = getUser(state.currentUser);
  const today = getDaily(user);
  todayCardsList.innerHTML = '';
  const cards = user.flashcards.filter(card => card.date === TODAY);
  if (cards.length === 0) {
    todayCardsList.innerHTML = '<div class="history-item"><span>Aucune carte créée aujourd’hui</span></div>';
    return;
  }
  cards.forEach(card => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `<span>${card.question}</span><strong>${card.tags.join(', ')}</strong>`;
    todayCardsList.appendChild(item);
  });
}

function renderProfile() {
  const user = getUser(state.currentUser);
  const other = getUser(getOtherUserId());
  const userStats = computeStats(user);
  const otherStats = computeStats(other);
  myJokers.textContent = user.jokers;
  myTotalCards.textContent = user.flashcards.length;
  myWeekCards.textContent = userStats.weekCards;
  myTotalTests.textContent = user.tests.length;
  mySuccessRate.textContent = `${userStats.successRate}%`;
  myTotalReading.textContent = `${Object.values(user.reading).reduce((sum, v) => sum + v, 0)} min`;
  otherJokers.textContent = other.jokers;
  otherTotalCards.textContent = other.flashcards.length;
  otherWeekCards.textContent = otherStats.weekCards;
  otherTotalTests.textContent = other.tests.length;
  otherSuccessRate.textContent = `${otherStats.successRate}%`;
  otherTotalReading.textContent = `${Object.values(other.reading).reduce((sum, v) => sum + v, 0)} min`;
}

function computeStats(user) {
  const weekDays = getLastDays(7);
  const weekCards = user.flashcards.filter(card => weekDays.includes(card.date)).length;
  const totalTests = user.tests.length;
  const successRate = totalTests === 0 ? 0 : Math.round((user.tests.filter(t=>t.score>=50).length / totalTests) * 100);
  return { weekCards, successRate };
}

function renderStats() {
  statsCharts.innerHTML = '';
  const days = getLastDays(7).reverse();
  const me = getUser(state.currentUser);
  const other = getUser(getOtherUserId());
  days.forEach(day => {
    const readingCount = me.reading[day] || 0;
    const cardCount = me.flashcards.filter(card => card.date === day).length;
    const tests = me.tests.filter(test => test.date === day).length;
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = `<strong>${day}</strong><div style="display:grid;gap:8px;flex:1">
      ${createBar('Lecture', readingCount, 60)}
      ${createBar('Flashcards', cardCount, 8)}
      ${createBar('Tests', tests, 3)}
    </div>`;
    statsCharts.appendChild(row);
  });
}

function createBar(label, value, max) {
  const width = Math.min(100, Math.round((value / max) * 100));
  return `<div class="bar-row"><span>${label} ${value}</span><div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div></div>`;
}

function renderChapters() {
  const chapters = ['Photosynthèse', 'Génétique', 'Cellule', 'Ecologie'];
  chapterProgress.innerHTML = '';
  chapters.forEach(name => {
    const progress = Math.floor(Math.random() * 80) + 10;
    const item = document.createElement('div');
    item.className = 'chapter-item';
    item.innerHTML = `<span>${name}</span><strong>${progress}% maîtrisé</strong>`;
    chapterProgress.appendChild(item);
  });
}

function renderWeaknesses() {
  const user = getUser(state.currentUser);
  const weakTags = gatherWeakTags(user);
  weaknessList.innerHTML = '';
  if (weakTags.length === 0) {
    weaknessList.innerHTML = '<div class="weakness-item"><span>Aucun point faible pour l’instant</span></div>';
  } else {
    weakTags.forEach(tag => {
      const item = document.createElement('div');
      item.className = 'weakness-item';
      item.innerHTML = `<span>Tag difficile</span><strong>${tag}</strong>`;
      weaknessList.appendChild(item);
    });
  }
}

function gatherWeakTags(user) {
  const wrongCards = user.flashcards.filter(card => card.reviews && card.reviews.some(r => r.result === 'wrong'));
  const tags = wrongCards.flatMap(card => card.tags);
  return [...new Set(tags)].slice(0, 5);
}

function renderBadges() {
  badgeList.innerHTML = '';
  const builtBadges = [
    { label: '7 jours de streak', earned: state.streak >= 7 },
    { label: '30 flashcards créées', earned: getUser(state.currentUser).flashcards.length >= 30 },
    { label: '1 bonus IBO', earned: state.jokers > 0 },
    { label: 'Premier quiz', earned: getUser(state.currentUser).quizzes.length > 0 }
  ];
  builtBadges.forEach(badge => {
    const item = document.createElement('div');
    item.className = 'badge-item';
    item.innerHTML = `<span>${badge.label}</span><strong>${badge.earned ? '✅' : '🔒'}</strong>`;
    badgeList.appendChild(item);
  });
}

function renderRecap() {
  const user = getUser(state.currentUser);
  const other = getUser(getOtherUserId());
  const recap = document.createElement('div');
  recap.className = 'recap-section';
  recap.innerHTML = `
    <span>Temps de lecture cette semaine</span><strong>${sumLast7(user.reading)} min</strong>
    <span>Flashcards créées cette semaine</span><strong>${user.flashcards.filter(card => getLastDays(7).includes(card.date)).length}</strong>
    <span>Tests réalisés cette semaine</span><strong>${user.tests.filter(test => getLastDays(7).includes(test.date)).length}</strong>
    <span>Score moyen quiz</span><strong>${averageQuizScore(user)}%</strong>
    <span>Vainqueur de la semaine</span><strong>${determineWeeklyWinner(user, other)}</strong>
  `;
  weeklyRecap.innerHTML = '';
  weeklyRecap.appendChild(recap);
}

function sumLast7(reading) {
  return getLastDays(7).reduce((sum, day) => sum + (reading[day] || 0), 0);
}

function averageQuizScore(user) {
  if (user.quizzes.length === 0) return 0;
  const total = user.quizzes.reduce((sum, quiz) => sum + quiz.score, 0);
  return Math.round(total / user.quizzes.length);
}

function determineWeeklyWinner(user, other) {
  const scoreUser = sumLast7(user.reading) + user.flashcards.filter(card => getLastDays(7).includes(card.date)).length * 2 + user.tests.filter(test => getLastDays(7).includes(test.date)).length * 3;
  const scoreOther = sumLast7(other.reading) + other.flashcards.filter(card => getLastDays(7).includes(card.date)).length * 2 + other.tests.filter(test => getLastDays(7).includes(test.date)).length * 3;
  if (scoreUser === scoreOther) return 'Match nul';
  return scoreUser > scoreOther ? 'Toi' : 'Autre personne';
}

function getLastDays(count) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - index);
    return date.toISOString().slice(0, 10);
  });
}

function updateDailyCompletion() {
  const user = getUser(state.currentUser);
  const daily = getDaily(user);
  if (daily.reading >= 5 && daily.cards >= 3 && daily.tested >= 1) {
    daily.complete = true;
  }
  const other = getUser(getOtherUserId());
  const otherDaily = getDaily(other);
  if (daily.complete && otherDaily.complete && !state.pending) {
    streakStatus.textContent = 'Streak actif';
  }
}

function addReading(minutes) {
  const user = getUser(state.currentUser);
  const daily = getDaily(user);
  daily.reading += minutes;
  user.reading[TODAY] = daily.reading;
  tryCompleteDay(user);
  saveState();
  renderApp();
}

function tryCompleteDay(user) {
  const daily = getDaily(user);
  if (daily.reading >= 5 && daily.cards >= 3 && daily.tested >= 1) {
    daily.complete = true;
  }
}

function addFlashcard() {
  const question = cardQuestion.value.trim();
  const answer = cardAnswer.value.trim();
  const tags = cardTags.value.split(',').map(tag => tag.trim()).filter(Boolean);
  const explanation = cardExplanation.value.trim();
  const note = cardNote.value.trim();
  if (!question || !answer || tags.length === 0 || !explanation) {
    alert('Remplis la question, la réponse, au moins un tag et une explication.');
    return;
  }
  const user = getUser(state.currentUser);
  const newCard = {
    id: `${state.currentUser}-${Date.now()}`,
    user: state.currentUser,
    date: TODAY,
    question,
    answer,
    tags,
    explanation,
    note,
    reviews: []
  };
  user.flashcards.push(newCard);
  const daily = getDaily(user);
  daily.cards = user.flashcards.filter(card => card.date === TODAY).length;
  tryCompleteDay(user);
  saveState();
  resetFlashcardForm();
  renderApp();
}

function resetFlashcardForm() {
  cardQuestion.value = '';
  cardAnswer.value = '';
  cardTags.value = '';
  cardExplanation.value = '';
  cardNote.value = '';
}

function startReviewSession() {
  const count = parseInt(reviewCount.value, 10);
  const user = getUser(state.currentUser);
  const other = getUser(getOtherUserId());
  const dueCards = user.flashcards.filter(card => shouldReview(card));
  const newCards = user.flashcards.filter(card => card.date === TODAY);
  const otherNew = other.flashcards.filter(card => card.date === TODAY);
  reviewQueue = [...newCards, ...otherNew, ...dueCards].slice(0, count);
  if (reviewQueue.length === 0) {
    alert("Aucune carte disponible pour ce test. Crée des flashcards d'abord.");
    return;
  }
  reviewIndex = 0;
  reviewCorrect = 0;
  reviewCard.classList.remove('hidden');
  reviewSummary.classList.add('hidden');
  renderReviewCard();
}

function shouldReview(card) {
  const last = card.reviews?.slice(-1)[0];
  if (!last) return true;
  const days = { easy: 30, medium: 7, hard: 1 }[last.difficulty] || 1;
  const nextDue = new Date(last.date);
  nextDue.setDate(nextDue.getDate() + days);
  return new Date(TODAY) >= nextDue;
}

function renderReviewCard() {
  if (reviewIndex >= reviewQueue.length) {
    finishReviewSession();
    return;
  }
  const card = reviewQueue[reviewIndex];
  reviewProgress.textContent = `Carte ${reviewIndex + 1} / ${reviewQueue.length}`;
  reviewQuestion.textContent = card.question;
  reviewAnswer.textContent = card.answer;
  reviewAnswer.classList.add('hidden');
  correctBtn.classList.add('hidden');
  wrongBtn.classList.add('hidden');
  showAnswer.classList.remove('hidden');
}

function revealAnswer() {
  reviewAnswer.classList.remove('hidden');
  correctBtn.classList.remove('hidden');
  wrongBtn.classList.remove('hidden');
  showAnswer.classList.add('hidden');
}

function gradeReview(correct) {
  const card = reviewQueue[reviewIndex];
  const difficulty = correct ? 'medium' : 'hard';
  card.reviews.push({ date: TODAY, result: correct ? 'correct' : 'wrong', difficulty });
  if (correct) reviewCorrect += 1;
  reviewIndex += 1;
  renderReviewCard();
}

function finishReviewSession() {
  reviewCard.classList.add('hidden');
  reviewSummary.classList.remove('hidden');
  reviewResults.textContent = `Tu as répondu correctement à ${reviewCorrect} cartes sur ${reviewQueue.length}.`;
  const user = getUser(state.currentUser);
  user.tests.push({ date: TODAY, count: reviewQueue.length, correct: reviewCorrect, score: Math.round((reviewCorrect / reviewQueue.length) * 100) });
  const daily = getDaily(user);
  daily.tested = user.tests.filter(test => test.date === TODAY).length;
  tryCompleteDay(user);
  saveState();
  renderApp();
}

function startQuizSession() {
  const question = sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)];
  quizState = { question, selected: null, answered: false };
  quizCard.classList.remove('hidden');
  quizSummary.classList.add('hidden');
  quizMeta.textContent = `${question.chapter} • ${question.theme}`;
  quizQuestion.textContent = question.question;
  quizOptions.innerHTML = '';
  question.options.forEach(option => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = option;
    btn.addEventListener('click', () => selectQuizOption(btn, option));
    quizOptions.appendChild(btn);
  });
}

function selectQuizOption(button, option) {
  quizState.selected = option;
  Array.from(quizOptions.children).forEach(btn => btn.classList.remove('active'));
  button.classList.add('active');
}

function validateQuizAnswer() {
  if (!quizState || !quizState.selected) {
    alert('Sélectionne une réponse.');
    return;
  }
  const correct = quizState.selected === quizState.question.answer;
  quizState.answered = true;
  Array.from(quizOptions.children).forEach(btn => {
    btn.classList.toggle('correct', btn.textContent === quizState.question.answer);
    if (btn.textContent === quizState.selected && btn.textContent !== quizState.question.answer) btn.classList.add('wrong');
  });
  const user = getUser(state.currentUser);
  user.quizzes.push({ date: TODAY, questionId: quizState.question.id, correct, score: correct ? 100 : 0, chapter: quizState.question.chapter });
  saveState();
  quizResults.textContent = correct ? 'Bonne réponse !' : `Mauvaise réponse. La réponse était ${quizState.question.answer}.`;
  quizSummary.classList.remove('hidden');
}

function finishQuizSession() {
  quizCard.classList.add('hidden');
  quizSummary.classList.add('hidden');
  renderApp();
}

function resetAppData() {
  if (!confirm('Tu veux vraiment supprimer toutes les données ?')) return;
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}

function attachHandlers() {
  document.querySelectorAll('[data-user]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.currentUser = btn.dataset.user;
      initUserDaily();
      saveState();
      renderApp();
    });
  });
  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => goToPage(btn.dataset.nav));
  });
  add5min.addEventListener('click', () => addReading(5));
  setMinutes.addEventListener('click', () => {
    const amount = parseInt(manualMinutes.value, 10);
    if (!amount || amount < 1) return alert('Entre un nombre de minutes valide.');
    addReading(amount);
    manualMinutes.value = '';
  });
  saveCardBtn.addEventListener('click', addFlashcard);
  clearCardBtn.addEventListener('click', resetFlashcardForm);
  startReview.addEventListener('click', startReviewSession);
  showAnswer.addEventListener('click', revealAnswer);
  correctBtn.addEventListener('click', () => gradeReview(true));
  wrongBtn.addEventListener('click', () => gradeReview(false));
  finishReview.addEventListener('click', () => {
    reviewSummary.classList.add('hidden');
    renderApp();
  });
  startQuiz.addEventListener('click', startQuizSession);
  validateQuiz.addEventListener('click', validateQuizAnswer);
  finishQuiz.addEventListener('click', finishQuizSession);
  clearData.addEventListener('click', resetAppData);
  resetApp.addEventListener('click', resetAppData);
}

function init() {
  attachHandlers();
  checkDayTransition();
  if (state.currentUser) {
    initUserDaily();
    renderApp();
    goToPage('home');
  } else {
    renderApp();
  }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(console.error);
  }
}

init();

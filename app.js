const STORAGE_KEY = 'revisio-ibo-state';
const TODAY = new Date().toISOString().slice(0, 10);
const pages = ['home','reading','flashcards','library','test','quiz','quiz-setup','quiz-run','profile','stats','chapters','weaknesses','badges','recap','settings'];

const defaultState = {
  currentUser: null,
  streak: 0,
  pending: false,
  theme: 'dark',
  lastUpdate: TODAY,
  lastMonth: new Date().toISOString().slice(0, 7),
  jokers: 0,
  dailyThresholds: { reading: 5, cards: 3, tested: 1 },
  users: {
    G: { name: 'G', jokers: 0, chapters: {}, flashcards: [], quizzes: [], reading: {}, tests: [], daily: {}, monthlyTests: [], badges: [], statsOverride: {} },
    R: { name: 'R', jokers: 0, chapters: {}, flashcards: [], quizzes: [], reading: {}, tests: [], daily: {}, monthlyTests: [], badges: [], statsOverride: {} }
  },
  questionBank: []
};

const sampleQuestions = generateSampleQuestions();
const sampleFlashcards = generateSampleFlashcards();

const state = loadState();
const startScreen = document.getElementById('start-screen');
const appScreen = document.getElementById('app-screen');
const currentUserBadge = document.getElementById('current-user-badge');
const otherUserBadge = document.getElementById('other-user-badge');
const streakCount = document.getElementById('streak-count');
const streakStatus = document.getElementById('streak-status');
const streakHint = document.getElementById('streak-hint');
const todayReading = document.getElementById('today-reading');
const todayFlashcards = document.getElementById('today-flashcards');
const todayTested = document.getElementById('today-tested');
const otherProgress = document.getElementById('other-progress');
const homeNotice = document.getElementById('home-notice');
const otherUnseenCount = document.getElementById('other-unseen-count');

const timerDisplay = document.getElementById('timer-display');
const timerStatus = document.getElementById('timer-status');
const timerStart = document.getElementById('timer-start');
const timerPause = document.getElementById('timer-pause');
const timerStop = document.getElementById('timer-stop');
const manualMinutes = document.getElementById('manual-minutes');
const setMinutes = document.getElementById('set-minutes');
const readingHistory = document.getElementById('reading-history');

const saveCardBtn = document.getElementById('save-card');
const clearCardBtn = document.getElementById('clear-card');
const cardQuestion = document.getElementById('card-question');
const cardAnswer = document.getElementById('card-answer');
const cardTags = document.getElementById('card-tags');
const cardExplanation = document.getElementById('card-explanation');
const cardNote = document.getElementById('card-note');
const todayCardsList = document.getElementById('today-cards-list');

const librarySearch = document.getElementById('library-search');
const librarySort = document.getElementById('library-sort');
const libraryList = document.getElementById('library-list');

const reviewCount = document.getElementById('review-count');
const startReview = document.getElementById('start-review');
const reviewCard = document.getElementById('review-card');
const reviewProgress = document.getElementById('review-progress');
const reviewQuestion = document.getElementById('review-question');
const reviewAnswer = document.getElementById('review-answer');
const showAnswer = document.getElementById('show-answer');
const easyBtn = document.getElementById('easy-btn');
const mediumBtn = document.getElementById('medium-btn');
const hardBtn = document.getElementById('hard-btn');
const reviewSummary = document.getElementById('review-summary');
const reviewResults = document.getElementById('review-results');
const finishReview = document.getElementById('finish-review');

const importAnnalesInput = document.getElementById('import-annales');
const importButton = document.getElementById('import-button');
const questionBankCount = document.getElementById('question-bank-count');
const quizChapter = document.getElementById('quiz-chapter');
const quizCount = document.getElementById('quiz-count');
const startQuizSessionButton = document.getElementById('start-quiz-session');
const quizCard = document.getElementById('quiz-card');
const quizProgressBar = document.getElementById('quiz-progress-bar');
const quizProgressFill = document.getElementById('quiz-progress-fill');
const quizProgressLabel = document.getElementById('quiz-progress-label');
const startQuiz = document.getElementById('start-quiz');
const quizMeta = document.getElementById('quiz-meta');
const adminPanel = document.getElementById('admin-panel');
const quizQuestion = document.getElementById('quiz-question');
const quizOptions = document.getElementById('quiz-options');
const validateQuiz = document.getElementById('validate-quiz');
const quizSummary = document.getElementById('quiz-summary');
const quizSummaryTitle = document.getElementById('quiz-summary-title');
const quizResults = document.getElementById('quiz-results');
const finishQuiz = document.getElementById('finish-quiz');

const startMonthly = document.getElementById('start-monthly');
const monthlyCard = document.getElementById('monthly-card');
const monthlyMeta = document.getElementById('monthly-meta');
const monthlyQuestion = document.getElementById('monthly-question');
const monthlyOptions = document.getElementById('monthly-options');
const validateMonthly = document.getElementById('validate-monthly');
const monthlySummary = document.getElementById('monthly-summary');
const monthlyResults = document.getElementById('monthly-results');
const finishMonthly = document.getElementById('finish-monthly');

const myJokers = document.getElementById('my-jokers');
const myTotalCards = document.getElementById('my-total-cards');
const myWeekCards = document.getElementById('my-week-cards');
const myTotalTests = document.getElementById('my-total-tests');
const myTotalQuizzes = document.getElementById('my-total-quizzes');
const mySuccessRate = document.getElementById('my-success-rate');
const myTotalReading = document.getElementById('my-total-reading');
const otherJokers = document.getElementById('other-jokers');
const otherTotalCards = document.getElementById('other-total-cards');
const otherWeekCards = document.getElementById('other-week-cards');
const otherTotalTests = document.getElementById('other-total-tests');
const otherTotalQuizzes = document.getElementById('other-total-quizzes');
const otherSuccessRate = document.getElementById('other-success-rate');
const otherTotalReading = document.getElementById('other-total-reading');

const statsCharts = document.getElementById('stats-charts');
const chapterProgress = document.getElementById('chapter-progress');
const weaknessList = document.getElementById('weakness-list');
const badgeList = document.getElementById('badge-list');
const weeklyRecap = document.getElementById('weekly-recap');
const clearData = document.getElementById('clear-data');
const themeToggle = document.getElementById('theme-toggle');
const settingsButton = document.getElementById('settings-button');
const showIbAnnales = document.getElementById('show-ib-annales');
const monthlyQuickButton = document.getElementById('start-monthly-quick');
const viewMyStats = document.getElementById('view-my-stats');
const viewMyBadges = document.getElementById('view-my-badges');
const viewOtherStats = document.getElementById('view-other-stats');
const viewOtherBadges = document.getElementById('view-other-badges');
const adminStreak = document.getElementById('admin-streak');
const adminJokersG = document.getElementById('admin-jokers-g');
const adminJokersR = document.getElementById('admin-jokers-r');
const adminTargetReading = document.getElementById('admin-target-reading');
const adminTargetCards = document.getElementById('admin-target-cards');
const adminTargetTested = document.getElementById('admin-target-tested');
const adminGcards = document.getElementById('admin-g-cards');
const adminGtests = document.getElementById('admin-g-tests');
const adminGquizzes = document.getElementById('admin-g-quizzes');
const adminGreading = document.getElementById('admin-g-reading');
const adminGrate = document.getElementById('admin-g-rate');
const adminRcards = document.getElementById('admin-r-cards');
const adminRtests = document.getElementById('admin-r-tests');
const adminRquizzes = document.getElementById('admin-r-quizzes');
const adminRreading = document.getElementById('admin-r-reading');
const adminRate = document.getElementById('admin-r-rate');
const saveAdminSettings = document.getElementById('save-admin-settings');
const resetAdminOverrides = document.getElementById('reset-admin-overrides');

let timerInterval = null;
let timerSeconds = 0;
let isTimerRunning = false;
let reviewQueue = [];
let reviewIndex = 0;
let reviewCorrect = 0;
let quizState = null;
let monthlyState = null;

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return JSON.parse(JSON.stringify(defaultState));
  try {
    const parsed = JSON.parse(raw);
    return deepMerge(JSON.parse(JSON.stringify(defaultState)), parsed);
  } catch (e) {
    return JSON.parse(JSON.stringify(defaultState));
  }
}

function deepMerge(base, override) {
  for (const key in override) {
    if (Array.isArray(override[key])) {
      base[key] = override[key];
    } else if (override[key] && typeof override[key] === 'object') {
      base[key] = deepMerge(base[key] || {}, override[key]);
    } else {
      base[key] = override[key];
    }
  }
  return base;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function generateSampleFlashcards() {
  const themes = [
    { chapter: 'Campbell chapitre 1', tag: 'Cellule', question: 'Que contient toute cellule vivante ?', answer: 'ADN', note: 'L’ADN est la base de toute cellule.' },
    { chapter: 'Campbell chapitre 2', tag: 'Membrane', question: 'Quel rôle joue la membrane plasmique ?', answer: 'Contrôle des échanges', note: 'Elle régule ce qui entre et sort.' },
    { chapter: 'Campbell chapitre 6', tag: 'Photosynthèse', question: 'Quel est le produit principal de la photosynthèse ?', answer: 'Glucose', note: 'Le glucose est stocké et utilisé comme énergie.' },
    { chapter: 'Campbell chapitre 9', tag: 'Génétique', question: 'Quelle molécule est transcrite en ARN ?', answer: 'ADN', note: 'L’ARN copie l’information de l’ADN.' },
    { chapter: 'IBO 2023', tag: 'Écologie', question: 'Qu’est-ce qu’une niche écologique ?', answer: 'La fonction d’une espèce', note: 'C’est le rôle exact de l’espèce dans l’écosystème.' }
  ];
  const cards = [];
  for (let i = 0; i < 100; i += 1) {
    const source = themes[i % themes.length];
    const owner = i % 2 === 0 ? 'G' : 'R';
    const daysAgo = i % 15;
    const date = getPastDate(daysAgo);
    cards.push({
      id: `sample-${i}`,
      user: owner,
      date,
      question: `${source.question} (${source.chapter})`,
      answer: source.answer,
      tags: [source.tag, source.chapter, 'IBO'],
      explanation: `Explique cette notion à l’autre : ${source.note}`,
      note: `Aide : ${source.note}`,
      reviews: [],
      seenBy: []
    });
  }
  return cards;
}

function generateSampleQuestions() {
  const templates = [
    {
      chapter: 'Cellule',
      theme: 'Noyau',
      question: 'Quel organite contient le matériel génétique et contrôle les activités cellulaires ?',
      options: ['Noyau', 'Mitochondrie', 'Ribosome', 'Golgi'],
      answer: 'Noyau'
    },
    {
      chapter: 'Cellule',
      theme: 'Membrane',
      question: 'Quelle structure contrôle le transport de substances dans et hors de la cellule ?',
      options: ['Membrane plasmique', 'Paroi cellulaire', 'Noyau', 'Chloroplaste'],
      answer: 'Membrane plasmique'
    },
    {
      chapter: 'Cellule',
      theme: 'Énergie',
      question: 'Quelle organite produit de l’ATP pendant la respiration cellulaire ?',
      options: ['Mitochondrie', 'Chloroplaste', 'Ribosome', 'Lysosome'],
      answer: 'Mitochondrie'
    },
    {
      chapter: 'Photosynthèse',
      theme: 'Chloroplastes',
      question: 'Dans quel organite a lieu la photosynthèse chez les plantes ?',
      options: ['Chloroplaste', 'Mitochondrie', 'Noyau', 'Ribosome'],
      answer: 'Chloroplaste'
    },
    {
      chapter: 'Photosynthèse',
      theme: 'Produits',
      question: 'Quel gaz est libéré par une plante pendant la photosynthèse ?',
      options: ['Oxygène', 'Dioxyde de carbone', 'Azote', 'Hydrogène'],
      answer: 'Oxygène'
    },
    {
      chapter: 'Respiration',
      theme: 'Gaz respiratoires',
      question: 'Quel gaz est consommé par les cellules lors de la respiration aérobie ?',
      options: ['Dioxyde de carbone', 'Oxygène', 'Azote', 'Méthane'],
      answer: 'Oxygène'
    },
    {
      chapter: 'Génétique',
      theme: 'ADN',
      question: 'Quel type d’acide contient le code génétique ?',
      options: ['ADN', 'ARN', 'Protéine', 'Lipide'],
      answer: 'ADN'
    },
    {
      chapter: 'Génétique',
      theme: 'Réplicaton',
      question: 'Quelle enzyme est nécessaire pour copier l’ADN avant la division cellulaire ?',
      options: ['ADN polymérase', 'Ribosome', 'Ligase', 'Amylase'],
      answer: 'ADN polymérase'
    },
    {
      chapter: 'Génétique',
      theme: 'Expression génique',
      question: 'Quel ARN transporte le code du noyau vers le ribosome ?',
      options: ['ARN messager', 'ARN transfert', 'ADN', 'ARN ribosomique'],
      answer: 'ARN messager'
    },
    {
      chapter: 'Génétique',
      theme: 'Chromosomes',
      question: 'Combien de chromosomes se trouvent normalement dans une cellule humaine diploïde ?',
      options: ['46', '23', '92', '12'],
      answer: '46'
    },
    {
      chapter: 'Évolution',
      theme: 'Sélection',
      question: 'Comment s’appelle le processus par lequel les organismes mieux adaptés survivent et se reproduisent ?',
      options: ['Sélection naturelle', 'Mutation', 'Dérive génétique', 'Migration'],
      answer: 'Sélection naturelle'
    },
    {
      chapter: 'Évolution',
      theme: 'Variation',
      question: 'Quel mécanisme produit une nouvelle combinaison de gènes lors de la formation des gamètes ?',
      options: ['Recombinaison génétique', 'Mitose', 'Traduction', 'Transcription'],
      answer: 'Recombinaison génétique'
    },
    {
      chapter: 'Écologie',
      theme: 'Réseaux trophiques',
      question: 'Quel terme désigne les organismes qui fabriquent leur propre nourriture par photosynthèse ?',
      options: ['Producteurs', 'Consommateurs', 'Décomposeurs', 'Prédateurs'],
      answer: 'Producteurs'
    },
    {
      chapter: 'Écologie',
      theme: 'Cycles',
      question: 'Quel cycle naturel implique l’échange de carbone entre l’atmosphère, les organismes et les océans ?',
      options: ['Cycle du carbone', 'Cycle de l’eau', 'Cycle de l’azote', 'Cycle du phosphore'],
      answer: 'Cycle du carbone'
    },
    {
      chapter: 'Écologie',
      theme: 'Habitat',
      question: 'Comment appelle-t-on le lieu où vit une espèce et trouve ses ressources ?',
      options: ['Habitat', 'Niche', 'Population', 'Communauté'],
      answer: 'Habitat'
    },
    {
      chapter: 'Physiologie',
      theme: 'Enzymes',
      question: 'Quel mot décrit une protéine qui accélère une réaction chimique dans une cellule ?',
      options: ['Enzyme', 'Hormone', 'Anticorps', 'Acide aminé'],
      answer: 'Enzyme'
    },
    {
      chapter: 'Physiologie',
      theme: 'Digestion',
      question: 'Quel organe stocke la bile nécessaire à la digestion des lipides ?',
      options: ['Vésicule biliaire', 'Estomac', 'Pancréas', 'Foie'],
      answer: 'Vésicule biliaire'
    },
    {
      chapter: 'Biologie humaine',
      theme: 'Sang',
      question: 'Quel composant du sang transporte l’oxygène ?',
      options: ['Globules rouges', 'Plaquettes', 'Plasma', 'Globules blancs'],
      answer: 'Globules rouges'
    },
    {
      chapter: 'Biologie humaine',
      theme: 'Neurones',
      question: 'Quel type de cellule transmet des impulsions nerveuses ?',
      options: ['Neurone', 'Érythrocyte', 'Fibroblaste', 'Chondrocyte'],
      answer: 'Neurone'
    },
    {
      chapter: 'Biologie des plantes',
      theme: 'Stomates',
      question: 'Quel élément des plantes régule les échanges de gaz avec l’air ?',
      options: ['Stomate', 'Xylème', 'Phloème', 'Périderme'],
      answer: 'Stomate'
    }
  ];
  const questions = [];
  for (let i = 0; i < 100; i += 1) {
    const template = templates[i % templates.length];
    questions.push({
      id: `q-${i}`,
      chapter: template.chapter,
      theme: template.theme,
      question: `Question ${i + 1} : ${template.question}`,
      options: template.options,
      answer: template.answer,
      source: 'IBO'
    });
  }
  return questions;
}

function getPastDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
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

function ensureSampleData() {
  if (state.users.G.flashcards.length + state.users.R.flashcards.length === 0) {
    sampleFlashcards.forEach((card) => {
      getUser(card.user).flashcards.push(card);
    });
  }
  if (!state.questionBank || state.questionBank.length === 0) {
    state.questionBank = sampleQuestions.slice();
  }
}

function checkDayTransition() {
  const now = new Date();
  if (state.lastUpdate === TODAY) return;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);
  const gDone = getDaily(getUser('G'), yesterdayKey).complete;
  const rDone = getDaily(getUser('R'), yesterdayKey).complete;
  if (now.getHours() >= 4) {
    if (gDone && rDone) {
      state.streak += 1;
      state.pending = false;
      streakHint.textContent = 'Streak validé: les deux ont fini.';
    } else if (gDone || rDone) {
      state.pending = true;
      streakHint.textContent = 'Streak en attente : une seule personne a fini.';
    } else {
      if (state.jokers > 0) {
        state.jokers -= 1;
        streakHint.textContent = 'Streak sauvé par un joker.';
      } else {
        state.streak = 0;
        streakHint.textContent = 'Streak perdu, aucune journée valida.';
      }
      state.pending = false;
    }
    state.lastUpdate = TODAY;
    saveState();
  }
}

function checkMonthTransition() {
  const currentMonth = TODAY.slice(0, 7);
  if (state.lastMonth !== currentMonth) {
    processMonthlyEnd(state.lastMonth);
    state.lastMonth = currentMonth;
    saveState();
  }
}

function processMonthlyEnd(monthKey) {
  if (!monthKey) return;
  const g = getUser('G');
  const r = getUser('R');
  const gCompleted = g.monthlyTests.some(test => test.date.startsWith(monthKey));
  const rCompleted = r.monthlyTests.some(test => test.date.startsWith(monthKey));
  if (gCompleted && rCompleted) {
    g.jokers += 1;
    r.jokers += 1;
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

function goToPage(page, preserveTarget = false) {
  if (page === 'home') showSection('home');
  else if (page === 'profile') showSection('profile');
  else if (page === 'stats') {
    if (!preserveTarget) statsTarget = null;
    showSection('stats');
  } else if (page === 'chapter' || page === 'chapters') showSection('chapters');
  else if (page === 'badges') {
    if (!preserveTarget) badgesTarget = null;
    showSection('badges');
  } else if (page === 'weaknesses') showSection('weaknesses');
  else if (page === 'recap') showSection('recap');
  else if (page === 'settings') showSection('settings');
  else showSection(page);
  applyPageTheme(page);
  if (page === 'settings') renderSettings();
  if (page === 'library') {
    markOtherCardsSeen();
  }
}

function applyPageTheme(page) {
  const themeClasses = ['theme-default', 'theme-read', 'theme-flashcards', 'theme-review', 'theme-quiz', 'theme-library'];
  document.body.classList.remove(...themeClasses);
  const pageTheme = {
    reading: 'theme-read',
    flashcards: 'theme-flashcards',
    test: 'theme-review',
    quiz: 'theme-quiz',
    'quiz-setup': 'theme-quiz',
    'quiz-run': 'theme-quiz',
    library: 'theme-library'
  };
  document.body.classList.add(pageTheme[page] || 'theme-default');
}

function markOtherCardsSeen() {
  const other = getUser(getOtherUserId());
  other.flashcards.forEach(card => {
    if (!card.seenBy) card.seenBy = [];
    if (!card.seenBy.includes(state.currentUser)) card.seenBy.push(state.currentUser);
  });
  saveState();
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
  otherUserBadge.textContent = `Autre ${getOtherUserId()}`;
  streakCount.textContent = state.streak;
  streakStatus.textContent = state.pending ? 'En attente' : 'Actif';
  updateHome();
  renderReading();
  renderFlashcards();
  renderLibrary();
  renderProfile();
  renderStats();
  renderChapters();
  renderWeaknesses();
  renderBadges();
  renderRecap();
  renderQuizStatus();
}

function updateHome() {
  const user = getUser(state.currentUser);
  const other = getUser(getOtherUserId());
  const today = getDaily(user);
  const otherToday = getDaily(other);
  todayReading.textContent = `${today.reading} min`;
  todayFlashcards.textContent = today.cards;
  todayTested.textContent = today.tested;
  otherProgress.textContent = otherToday.complete ? 'L’autre a terminé' : 'En cours';
  homeNotice.textContent = today.complete ? 'Tu as terminé ta journée !' : 'Il te reste des étapes.';
  const unseenCount = other.flashcards.filter(card => !card.seenBy || !card.seenBy.includes(state.currentUser)).length;
  otherUnseenCount.textContent = unseenCount;
}

function renderReading() {
  const user = getUser(state.currentUser);
  const days = Object.keys(user.reading).sort((a, b) => b.localeCompare(a)).slice(0, 7);
  readingHistory.innerHTML = '';
  days.forEach(day => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `<span>${day}</span><strong>${user.reading[day]} min</strong>`;
    readingHistory.appendChild(item);
  });
  if (days.length === 0) {
    readingHistory.innerHTML = '<div class="history-item"><span>Aucun historique encore</span></div>';
  }
  updateTimerDisplay();
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

function renderLibrary() {
  const user = getUser(state.currentUser);
  const other = getUser(getOtherUserId());
  const filter = librarySearch.value.trim().toLowerCase();
  const sort = librarySort.value;
  const cards = [...user.flashcards, ...other.flashcards].sort((a,b) => {
    if (sort === 'tag') return a.tags[0].localeCompare(b.tags[0]);
    if (sort === 'user') return a.user.localeCompare(b.user);
    return b.date.localeCompare(a.date);
  }).filter(card => {
    if (!filter) return true;
    return [card.question, card.answer, ...card.tags].some(text => text.toLowerCase().includes(filter));
  });
  libraryList.innerHTML = '';
  if (cards.length === 0) {
    libraryList.innerHTML = '<div class="library-card"><span>Aucune carte correspondante.</span></div>';
    return;
  }
  cards.forEach(card => {
    const item = document.createElement('div');
    item.className = 'library-card';
    item.innerHTML = `<span>${card.user === state.currentUser ? 'Moi' : 'Autre'} • ${card.date}</span>
      <strong>${card.question}</strong>
      <p>${card.answer}</p>
      <small>${card.tags.join(', ')}</small>
      <p>${card.explanation}</p>`;
    libraryList.appendChild(item);
  });
}

function renderProfile() {
  const user = getUser(state.currentUser);
  const other = getUser(getOtherUserId());
  const userDisplay = getProfileDisplayStats(user);
  const otherDisplay = getProfileDisplayStats(other);
  myJokers.textContent = user.jokers;
  myTotalCards.textContent = userDisplay.totalCards;
  myWeekCards.textContent = userDisplay.weekCards;
  myTotalTests.textContent = userDisplay.totalTests;
  myTotalQuizzes.textContent = userDisplay.totalQuizzes;
  mySuccessRate.textContent = `${userDisplay.successRate}%`;
  myTotalReading.textContent = `${userDisplay.totalReading} min`;
  otherJokers.textContent = other.jokers;
  otherTotalCards.textContent = otherDisplay.totalCards;
  otherWeekCards.textContent = otherDisplay.weekCards;
  otherTotalTests.textContent = otherDisplay.totalTests;
  otherTotalQuizzes.textContent = otherDisplay.totalQuizzes;
  otherSuccessRate.textContent = `${otherDisplay.successRate}%`;
  otherTotalReading.textContent = `${otherDisplay.totalReading} min`;
  renderSettings();
}

function renderSettings() {
  adminPanel.classList.toggle('hidden', state.currentUser !== 'R');
  if (state.currentUser === 'R') {
    populateAdminInputs();
  }
}

function getProfileDisplayStats(user) {
  const override = user.statsOverride || {};
  const baseStats = computeStats(user);
  const totalReading = override.totalReading != null ? override.totalReading : Object.values(user.reading).reduce((sum, v) => sum + v, 0);
  return {
    totalCards: override.totalCards != null ? override.totalCards : user.flashcards.length,
    weekCards: override.weekCards != null ? override.weekCards : baseStats.weekCards,
    totalTests: override.totalTests != null ? override.totalTests : user.tests.length,
    totalQuizzes: override.totalQuizzes != null ? override.totalQuizzes : user.quizzes.length,
    successRate: override.successRate != null ? override.successRate : baseStats.successRate,
    totalReading
  };
}

function populateAdminInputs() {
  const g = getUser('G');
  const r = getUser('R');
  adminStreak.value = state.streak;
  adminJokersG.value = g.jokers;
  adminJokersR.value = r.jokers;
  adminTargetReading.value = state.dailyThresholds.reading;
  adminTargetCards.value = state.dailyThresholds.cards;
  adminTargetTested.value = state.dailyThresholds.tested;
  adminGcards.value = g.statsOverride.totalCards ?? '';
  adminGtests.value = g.statsOverride.totalTests ?? '';
  adminGquizzes.value = g.statsOverride.totalQuizzes ?? '';
  adminGreading.value = g.statsOverride.totalReading ?? '';
  adminGrate.value = g.statsOverride.successRate ?? '';
  adminRcards.value = r.statsOverride.totalCards ?? '';
  adminRtests.value = r.statsOverride.totalTests ?? '';
  adminRquizzes.value = r.statsOverride.totalQuizzes ?? '';
  adminRreading.value = r.statsOverride.totalReading ?? '';
  adminRate.value = r.statsOverride.successRate ?? '';
}

function saveAdminChanges() {
  state.streak = Number(adminStreak.value) || 0;
  getUser('G').jokers = Number(adminJokersG.value) || 0;
  getUser('R').jokers = Number(adminJokersR.value) || 0;
  state.dailyThresholds.reading = Number(adminTargetReading.value) || 0;
  state.dailyThresholds.cards = Number(adminTargetCards.value) || 0;
  state.dailyThresholds.tested = Number(adminTargetTested.value) || 0;
  setUserOverrides('G', adminGcards, adminGtests, adminGquizzes, adminGreading, adminGrate);
  setUserOverrides('R', adminRcards, adminRtests, adminRquizzes, adminRreading, adminRate);
  saveState();
  renderApp();
}

function setUserOverrides(userId, cardsInput, testsInput, quizzesInput, readingInput, rateInput) {
  const user = getUser(userId);
  user.statsOverride = {
    totalCards: cardsInput.value ? Number(cardsInput.value) : null,
    totalTests: testsInput.value ? Number(testsInput.value) : null,
    totalQuizzes: quizzesInput.value ? Number(quizzesInput.value) : null,
    totalReading: readingInput.value ? Number(readingInput.value) : null,
    successRate: rateInput.value ? Number(rateInput.value) : null
  };
}

function resetAdminOverridesToDefault() {
  getUser('G').statsOverride = {};
  getUser('R').statsOverride = {};
  populateAdminInputs();
  saveState();
  renderApp();
}

function showProfileStats(userKey) {
  statsTarget = userKey;
  renderStats();
  goToPage('stats', true);
}

function showProfileBadges(userKey) {
  badgesTarget = userKey;
  renderBadges();
  goToPage('badges', true);
}

function computeStats(user) {
  const weekDays = getLastDays(7);
  const weekCards = user.flashcards.filter(card => weekDays.includes(card.date)).length;
  const totalTests = user.tests.length + user.quizzes.length;
  const successful = user.tests.filter(t => t.score >= 50).length + user.quizzes.filter(q => q.correct).length;
  const successRate = totalTests === 0 ? 0 : Math.round((successful / totalTests) * 100);
  return { weekCards, successRate };
}

let statsTarget = null;
let badgesTarget = null;

function renderStats() {
  const targetUser = statsTarget ? getUser(statsTarget) : getUser(state.currentUser);
  document.querySelector('#page-stats h2').textContent = `Statistiques de ${targetUser.name}`;
  statsCharts.innerHTML = '';
  const days = getLastDays(7).reverse();
  const me = targetUser;
  days.forEach(day => {
    const readingCount = me.reading[day] || 0;
    const cardCount = me.flashcards.filter(card => card.date === day).length;
    const tests = me.tests.filter(test => test.date === day).length + me.quizzes.filter(quiz => quiz.date === day).length;
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = `<strong>${day}</strong><div style="display:grid;gap:8px;flex:1">
      ${createBar('Lecture', readingCount, 60)}
      ${createBar('Flashcards', cardCount, 8)}
      ${createBar('Tests', tests, 4)}
    </div>`;
    statsCharts.appendChild(row);
  });
}

function createBar(label, value, max) {
  const width = Math.min(100, Math.round((value / max) * 100));
  return `<div class="bar-row"><span>${label} ${value}</span><div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div></div>`;
}

function renderChapters() {
  const chapters = ['Photosynthèse', 'Génétique', 'Cellule', 'Écologie', 'Évolution'];
  chapterProgress.innerHTML = '';
  chapters.forEach(name => {
    const progress = Math.floor(Math.random() * 65) + 20;
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
      item.innerHTML = `<span>Chapitre à revoir</span><strong>${tag}</strong>`;
      weaknessList.appendChild(item);
    });
  }
}

function gatherWeakTags(user) {
  const wrongCards = user.flashcards.filter(card => card.reviews && card.reviews.some(r => r.result === 'wrong' || r.difficulty === 'hard'));
  const tags = wrongCards.flatMap(card => card.tags);
  return [...new Set(tags)].slice(0, 5);
}

function renderBadges() {
  const targetUser = badgesTarget ? getUser(badgesTarget) : getUser(state.currentUser);
  document.querySelector('#page-badges h2').textContent = `Badges de ${targetUser.name}`;
  badgeList.innerHTML = '';
  const user = targetUser;
  const badges = [
    { label: '7 jours de streak', earned: state.streak >= 7 },
    { label: '30 flashcards créées', earned: user.flashcards.length >= 30 },
    { label: '100 flashcards créées', earned: user.flashcards.length >= 100 },
    { label: '10 quiz réalisés', earned: user.quizzes.length >= 10 },
    { label: '5 tests mensuels', earned: user.monthlyTests.length >= 5 },
    { label: '1 joker obtenu', earned: user.jokers >= 1 },
    { label: '1 mois de révision', earned: state.lastMonth !== new Date().toISOString().slice(0,7) }
  ];
  badges.forEach(badge => {
    const item = document.createElement('div');
    item.className = 'badge-item';
    item.innerHTML = `<span>${badge.label}</span><strong>${badge.earned ? '🏅' : '🔒'}</strong>`;
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
    <span>Tests réalisés cette semaine</span><strong>${user.tests.filter(test => getLastDays(7).includes(test.date)).length + user.quizzes.filter(quiz => getLastDays(7).includes(quiz.date)).length}</strong>
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
  const scoreUser = sumLast7(user.reading) + user.flashcards.filter(card => getLastDays(7).includes(card.date)).length * 3 + (user.tests.filter(test => getLastDays(7).includes(test.date)).length + user.quizzes.filter(quiz => getLastDays(7).includes(quiz.date)).length) * 4;
  const scoreOther = sumLast7(other.reading) + other.flashcards.filter(card => getLastDays(7).includes(card.date)).length * 3 + (other.tests.filter(test => getLastDays(7).includes(test.date)).length + other.quizzes.filter(quiz => getLastDays(7).includes(quiz.date)).length) * 4;
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

function updateTimerDisplay() {
  const minutes = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
  const seconds = String(timerSeconds % 60).padStart(2, '0');
  timerDisplay.textContent = `${minutes}:${seconds}`;
}

function startTimer() {
  if (isTimerRunning) return;
  isTimerRunning = true;
  timerStart.classList.add('hidden');
  timerPause.classList.remove('hidden');
  timerStatus.textContent = 'Lecture en cours...';
  timerInterval = setInterval(() => {
    timerSeconds += 1;
    updateTimerDisplay();
  }, 1000);
}

function pauseTimer() {
  isTimerRunning = false;
  timerStart.classList.remove('hidden');
  timerPause.classList.add('hidden');
  timerStatus.textContent = 'Lecture en pause. Termine pour enregistrer.';
  clearInterval(timerInterval);
}

function stopTimer() {
  if (timerInterval) clearInterval(timerInterval);
  const minutes = Math.ceil(timerSeconds / 60);
  if (minutes > 0) {
    addReading(minutes);
    timerStatus.textContent = `Ajouté ${minutes} min de lecture.`;
  } else {
    timerStatus.textContent = 'Aucun temps à ajouter.';
  }
  timerSeconds = 0;
  isTimerRunning = false;
  timerStart.classList.remove('hidden');
  timerPause.classList.add('hidden');
  updateTimerDisplay();
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

function addManualReading() {
  const amount = parseInt(manualMinutes.value, 10);
  if (!amount || amount < 1) return alert('Entre un nombre de minutes valide.');
  addReading(amount);
  manualMinutes.value = '';
  timerStatus.textContent = `Ajouté ${amount} min manuellement.`;
}

function tryCompleteDay(user) {
  const daily = getDaily(user);
  const thresholds = state.dailyThresholds || { reading: 5, cards: 3, tested: 1 };
  if (daily.reading >= thresholds.reading && daily.cards >= thresholds.cards && daily.tested >= thresholds.tested) {
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
    reviews: [],
    seenBy: [state.currentUser]
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
    alert('Aucune carte disponible pour ce test. Crée des flashcards d’abord.');
    return;
  }
  reviewIndex = 0;
  reviewCorrect = 0;
  reviewCard.classList.remove('hidden');
  reviewSummary.classList.add('hidden');
  showAnswer.classList.remove('hidden');
  easyBtn.classList.add('hidden');
  mediumBtn.classList.add('hidden');
  hardBtn.classList.add('hidden');
  renderReviewCard();
}

function shouldReview(card) {
  const last = card.reviews?.slice(-1)[0];
  if (!last) return true;
  const intervals = { easy: 30, medium: 7, hard: 1 };
  const days = intervals[last.difficulty] || 1;
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
  showAnswer.classList.remove('hidden');
  easyBtn.classList.add('hidden');
  mediumBtn.classList.add('hidden');
  hardBtn.classList.add('hidden');
}

function revealAnswer() {
  reviewAnswer.classList.remove('hidden');
  showAnswer.classList.add('hidden');
  easyBtn.classList.remove('hidden');
  mediumBtn.classList.remove('hidden');
  hardBtn.classList.remove('hidden');
}

function gradeReview(difficulty) {
  const card = reviewQueue[reviewIndex];
  if (!card.reviews) card.reviews = [];
  card.reviews.push({ date: TODAY, difficulty, result: difficulty === 'easy' ? 'correct' : 'wrong' });
  if (difficulty === 'easy' || difficulty === 'medium') {
    reviewCorrect += 1;
  }
  reviewIndex += 1;
  renderReviewCard();
}

function finishReviewSession() {
  reviewCard.classList.add('hidden');
  reviewSummary.classList.remove('hidden');
  reviewResults.textContent = `Tu as répondu correctement à ${reviewCorrect} sur ${reviewQueue.length} cartes.`;
  const user = getUser(state.currentUser);
  user.tests.push({ date: TODAY, count: reviewQueue.length, correct: reviewCorrect, score: Math.round((reviewCorrect / reviewQueue.length) * 100) });
  const daily = getDaily(user);
  daily.tested = user.tests.filter(test => test.date === TODAY).length;
  tryCompleteDay(user);
  saveState();
  renderApp();
}

function startQuizSession() {
  const chapter = quizChapter.value;
  const count = parseInt(quizCount.value, 10) || 10;
  if (!state.questionBank || state.questionBank.length === 0) {
    return alert('Aucune question disponible. Importez des annales ou réessayez plus tard.');
  }
  let questions = state.questionBank.slice();
  if (chapter && chapter !== 'all') {
    questions = questions.filter(q => q.chapter === chapter);
  }
  questions = shuffleArray(questions).slice(0, Math.min(count, questions.length));
  if (questions.length === 0) {
    return alert('Aucune question trouvée pour ce chapitre. Choisis un autre chapitre ou importe plus d’annales.');
  }
  quizState = { questions, index: 0, selected: null, correct: 0 };
  goToPage('quiz-run');
  quizCard.classList.remove('hidden');
  quizSummary.classList.add('hidden');
  quizProgressBar.classList.remove('hidden');
  renderQuizRunCard();
}

function renderQuizCard() {
  if (!quizState) return;
  const question = quizState.questions[quizState.index];
  quizMeta.textContent = `Question ${quizState.index + 1} / ${quizState.questions.length}`;
  quizQuestion.textContent = question.question;
  quizOptions.innerHTML = '';
  question.options.forEach(option => {
    const btn = document.createElement('button');
    btn.className = 'option-button';
    btn.type = 'button';
    btn.textContent = option;
    btn.addEventListener('click', () => selectQuizOption(btn, option));
    quizOptions.appendChild(btn);
  });
  quizState.selected = null;
  Array.from(quizOptions.children).forEach(btn => btn.classList.remove('correct', 'wrong', 'active'));
  validateQuiz.disabled = false;
  quizSummary.classList.add('hidden');
  quizProgressFill.style.width = `${((quizState.index) / quizState.questions.length) * 100}%`;
  quizProgressLabel.textContent = `${quizState.index + 1} / ${quizState.questions.length}`;
}

function showIBAnnales() {
  importAnnalesInput.click();
}

function pickRandomQuestion() {
  if (!state.questionBank || state.questionBank.length === 0) return null;
  return state.questionBank[Math.floor(Math.random() * state.questionBank.length)];
}

function selectQuizOption(button, option) {
  quizState.selected = option;
  Array.from(quizOptions.children).forEach(btn => btn.classList.toggle('active', btn === button));
}

function renderQuizRunCard() {
  if (!quizState) return;
  const question = quizState.questions[quizState.index];
  quizMeta.textContent = `Question ${quizState.index + 1} / ${quizState.questions.length}`;
  quizQuestion.textContent = question.question;
  quizOptions.innerHTML = '';
  question.options.forEach(option => {
    const btn = document.createElement('button');
    btn.className = 'option-button';
    btn.type = 'button';
    btn.textContent = option;
    btn.addEventListener('click', () => selectQuizOption(btn, option));
    quizOptions.appendChild(btn);
  });
  quizState.selected = null;
  validateQuiz.disabled = false;
  quizSummary.classList.add('hidden');
  quizProgressFill.style.width = `${(quizState.index / quizState.questions.length) * 100}%`;
  quizProgressLabel.textContent = `${quizState.index + 1} / ${quizState.questions.length}`;
}

function validateQuizAnswer() {
  if (!quizState || !quizState.selected) {
    alert('Choisis une réponse.');
    return;
  }
  const question = quizState.questions[quizState.index];
  const correct = quizState.selected === question.answer;
  const user = getUser(state.currentUser);
  user.quizzes.push({ date: TODAY, questionId: question.id, correct, score: correct ? 100 : 0, chapter: question.chapter });
  if (correct) quizState.correct += 1;
  saveState();
  quizState.index += 1;
  if (quizState.index < quizState.questions.length) {
    renderQuizRunCard();
    return;
  }
  showQuizSummary();
}

function showQuizSummary() {
  quizCard.classList.add('hidden');
  quizProgressBar.classList.add('hidden');
  quizSummary.classList.remove('hidden');
  const correct = quizState.correct;
  const total = quizState.questions.length;
  const wrong = total - correct;
  const percent = total ? Math.round((correct / total) * 100) : 0;
  quizResults.textContent = `Réussi : ${correct}, ratés : ${wrong}, ${percent}% de bonnes réponses.`;
}

function finishQuizSession() {
  quizSummary.classList.add('hidden');
  quizCard.classList.add('hidden');
  quizState = null;
  goToPage('quiz');
}

function importAnnales() {
  const file = importAnnalesInput.files[0];
  if (!file) return alert('Sélectionne un fichier JSON.');
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported)) throw new Error('Format invalide');
      imported.forEach((item, index) => {
        if (item.question && item.options && item.answer) {
          state.questionBank.push({ id: `import-${Date.now()}-${index}`, chapter: item.chapter || 'IBO', theme: item.theme || 'Annales', question: item.question, options: item.options, answer: item.answer, source: 'Annales' });
        }
      });
      saveState();
      renderQuizStatus();
      alert('Annales importées avec succès.');
    } catch (e) {
      alert('Impossible de lire le fichier : ' + e.message);
    }
  };
  reader.readAsText(file);
}

function renderQuizStatus() {
  questionBankCount.textContent = state.questionBank.length;
  if (quizChapter) {
    const chapters = [...new Set(state.questionBank.map(q => q.chapter).filter(Boolean))].sort();
    quizChapter.innerHTML = '<option value="all">Tous les chapitres</option>' + chapters.map(ch => `<option value="${ch}">${ch}</option>`).join('');
  }
}

function startMonthlyTest() {
  const questions = shuffleArray(state.questionBank).slice(0, 25);
  if (questions.length === 0) return alert('Importe des annales pour lancer le test mensuel.');
  monthlyState = { questions, index: 0, correct: 0, selected: null };
  monthlyCard.classList.remove('hidden');
  monthlySummary.classList.add('hidden');
  renderMonthlyQuestion();
}

function renderMonthlyQuestion() {
  if (!monthlyState) return;
  if (monthlyState.index >= monthlyState.questions.length) {
    finishMonthlyTest();
    return;
  }
  const question = monthlyState.questions[monthlyState.index];
  monthlyMeta.textContent = `${question.chapter} • ${question.theme}`;
  monthlyQuestion.textContent = question.question;
  monthlyOptions.innerHTML = '';
  question.options.forEach(option => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = option;
    btn.addEventListener('click', () => selectMonthlyOption(btn, option));
    monthlyOptions.appendChild(btn);
  });
}

function selectMonthlyOption(button, option) {
  monthlyState.selected = option;
  Array.from(monthlyOptions.children).forEach(btn => btn.classList.toggle('active', btn === button));
}

function validateMonthlyAnswer() {
  if (!monthlyState || !monthlyState.selected) return alert('Choisis une réponse.');
  const question = monthlyState.questions[monthlyState.index];
  const correct = monthlyState.selected === question.answer;
  if (correct) monthlyState.correct += 1;
  Array.from(monthlyOptions.children).forEach(btn => {
    btn.classList.toggle('correct', btn.textContent === question.answer);
    if (btn.textContent === monthlyState.selected && btn.textContent !== question.answer) btn.classList.add('wrong');
  });
  monthlyState.index += 1;
  setTimeout(renderMonthlyQuestion, 300);
}

function finishMonthlyTest() {
  monthlyCard.classList.add('hidden');
  monthlySummary.classList.remove('hidden');
  const score = Math.round((monthlyState.correct / monthlyState.questions.length) * 100);
  monthlyResults.textContent = `Score mensuel : ${score}% (${monthlyState.correct}/${monthlyState.questions.length}).`;
  const user = getUser(state.currentUser);
  user.monthlyTests.push({ date: TODAY, score, total: monthlyState.questions.length });
  saveState();
  monthlyState = null;
  renderApp();
}

function finishMonthlyReview() {
  monthlySummary.classList.add('hidden');
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
      goToPage('home');
    });
  });
  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => goToPage(btn.dataset.nav));
  });
  showIbAnnales.addEventListener('click', showIBAnnales);
  monthlyQuickButton.addEventListener('click', startMonthlyTest);
  importAnnalesInput.addEventListener('change', () => {
    if (importAnnalesInput.files.length) importAnnales();
  });
  saveAdminSettings.addEventListener('click', saveAdminChanges);
  resetAdminOverrides.addEventListener('click', resetAdminOverridesToDefault);
  viewMyStats.addEventListener('click', () => showProfileStats(state.currentUser));
  viewMyBadges.addEventListener('click', () => showProfileBadges(state.currentUser));
  viewOtherStats.addEventListener('click', () => showProfileStats(getOtherUserId()));
  viewOtherBadges.addEventListener('click', () => showProfileBadges(getOtherUserId()));
  timerStart.addEventListener('click', startTimer);
  timerPause.addEventListener('click', pauseTimer);
  timerStop.addEventListener('click', stopTimer);
  setMinutes.addEventListener('click', addManualReading);
  saveCardBtn.addEventListener('click', addFlashcard);
  clearCardBtn.addEventListener('click', resetFlashcardForm);
  librarySearch.addEventListener('input', renderLibrary);
  librarySort.addEventListener('change', renderLibrary);
  startReview.addEventListener('click', startReviewSession);
  showAnswer.addEventListener('click', revealAnswer);
  easyBtn.addEventListener('click', () => gradeReview('easy'));
  mediumBtn.addEventListener('click', () => gradeReview('medium'));
  hardBtn.addEventListener('click', () => gradeReview('hard'));
  finishReview.addEventListener('click', () => {
    reviewSummary.classList.add('hidden');
    renderApp();
  });
  startQuizSessionButton.addEventListener('click', startQuizSession);
  validateQuiz.addEventListener('click', validateQuizAnswer);
  finishQuiz.addEventListener('click', finishQuizSession);
  importButton.addEventListener('click', importAnnales);
  startMonthly.addEventListener('click', startMonthlyTest);
  validateMonthly.addEventListener('click', validateMonthlyAnswer);
  finishMonthly.addEventListener('click', finishMonthlyReview);
  clearData.addEventListener('click', resetAppData);
  settingsButton.addEventListener('click', () => goToPage('settings'));
  themeToggle.addEventListener('click', toggleTheme);
  document.querySelectorAll('.tab-button').forEach(btn => btn.addEventListener('click', () => goToPage(btn.dataset.nav)));
}

function applyTheme() {
  const isLight = state.theme === 'light';
  document.body.classList.toggle('light-mode', isLight);
  document.body.classList.toggle('dark-mode', !isLight);
  themeToggle.textContent = isLight ? 'Passer en mode sombre' : 'Passer en mode clair';
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  applyTheme();
  saveState();
}

function initUserDaily() {
  const user = getUser(state.currentUser);
  getDaily(user);
  const other = getUser(getOtherUserId());
  getDaily(other);
}

function init() {
  ensureSampleData();
  checkMonthTransition();
  checkDayTransition();
  renderQuizStatus();
  attachHandlers();
  applyTheme();
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

function renderQuizStatus() {
  questionBankCount.textContent = state.questionBank.length;
  if (quizChapter) {
    const chapters = [...new Set(state.questionBank.map(q => q.chapter).filter(Boolean))].sort();
    quizChapter.innerHTML = '<option value="all">Tous les chapitres</option>' + chapters.map(ch => `<option value="${ch}">${ch}</option>`).join('');
  }
}

function shuffleArray(array) {
  return array.slice().sort(() => Math.random() - 0.5);
}

init();

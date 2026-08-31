const STORAGE_KEY = 'revisio-ibo-state';
const LEGACY_SYNC_ENDPOINT = 'https://lzr-glitch.github.io/Bio_App-/';
const DEFAULT_SYNC_ENDPOINT = '';
const pages = ['home','reading','flashcards','library','work','test','quiz','quiz-create','quiz-setup','quiz-run','profile','stats','chapters','weaknesses','badges','recap','settings'];

function getDayKeyFor(date = new Date(), resetHour = 4) {
  const local = new Date(date);
  if (local.getHours() < resetHour) {
    local.setDate(local.getDate() - 1);
  }
  return toLocalDateKey(local);
}
const defaultState = {
  currentUser: null,
  streak: 0,
  pending: false,
  theme: 'dark',
  sync: { enabled: false, endpoint: '', token: '' },
  syncMeta: { usersUpdatedAt: { G: 0, R: 0 }, globalUpdatedAt: 0, lastSyncedAt: 0, resetEpoch: 0 },
  dayResetHour: 4,
  lastUpdate: getDayKeyFor(),
  lastMonth: getDayKeyFor().slice(0, 7),
  jokers: 0,
  dailyThresholds: { reading: 5, cards: 3, tested: 1 },
  deleted: { flashcards: {}, questionBank: {} },
  users: {
    G: { name: 'G', jokers: 0, chapters: {}, flashcards: [], quizzes: [], reading: {}, readingSeconds: {}, tests: [], daily: {}, monthlyTests: [], badges: [], workHistory: [] },
    R: { name: 'R', jokers: 0, chapters: {}, flashcards: [], quizzes: [], reading: {}, readingSeconds: {}, tests: [], daily: {}, monthlyTests: [], badges: [], workHistory: [] }
  },
  questionBank: []
};

const state = loadState();

function toLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDayKey(date = new Date()) {
  const resetHour = state.dayResetHour ?? 4;
  return getDayKeyFor(date, resetHour);
}

function getToday() {
  return getDayKey();
}

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

const workStartButton = document.getElementById('work-start-timer');
const workHistoryButton = document.getElementById('work-show-history');
const workTimerCard = document.getElementById('work-timer-card');
const workTimerDisplay = document.getElementById('work-timer-display');
const workTimerStatus = document.getElementById('work-timer-status');
const workTimerStart = document.getElementById('work-timer-start');
const workTimerPause = document.getElementById('work-timer-pause');
const workTimerStop = document.getElementById('work-timer-stop');
const workNoteCard = document.getElementById('work-note-card');
const workNoteText = document.getElementById('work-note-text');
const workNoteSend = document.getElementById('work-note-send');
const workNoteSave = document.getElementById('work-note-save');
const workHistoryList = document.getElementById('work-history-list');

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
const notMasteredBtn = document.getElementById('not-mastered-btn');
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
const adminActionFeedback = document.getElementById('admin-action-feedback');
const flashcardTargetHint = document.getElementById('flashcard-target-hint');
const quizQuestion = document.getElementById('quiz-question');
const quizOptions = document.getElementById('quiz-options');
const validateQuiz = document.getElementById('validate-quiz');
const quizSummary = document.getElementById('quiz-summary');
const quizSummaryTitle = document.getElementById('quiz-summary-title');
const quizResults = document.getElementById('quiz-results');
const finishQuiz = document.getElementById('finish-quiz');
const quizCreateChapter = document.getElementById('quiz-create-chapter');
const quizCreateTheme = document.getElementById('quiz-create-theme');
const quizCreateQuestion = document.getElementById('quiz-create-question');
const quizCreateExplanation = document.getElementById('quiz-create-explanation');
const quizCreateOptionsList = document.getElementById('quiz-create-options-list');
const quizCreateAddOption = document.getElementById('quiz-create-add-option');
const quizCreateSave = document.getElementById('quiz-create-save');
const quizCreateClear = document.getElementById('quiz-create-clear');
const quizCreateStatus = document.getElementById('quiz-create-status');
const quizQuestionFilter = document.getElementById('quiz-question-filter');
const quizQuestionSearch = document.getElementById('quiz-question-search');
const quizQuestionList = document.getElementById('quiz-question-list');

const startMonthly = document.getElementById('start-monthly');
const monthlyCard = document.getElementById('monthly-card');
const monthlyMeta = document.getElementById('monthly-meta');
const statsTargetHint = document.getElementById('stats-target-hint');
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
const adminSyncCard = document.getElementById('admin-sync-card');
const syncDataNowBtn = document.getElementById('sync-data-now');

const statsCharts = document.getElementById('stats-charts');
const chapterProgress = document.getElementById('chapter-progress');
const weaknessList = document.getElementById('weakness-list');
const badgeList = document.getElementById('badge-list');
const weeklyRecap = document.getElementById('weekly-recap');
const clearData = document.getElementById('clear-data');
const globalResetButton = document.getElementById('global-reset');
const themeToggle = document.getElementById('theme-toggle');
const settingsButton = document.getElementById('settings-button');
const syncEnabledInput = document.getElementById('sync-enabled');
const syncEndpointInput = document.getElementById('sync-endpoint');
const syncTokenInput = document.getElementById('sync-token');
const syncSaveButton = document.getElementById('sync-save');
const syncNowButton = document.getElementById('sync-now');
const syncEditToggle = document.getElementById('sync-edit-toggle');
const syncAdvanced = document.getElementById('sync-advanced');
const syncStatus = document.getElementById('sync-status');
const showIbAnnales = document.getElementById('show-ib-annales');
const monthlyQuickButton = document.getElementById('start-monthly-quick');
const viewMyStats = document.getElementById('view-my-stats');
const viewMyBadges = document.getElementById('view-my-badges');
const viewOtherStats = document.getElementById('view-other-stats');
const viewOtherBadges = document.getElementById('view-other-badges');
const profileHeadingG = document.getElementById('profile-heading-g');
const profileHeadingR = document.getElementById('profile-heading-r');
const adminStreakJokers = document.getElementById('admin-streak-jokers');
const saveAdminSettings = document.getElementById('save-admin-settings');

let timerInterval = null;
let timerSeconds = 0;
let isTimerRunning = false;
let workTimerInterval = null;
let workTimerSeconds = 0;
let isWorkTimerRunning = false;
let currentWorkSession = null;
let reviewQueue = [];
let adminFeedbackTimeout = null;
let reviewIndex = 0;
let reviewCorrect = 0;
let reviewRevealMode = false;
let reviewSessionMode = 'review';
let quizState = null;
let monthlyState = null;
let currentLibraryGroup = null;
let editingFlashcardId = null;
let syncInFlight = false;
let syncRequestedWhileBusy = false;
let syncDebounceTimeout = null;
let syncPollInterval = null;
let syncEventSource = null;
let lastRemoteDocUpdatedAt = 0;

function createEventId(prefix) {
  return `${prefix}-${state.currentUser || 'anon'}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return parseState(raw);
}

function parseState(raw) {
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

function touchSyncMeta() {
  if (!state.syncMeta) state.syncMeta = { usersUpdatedAt: { G: 0, R: 0 }, globalUpdatedAt: 0, lastSyncedAt: 0, resetEpoch: 0 };
  if (!state.syncMeta.usersUpdatedAt) state.syncMeta.usersUpdatedAt = { G: 0, R: 0 };
  if (!Number.isFinite(state.syncMeta.resetEpoch)) state.syncMeta.resetEpoch = 0;
  const now = Date.now();
  if (state.currentUser && state.syncMeta.usersUpdatedAt[state.currentUser] != null) {
    state.syncMeta.usersUpdatedAt[state.currentUser] = now;
  }
  state.syncMeta.globalUpdatedAt = now;
}

function saveState(options = {}) {
  if (!options.skipTouch) {
    touchSyncMeta();
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('saveState: localStorage.setItem failed', e);
  }
  if (!options.skipSync) {
    console.debug('saveState: scheduling sync');
    scheduleSync();
  }
}

function replaceState(nextState) {
  Object.keys(state).forEach(key => {
    delete state[key];
  });
  Object.assign(state, nextState);
}

function setText(element, value) {
  if (element) element.textContent = value;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function isSyncConfigured() {
  return Boolean(state.sync?.enabled && state.sync?.endpoint);
}

function normalizeSyncEndpoint(rawValue) {
  const value = String(rawValue || '').trim();
  if (!value) return '';
  if (/\/bio-app\/state\.json$/i.test(value)) return value;
  if (/firebasedatabase\.app\/?$/i.test(value) || /firebaseio\.com\/?$/i.test(value)) {
    return `${value.replace(/\/+$/, '')}/bio-app/state.json`;
  }
  return value;
}

function setSyncStatus(message) {
  if (!syncStatus) return;
  syncStatus.textContent = message;
}

function getSyncHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (state.sync?.token) {
    headers.Authorization = `Bearer ${state.sync.token}`;
  }
  return headers;
}

function getDeletedMap(type) {
  if (!state.deleted || typeof state.deleted !== 'object') {
    state.deleted = { flashcards: {}, questionBank: {} };
  }
  if (!state.deleted[type] || typeof state.deleted[type] !== 'object') {
    state.deleted[type] = {};
  }
  return state.deleted[type];
}

function markDeleted(type, id) {
  if (!id) return;
  getDeletedMap(type)[id] = Date.now();
}

function buildSyncDocument() {
  return {
    version: 1,
    updatedAt: Date.now(),
    meta: {
      usersUpdatedAt: { ...(state.syncMeta?.usersUpdatedAt || { G: 0, R: 0 }) },
      globalUpdatedAt: state.syncMeta?.globalUpdatedAt || 0,
      resetEpoch: Number(state.syncMeta?.resetEpoch) || 0
    },
    data: {
      users: {
        G: JSON.parse(JSON.stringify(getUser('G'))),
        R: JSON.parse(JSON.stringify(getUser('R')))
      },
      deleted: JSON.parse(JSON.stringify(state.deleted || { flashcards: {}, questionBank: {} })),
      questionBank: JSON.parse(JSON.stringify(state.questionBank || [])),
      streak: state.streak,
      pending: state.pending,
      jokers: state.jokers,
      dailyThresholds: JSON.parse(JSON.stringify(state.dailyThresholds || { reading: 5, cards: 3, tested: 1 })),
      dayResetHour: state.dayResetHour,
      lastUpdate: state.lastUpdate,
      lastMonth: state.lastMonth
    }
  };
}

function sanitizeSyncDoc(doc) {
  if (!doc || typeof doc !== 'object') return null;
  const safe = {
    version: Number(doc.version) || 1,
    updatedAt: Number(doc.updatedAt) || 0,
    meta: {
      usersUpdatedAt: {
        G: Number(doc.meta?.usersUpdatedAt?.G) || 0,
        R: Number(doc.meta?.usersUpdatedAt?.R) || 0
      },
      globalUpdatedAt: Number(doc.meta?.globalUpdatedAt) || 0,
      resetEpoch: Number(doc.meta?.resetEpoch) || 0
    },
    data: {
      users: {
        G: deepMerge(JSON.parse(JSON.stringify(defaultState.users.G)), doc.data?.users?.G || {}),
        R: deepMerge(JSON.parse(JSON.stringify(defaultState.users.R)), doc.data?.users?.R || {})
      },
      deleted: {
        flashcards: doc.data?.deleted?.flashcards || {},
        questionBank: doc.data?.deleted?.questionBank || {}
      },
      questionBank: Array.isArray(doc.data?.questionBank) ? doc.data.questionBank : [],
      streak: Number(doc.data?.streak) || 0,
      pending: Boolean(doc.data?.pending),
      jokers: Number(doc.data?.jokers) || 0,
      dailyThresholds: doc.data?.dailyThresholds || { reading: 5, cards: 3, tested: 1 },
      dayResetHour: Number(doc.data?.dayResetHour ?? 4),
      lastUpdate: doc.data?.lastUpdate || getToday(),
      lastMonth: doc.data?.lastMonth || getToday().slice(0, 7)
    }
  };
  return safe;
}

function mergeDeletedMaps(localMap = {}, remoteMap = {}) {
  const merged = { ...(localMap || {}) };
  Object.keys(remoteMap || {}).forEach(id => {
    merged[id] = Math.max(Number(merged[id]) || 0, Number(remoteMap[id]) || 0);
  });
  return merged;
}

function mergeQuestionBank(localQuestions, remoteQuestions, deletedMap = {}) {
  const merged = new Map();
  [...remoteQuestions, ...localQuestions].forEach(question => {
    if (!question?.id) return;
    if (deletedMap[question.id]) return;
    const existing = merged.get(question.id);
    if (!existing) {
      merged.set(question.id, question);
      return;
    }
    const existingTime = new Date(existing.createdAt || 0).getTime() || 0;
    const currentTime = new Date(question.createdAt || 0).getTime() || 0;
    merged.set(question.id, currentTime >= existingTime ? question : existing);
  });
  return [...merged.values()];
}

function mergeById(localItems = [], remoteItems = [], deletedMap = {}) {
  const merged = new Map();
  [...localItems, ...remoteItems].forEach(item => {
    if (!item) return;
    const key = item.id || `${item.date || ''}-${item.questionId || item.question || item.score || JSON.stringify(item)}`;
    if (item.id && deletedMap[item.id]) return;
    const previous = merged.get(key);
    if (!previous) {
      merged.set(key, item);
      return;
    }
    const previousTime = new Date(previous.updatedAt || previous.createdAt || previous.date || 0).getTime() || 0;
    const itemTime = new Date(item.updatedAt || item.createdAt || item.date || 0).getTime() || 0;
    merged.set(key, itemTime >= previousTime ? { ...previous, ...item } : { ...item, ...previous });
  });
  return [...merged.values()];
}

function normalizeEventItem(item, prefix) {
  if (!item || typeof item !== 'object') return item;
  const normalized = { ...item };
  if (!normalized.id) {
    const baseTime = normalized.updatedAt || normalized.createdAt || normalized.date || Date.now();
    normalized.id = `${prefix}-${normalized.createdBy || normalized.user || 'legacy'}-${String(baseTime).replace(/[^0-9TZ:.-]/g, '')}`;
  }
  if (!normalized.updatedAt) normalized.updatedAt = normalized.createdAt || normalized.date || new Date().toISOString();
  return normalized;
}

function mergeNumericMaps(localMap = {}, remoteMap = {}) {
  const merged = { ...localMap };
  Object.keys(remoteMap || {}).forEach(key => {
    merged[key] = Math.max(Number(merged[key]) || 0, Number(remoteMap[key]) || 0);
  });
  return merged;
}

function mergeDailyMaps(localDaily = {}, remoteDaily = {}) {
  const merged = { ...localDaily };
  Object.keys(remoteDaily || {}).forEach(day => {
    const local = merged[day] || {};
    const remote = remoteDaily[day] || {};
    merged[day] = {
      ...local,
      ...remote,
      reading: Math.max(Number(local.reading) || 0, Number(remote.reading) || 0),
      cards: Math.max(Number(local.cards) || 0, Number(remote.cards) || 0),
      tested: Math.max(Number(local.tested) || 0, Number(remote.tested) || 0),
      complete: Boolean(local.complete || remote.complete)
    };
  });
  return merged;
}

function mergeUsers(localUser, remoteUser, deleted = {}) {
  const local = deepMerge(JSON.parse(JSON.stringify(defaultState.users[localUser?.name] || defaultState.users.G)), localUser || {});
  const remote = deepMerge(JSON.parse(JSON.stringify(defaultState.users[remoteUser?.name] || defaultState.users.G)), remoteUser || {});
  return {
    ...local,
    ...remote,
    jokers: Math.max(Number(local.jokers) || 0, Number(remote.jokers) || 0),
    chapters: { ...(local.chapters || {}), ...(remote.chapters || {}) },
    reading: mergeNumericMaps(local.reading, remote.reading),
    readingSeconds: mergeNumericMaps(local.readingSeconds, remote.readingSeconds),
    daily: mergeDailyMaps(local.daily, remote.daily),
    flashcards: mergeById(local.flashcards || [], remote.flashcards || [], deleted.flashcards || {}).map(normalizeFlashcard),
    quizzes: mergeById((local.quizzes || []).map(item => normalizeEventItem(item, 'quiz')), (remote.quizzes || []).map(item => normalizeEventItem(item, 'quiz'))),
    tests: mergeById((local.tests || []).map(item => normalizeEventItem(item, 'test')), (remote.tests || []).map(item => normalizeEventItem(item, 'test'))),
    monthlyTests: mergeById((local.monthlyTests || []).map(item => normalizeEventItem(item, 'monthly')), (remote.monthlyTests || []).map(item => normalizeEventItem(item, 'monthly'))),
    badges: [...new Set([...(local.badges || []), ...(remote.badges || [])])],
    workHistory: mergeById((local.workHistory || []).map(item => normalizeEventItem(item, 'work')), (remote.workHistory || []).map(item => normalizeEventItem(item, 'work')))
  };
}

function applyDeletedToUser(user, deleted = {}) {
  const safeUser = deepMerge(JSON.parse(JSON.stringify(defaultState.users[user?.name] || defaultState.users.G)), user || {});
  safeUser.flashcards = mergeById(safeUser.flashcards || [], [], deleted.flashcards || {}).map(normalizeFlashcard);
  safeUser.quizzes = (safeUser.quizzes || []).map(item => normalizeEventItem(item, 'quiz'));
  safeUser.tests = (safeUser.tests || []).map(item => normalizeEventItem(item, 'test'));
  safeUser.monthlyTests = (safeUser.monthlyTests || []).map(item => normalizeEventItem(item, 'monthly'));
  safeUser.workHistory = (safeUser.workHistory || []).map(item => normalizeEventItem(item, 'work'));
  return safeUser;
}

function mergeUserSnapshots(localUser, remoteUser, localTs, remoteTs, deleted = {}) {
  if (localTs > remoteTs) return applyDeletedToUser(localUser, deleted);
  if (remoteTs > localTs) return applyDeletedToUser(remoteUser, deleted);
  return mergeUsers(localUser, remoteUser, deleted);
}

function normalizeFlashcard(card) {
  if (!card || typeof card !== 'object') return card;
  const answer = typeof card.answer === 'string' && card.answer.trim()
    ? card.answer.trim()
    : Array.isArray(card.answers) && card.answers.length
      ? String(card.answers[Number.isInteger(card.correctAnswerIndex) ? card.correctAnswerIndex : 0] ?? card.answers[0] ?? '').trim()
      : '';
  return {
    ...card,
    answer,
    mastery: ['non-maitrise', 'moyen-', 'moyen+', 'maitrise'].includes(card.mastery) ? card.mastery : 'non-maitrise',
    seenBy: Array.isArray(card.seenBy) ? card.seenBy : []
  };
}

function getFlashcardAnswerText(card) {
  return normalizeFlashcard(card)?.answer || '';
}

function getFlashcardMastery(card) {
  return normalizeFlashcard(card)?.mastery || 'non-maitrise';
}

function setFlashcardMastery(card, mastery) {
  if (!card) return;
  card.mastery = mastery;
}

function getFlashcardMasteryLabel(mastery) {
  const labels = {
    'non-maitrise': 'Non maîtrisé',
    'moyen-': 'Moyen -',
    'moyen+': 'Moyen +',
    maitrise: 'Maîtrisé'
  };
  return labels[mastery] || 'Non maîtrisé';
}

function getFlashcardMasteryWeight(mastery) {
  const weights = {
    'non-maitrise': 50,
    'moyen-': 30,
    'moyen+': 15,
    maitrise: 5
  };
  return weights[mastery] || 50;
}

function sampleWeightedFlashcards(cards, count) {
  const remaining = cards.map(card => normalizeFlashcard(card)).filter(Boolean);
  const selected = [];
  const targetCount = Math.min(count, remaining.length);
  while (selected.length < targetCount && remaining.length > 0) {
    const totalWeight = remaining.reduce((sum, card) => sum + getFlashcardMasteryWeight(getFlashcardMastery(card)), 0);
    let cursor = Math.random() * totalWeight;
    let index = 0;
    for (; index < remaining.length; index += 1) {
      cursor -= getFlashcardMasteryWeight(getFlashcardMastery(remaining[index]));
      if (cursor <= 0) break;
    }
    const chosen = remaining.splice(Math.min(index, remaining.length - 1), 1)[0];
    if (chosen) selected.push(chosen);
  }
  return selected;
}

function mergeSyncDocs(localDoc, remoteDoc) {
  if (!remoteDoc) return localDoc;
  const local = sanitizeSyncDoc(localDoc);
  const remote = sanitizeSyncDoc(remoteDoc);
  if (!local || !remote) return localDoc;
  if ((remote.meta.resetEpoch || 0) > (local.meta.resetEpoch || 0)) {
    const forcedRemote = JSON.parse(JSON.stringify(remote));
    forcedRemote.updatedAt = Date.now();
    return forcedRemote;
  }
  if ((local.meta.resetEpoch || 0) > (remote.meta.resetEpoch || 0)) {
    const forcedLocal = JSON.parse(JSON.stringify(local));
    forcedLocal.updatedAt = Date.now();
    return forcedLocal;
  }

  const merged = JSON.parse(JSON.stringify(local));
  const mergedDeleted = {
    flashcards: mergeDeletedMaps(local.data.deleted?.flashcards, remote.data.deleted?.flashcards),
    questionBank: mergeDeletedMaps(local.data.deleted?.questionBank, remote.data.deleted?.questionBank)
  };
  ['G', 'R'].forEach(userId => {
    const localTs = local.meta.usersUpdatedAt[userId] || 0;
    const remoteTs = remote.meta.usersUpdatedAt[userId] || 0;
    merged.data.users[userId] = mergeUserSnapshots(local.data.users[userId], remote.data.users[userId], localTs, remoteTs, mergedDeleted);
    merged.meta.usersUpdatedAt[userId] = Math.max(localTs, remoteTs);
  });

  merged.data.deleted = mergedDeleted;
  merged.data.questionBank = mergeQuestionBank(local.data.questionBank, remote.data.questionBank, mergedDeleted.questionBank);

  if ((remote.meta.globalUpdatedAt || 0) > (local.meta.globalUpdatedAt || 0)) {
    merged.data.streak = remote.data.streak;
    merged.data.pending = remote.data.pending;
    merged.data.jokers = remote.data.jokers;
    merged.data.dailyThresholds = remote.data.dailyThresholds;
    merged.data.dayResetHour = remote.data.dayResetHour;
    merged.data.lastUpdate = remote.data.lastUpdate;
    merged.data.lastMonth = remote.data.lastMonth;
    merged.meta.globalUpdatedAt = remote.meta.globalUpdatedAt;
  }

  merged.updatedAt = Date.now();
  return merged;
}

function applySyncDoc(doc) {
  const safe = sanitizeSyncDoc(doc);
  if (!safe) return;
  state.users.G = safe.data.users.G;
  state.users.R = safe.data.users.R;
  state.deleted = safe.data.deleted;
  state.questionBank = safe.data.questionBank;
  state.streak = safe.data.streak;
  state.pending = safe.data.pending;
  state.jokers = safe.data.jokers;
  state.dailyThresholds = safe.data.dailyThresholds;
  state.dayResetHour = safe.data.dayResetHour;
  state.lastUpdate = safe.data.lastUpdate;
  state.lastMonth = safe.data.lastMonth;
  if (!state.syncMeta) state.syncMeta = { usersUpdatedAt: { G: 0, R: 0 }, globalUpdatedAt: 0, lastSyncedAt: 0 };
  state.syncMeta.usersUpdatedAt = safe.meta.usersUpdatedAt;
  state.syncMeta.globalUpdatedAt = safe.meta.globalUpdatedAt;
  state.syncMeta.resetEpoch = safe.meta.resetEpoch || 0;
}

async function pullRemoteDoc(withEtag = false) {
  console.debug('pullRemoteDoc: fetching', state.sync.endpoint);
  const headers = getSyncHeaders();
  if (withEtag) headers['X-Firebase-ETag'] = 'true';
  const response = await fetch(state.sync.endpoint, {
    method: 'GET',
    cache: 'no-store',
    headers
  });
  console.debug('pullRemoteDoc: response status', response.status, response.statusText);
  if (response.status === 404) return withEtag ? { doc: null, etag: null } : null;
  if (!response.ok) throw new Error(`GET ${response.status}`);
  const contentType = response.headers.get('content-type') || '';
  console.debug('pullRemoteDoc: content-type', contentType);
  if (!contentType.includes('application/json')) {
    throw new Error('Endpoint sync invalide: réponse non JSON');
  }
  const json = await response.json();
  const doc = json?.data && json?.meta ? json : json?.state && json?.meta ? json.state : json;
  return withEtag ? { doc, etag: response.headers.get('etag') } : doc;
}

async function pushRemoteDoc(doc, etag = null) {
  const maxAttempts = 3;
  const body = JSON.stringify(doc);
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      console.debug(`pushRemoteDoc: attempt ${attempt} to ${state.sync.endpoint}`);
      const headers = getSyncHeaders();
      if (etag) headers['if-match'] = etag;
      const response = await fetch(state.sync.endpoint, {
        method: 'PUT',
        headers,
        body
      });
      if (response.status === 412) {
        console.debug('pushRemoteDoc: concurrent remote change detected');
        return { conflict: true };
      }
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        const errMsg = `PUT ${response.status} ${response.statusText} ${text}`;
        console.warn('pushRemoteDoc failure:', errMsg);
        if (attempt === maxAttempts) throw new Error(errMsg);
        // wait a bit and retry
        await new Promise(res => setTimeout(res, 300 * attempt));
        continue;
      }
      console.debug(`pushRemoteDoc: success on attempt ${attempt}`);
      return { conflict: false };
    } catch (err) {
      console.warn(`pushRemoteDoc: network/exception on attempt ${attempt}:`, err);
      if (attempt === maxAttempts) throw err;
      await new Promise(res => setTimeout(res, 300 * attempt));
    }
  }
}

async function syncNow(showFeedback = false) {
  if (!isSyncConfigured()) {
    if (showFeedback) setSyncStatus('Configure une URL puis active la sync.');
    return false;
  }
  if (!navigator.onLine) {
    if (showFeedback) setSyncStatus('Hors ligne, sync en attente.');
    return false;
  }
  if (syncInFlight) {
    syncRequestedWhileBusy = true;
    return false;
  }
  syncInFlight = true;
  syncRequestedWhileBusy = false;
  if (showFeedback) setSyncStatus('Synchronisation en cours...');
  try {
    const maxMergeAttempts = 12;
    let mergedDoc = null;
    let synced = false;
    for (let attempt = 1; attempt <= maxMergeAttempts; attempt += 1) {
      const localDoc = buildSyncDocument();
      const remote = await pullRemoteDoc(true);
      console.debug('syncNow: remoteDoc.meta', remote.doc?.meta, 'remoteDoc.updatedAt', remote.doc?.updatedAt);
      mergedDoc = mergeSyncDocs(localDoc, remote.doc);
      console.debug('syncNow: mergedDoc.meta', mergedDoc.meta, 'mergedDoc.updatedAt', mergedDoc.updatedAt);
      if (remote.doc && getComparableSyncDoc(mergedDoc) === getComparableSyncDoc(remote.doc)) {
        synced = true;
        break;
      }
      const result = await pushRemoteDoc(mergedDoc, remote.etag);
      if (!result.conflict) {
        synced = true;
        break;
      }
      console.debug(`syncNow: retrying merge after concurrent update (${attempt}/${maxMergeAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 180 + Math.floor(Math.random() * 320) + (attempt * 90)));
    }
    if (!synced || !mergedDoc) {
      scheduleSync(3000);
      if (showFeedback) setSyncStatus('Synchronisation différée : une autre version de l’app écrit encore.');
      return false;
    }
    applySyncDoc(mergedDoc);
    state.syncMeta.lastSyncedAt = Date.now();
    saveState({ skipTouch: true, skipSync: true });
    try {
      renderApp();
    } catch (renderError) {
      console.error(renderError);
      setSyncStatus(`Synchronisé, mais affichage à recharger: ${renderError.message}`);
      return true;
    }
    const timeLabel = new Date(state.syncMeta.lastSyncedAt).toLocaleTimeString('fr-FR');
    setSyncStatus(`Synchronisé (${timeLabel}).`);
    return true;
  } catch (error) {
    if (String(error?.message || '').includes('401')) {
      setSyncStatus('Erreur sync: accès refusé, vérifie l’URL ou le token.');
      return false;
    }
    setSyncStatus(`Erreur sync: ${error.message}`);
    return false;
  } finally {
    syncInFlight = false;
    if (syncRequestedWhileBusy && isSyncConfigured() && navigator.onLine) {
      syncRequestedWhileBusy = false;
      setTimeout(() => {
        syncNow(false);
      }, 150);
    }
  }
}

function scheduleSync(delay = 1200) {
  if (!isSyncConfigured()) return;
  if (!navigator.onLine) return;
  console.debug('scheduleSync: will run in', delay, 'ms');
  clearTimeout(syncDebounceTimeout);
  syncDebounceTimeout = setTimeout(() => {
    syncNow(false);
  }, delay);
}

function startSyncPolling() {
  if (syncPollInterval) clearInterval(syncPollInterval);
  if (!isSyncConfigured()) {
    syncPollInterval = null;
    return;
  }
  const intervalMs = document.hidden ? 10000 : 2500;
  syncPollInterval = setInterval(() => {
    syncNow(false);
  }, intervalMs);
}

function stopSyncRealtime() {
  if (syncEventSource) {
    syncEventSource.close();
    syncEventSource = null;
  }
}

function getComparableSyncDoc(doc) {
  const safe = sanitizeSyncDoc(doc);
  if (!safe) return '';
  return JSON.stringify({
    meta: safe.meta,
    data: safe.data
  });
}

function handleIncomingRemoteDoc(remoteDoc) {
  const safeRemote = sanitizeSyncDoc(remoteDoc);
  if (!safeRemote) return false;
  if (!safeRemote.updatedAt && !safeRemote.meta?.globalUpdatedAt) return false;
  const remoteStamp = safeRemote.updatedAt || safeRemote.meta.globalUpdatedAt || 0;
  const localDoc = buildSyncDocument();
  if (remoteStamp < (lastRemoteDocUpdatedAt || 0) && remoteStamp <= (localDoc.updatedAt || 0)) {
    return false;
  }
  const mergedDoc = mergeSyncDocs(localDoc, safeRemote);
  const shouldRepush = getComparableSyncDoc(mergedDoc) !== getComparableSyncDoc(safeRemote);
  applySyncDoc(mergedDoc);
  lastRemoteDocUpdatedAt = Math.max(remoteStamp, mergedDoc.updatedAt || 0);
  state.syncMeta.lastSyncedAt = Date.now();
  saveState({ skipTouch: true, skipSync: true });
  renderApp();
  if (shouldRepush && navigator.onLine) {
    scheduleSync(120);
  }
  return true;
}

function startSyncRealtime() {
  stopSyncRealtime();
  if (!isSyncConfigured()) return;
  if (typeof EventSource === 'undefined') return;
  if (state.sync?.token) return;
  try {
    syncEventSource = new EventSource(state.sync.endpoint, { withCredentials: false });
    const handleEvent = (event) => {
      try {
        const payload = JSON.parse(event.data || 'null');
        if (!payload || payload.data == null) return;
        const nextDoc = payload.path === '/' ? payload.data : null;
        if (!nextDoc) return;
        handleIncomingRemoteDoc(nextDoc);
      } catch (error) {
        console.warn('sync stream parse failed', error);
      }
    };
    syncEventSource.addEventListener('put', handleEvent);
    syncEventSource.addEventListener('patch', async () => {
      await syncNow(false);
    });
    syncEventSource.addEventListener('error', () => {
      stopSyncRealtime();
      setTimeout(() => {
        if (isSyncConfigured()) startSyncRealtime();
      }, 3000);
    });
  } catch (error) {
    console.warn('Could not start realtime sync stream', error);
  }
}

function getPastDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function getUser(id) {
  if (!state.users) state.users = {};
  if (!state.users[id]) {
    state.users[id] = {
      name: id,
      jokers: 0,
      chapters: {},
      flashcards: [],
      quizzes: [],
      reading: {},
      readingSeconds: {},
      tests: [],
      daily: {},
      monthlyTests: [],
      badges: [],
      workHistory: []
    };
  }
  const user = state.users[id];
  if (!Array.isArray(user.flashcards)) user.flashcards = [];
  if (!Array.isArray(user.quizzes)) user.quizzes = [];
  if (!user.reading || typeof user.reading !== 'object') user.reading = {};
  if (!user.readingSeconds || typeof user.readingSeconds !== 'object') user.readingSeconds = {};
  if (!Array.isArray(user.tests)) user.tests = [];
  if (!user.daily || typeof user.daily !== 'object') user.daily = {};
  if (!Array.isArray(user.monthlyTests)) user.monthlyTests = [];
  if (!Array.isArray(user.badges)) user.badges = [];
  if (!Array.isArray(user.workHistory)) user.workHistory = [];
  if (!user.chapters || typeof user.chapters !== 'object') user.chapters = {};
  return user;
}

function getOtherUserId() {
  return state.currentUser === 'G' ? 'R' : 'G';
}

function canDeleteFlashcard(card) {
  if (!card) return false;
  return card.user === state.currentUser;
}

function canEditFlashcard(card) {
  return canDeleteFlashcard(card);
}

function canDeleteQuizQuestion(question) {
  if (!question) return false;
  if (question.createdBy) return question.createdBy === state.currentUser;
  return question.source === 'Annales';
}

function getDaily(user, day = getToday()) {
  if (!user) return { reading: 0, cards: 0, tested: 0, complete: false };
  if (!user.daily || typeof user.daily !== 'object') {
    user.daily = {};
  }
  if (!user.daily[day]) {
    user.daily[day] = { reading: 0, cards: 0, tested: 0, complete: false };
  }
  return user.daily[day];
}

function checkDayTransition() {
  const now = new Date();
  const todayKey = getToday();
  if (state.lastUpdate === todayKey) return;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = getDayKey(yesterday);
  const gDone = getDaily(getUser('G'), yesterdayKey).complete;
  const rDone = getDaily(getUser('R'), yesterdayKey).complete;
  if (now.getHours() >= (state.dayResetHour ?? 4)) {
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
        streakHint.textContent = 'Streak perdu, aucune journée validée.';
      }
      state.pending = false;
    }
    state.lastUpdate = getToday();
    saveState();
  }
}

function checkMonthTransition() {
  const currentMonth = getToday().slice(0, 7);
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
    const navKey = page === 'chapters' ? 'chapter' : page;
    const tab = document.querySelector(`.tab-button[data-nav="${navKey}"]`);
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
  if (page === 'stats') renderStats();
  if (page === 'badges') renderBadges();
  if (page === 'settings') renderSettings();
  if (page === 'work') renderWorkHistory();
  if (page === 'quiz') renderQuizStatus();
  if (page === 'quiz-create') {
    ensureQuizCreateOptions();
    renderQuizStatus();
  }
  if (page === 'test') populateTagFilter();
  if (page === 'library' || page === 'flashcards') {
    markOtherCardsSeen();
  }
}

function applyPageTheme(page) {
  const themeClasses = ['theme-default', 'theme-read', 'theme-flashcards', 'theme-review', 'theme-quiz', 'theme-library', 'theme-work'];
  document.body.classList.remove(...themeClasses);
  const pageTheme = {
    reading: 'theme-read',
    flashcards: 'theme-flashcards',
    test: 'theme-review',
    quiz: 'theme-quiz',
    'quiz-create': 'theme-quiz',
    'quiz-setup': 'theme-quiz',
    'quiz-run': 'theme-quiz',
    library: 'theme-library',
    work: 'theme-work'
  };
  document.body.classList.add(pageTheme[page] || 'theme-default');
}

function markOtherCardsSeen() {
  return false;
}

function renderApp() {
  if (!state.currentUser) {
    startScreen.classList.remove('hidden');
    appScreen.classList.add('hidden');
    return;
  }
  startScreen.classList.add('hidden');
  appScreen.classList.remove('hidden');
  setText(currentUserBadge, `Profil ${state.currentUser}`);
  setText(otherUserBadge, `Autre ${getOtherUserId()}`);
  setText(streakCount, state.streak);
  setText(streakStatus, state.pending ? 'En attente' : 'Actif');
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

function sumWorkLast7(user) {
  const last7 = getLastDays(7);
  return (user.workHistory || [])
    .filter(entry => {
      const day = new Date(entry.date).toISOString().slice(0,10);
      return last7.includes(day);
    })
    .reduce((sum, entry) => sum + Math.floor(entry.duration / 60), 0); // en minutes
}

function updateHome() {
  const user = getUser(state.currentUser);
  const other = getUser(getOtherUserId());
  const today = getDaily(user);
  const otherToday = getDaily(other);
  const otherFlashcards = Array.isArray(other.flashcards) ? other.flashcards : [];
  setText(todayReading, `${today.reading} min`);
  setText(todayFlashcards, today.cards);
  setText(todayTested, today.tested);
  setText(otherProgress, otherToday.complete ? 'L’autre a terminé' : 'En cours');
  setText(homeNotice, today.complete ? 'Tu as terminé ta journée !' : 'Il te reste des étapes.');
  const unseenCount = otherFlashcards.filter(card => !card.seenBy || !card.seenBy.includes(state.currentUser)).length;
  setText(otherUnseenCount, unseenCount);
}

function renderReading() {
  const user = getUser(state.currentUser);
  const readings = user.reading && typeof user.reading === 'object' ? user.reading : {};
  const days = Object.keys(readings).sort((a, b) => b.localeCompare(a)).slice(0, 7);
  readingHistory.innerHTML = '';
  days.forEach(day => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `<span>${day}</span>
      <strong>${user.reading[day]} min</strong>
      <div class="history-actions">
        <button type="button" class="secondary-button" data-action="edit-reading" data-day="${day}">Modifier</button>
        <button type="button" class="danger-button" data-action="delete-reading" data-day="${day}">Supprimer</button>
      </div>`;
    readingHistory.appendChild(item);
  });
  if (days.length === 0) {
    readingHistory.innerHTML = '<div class="history-item"><span>Aucun historique encore</span></div>';
  }
  updateTimerDisplay();
}

function refreshDailyCompletionForDay(user, dayKey) {
  const daily = getDaily(user, dayKey);
  const thresholds = state.dailyThresholds || { reading: 5, cards: 3, tested: 1 };
  daily.complete = daily.reading >= thresholds.reading && daily.cards >= thresholds.cards && daily.tested >= thresholds.tested;
}

function editReadingEntry(dayKey) {
  const user = getUser(state.currentUser);
  const current = user.reading[dayKey];
  if (current == null) return;
  const raw = prompt(`Modifier les minutes pour ${dayKey}`, String(current));
  if (raw === null) return;
  const next = Number(raw);
  if (!Number.isFinite(next) || next < 0) {
    alert('Entre un nombre valide (0 ou plus).');
    return;
  }
  const roundedMinutes = Math.round(next);
  user.reading[dayKey] = roundedMinutes;
  if (!user.readingSeconds) user.readingSeconds = {};
  user.readingSeconds[dayKey] = roundedMinutes * 60;
  const daily = getDaily(user, dayKey);
  daily.reading = user.reading[dayKey];
  refreshDailyCompletionForDay(user, dayKey);
  saveState();
  renderApp();
}

function deleteReadingEntry(dayKey) {
  const user = getUser(state.currentUser);
  if (user.reading[dayKey] == null) return;
  const confirmed = confirm(`Supprimer l'entrée de lecture du ${dayKey} ?`);
  if (!confirmed) return;
  delete user.reading[dayKey];
  if (user.readingSeconds) delete user.readingSeconds[dayKey];
  const daily = getDaily(user, dayKey);
  daily.reading = 0;
  refreshDailyCompletionForDay(user, dayKey);
  saveState();
  renderApp();
}

function getFlashcardAnswers(card) {
  const answer = getFlashcardAnswerText(card);
  return answer ? [answer] : [];
}

function getFlashcardCorrectIndex(card) {
  return 0;
}

function renderFlashcardAnswers(card) {
  const answer = getFlashcardAnswerText(card);
  if (!answer) return '<div class="flashcard-answers-list"><div class="flashcard-answer correct">Aucune réponse</div></div>';
  return `<div class="flashcard-answers-list"><div class="flashcard-answer correct">${escapeHtml(answer)}</div></div>`;
}

function fillFlashcardForm(card) {
  cardQuestion.value = card.question || '';
  if (cardAnswer) cardAnswer.value = getFlashcardAnswerText(card);
  cardTags.value = (card.tags || []).join(', ');
  cardExplanation.value = card.explanation || '';
  cardNote.value = card.note || '';
}

function findFlashcardById(cardId) {
  for (const userId of ['G', 'R']) {
    const user = getUser(userId);
    const card = user.flashcards.find(item => item.id === cardId);
    if (card) return { user, card };
  }
  return null;
}

function startEditFlashcard(cardId) {
  const result = findFlashcardById(cardId);
  if (!result) return;
  if (!canEditFlashcard(result.card)) {
    alert('Tu ne peux pas modifier cette flashcard.');
    return;
  }
  editingFlashcardId = cardId;
  fillFlashcardForm(result.card);
  saveCardBtn.textContent = 'Mettre à jour la carte';
  cardQuestion.focus();
}

function updateFlashcard(cardId, data) {
  const result = findFlashcardById(cardId);
  if (!result) return false;
  if (!canEditFlashcard(result.card)) {
    alert('Tu ne peux pas modifier cette flashcard.');
    return false;
  }
  Object.assign(result.card, data, { updatedAt: new Date().toISOString() });
  saveState();
  editingFlashcardId = null;
  resetFlashcardForm();
  renderApp();
  return true;
}

function renderFlashcards() {
  const user = getUser(state.currentUser);
  const today = getDaily(user);
  todayCardsList.innerHTML = '';
  const cards = Array.isArray(user.flashcards) ? user.flashcards.filter(card => card.date === getToday()) : [];
  if (cards.length === 0) {
    todayCardsList.innerHTML = '<div class="history-item"><span>Aucune carte créée aujourd’hui</span></div>';
    return;
  }
  cards.forEach(card => {
    const item = document.createElement('div');
    item.className = 'history-item';
    const editButton = canEditFlashcard(card) ? `<button type="button" class="secondary-button delete-inline-button" data-action="edit-flashcard" data-card-id="${card.id}">Modifier</button>` : '';
    const deleteButton = canDeleteFlashcard(card) ? `<button type="button" class="danger-button delete-inline-button" data-action="delete-flashcard" data-card-id="${card.id}">Supprimer</button>` : '';
    item.innerHTML = `<span>${escapeHtml(card.question)}</span>
      <strong>${escapeHtml((card.tags || []).join(', '))}</strong>
      <div class="flashcard-category-pill">${escapeHtml(getFlashcardMasteryLabel(getFlashcardMastery(card)))}</div>
      ${renderFlashcardAnswers(card)}
      ${editButton}
      ${deleteButton}`;
    todayCardsList.appendChild(item);
  });
}

function startViewingOtherUnseen() {
  const other = getUser(getOtherUserId());
  const unseen = (other.flashcards || []).filter(card => !(card.seenBy || []).includes(state.currentUser));
  if (!unseen || unseen.length === 0) {
    alert("Aucune carte non vue de l'autre.");
    return;
  }
  startFlashcardReview(unseen, 'other-unseen');
  goToPage('test');
}

function getFlashcardSearchValues(card) {
  return [card.question, getFlashcardAnswerText(card), card.explanation, ...(card.tags || [])];
}

function renderLibrary() {
  const user = getUser(state.currentUser);
  const other = getUser(getOtherUserId());
  const filter = librarySearch.value.trim().toLowerCase();
  const sort = librarySort.value;
  const cards = [...user.flashcards, ...other.flashcards].sort((a, b) => {
    if (sort === 'tag') return a.tags[0].localeCompare(b.tags[0]);
    if (sort === 'user') return a.user.localeCompare(b.user);
    return b.date.localeCompare(a.date);
  }).filter(card => {
    if (!filter) return true;
    return getFlashcardSearchValues(card).some(text => String(text || '').toLowerCase().includes(filter));
  });

  if (sort !== (currentLibraryGroup?.sort ?? sort)) {
    currentLibraryGroup = null;
  }

  libraryList.innerHTML = '';
  if (cards.length === 0) {
    libraryList.innerHTML = '<div class="library-card"><span>Aucune carte correspondante.</span></div>';
    return;
  }

  if (currentLibraryGroup && currentLibraryGroup.sort === sort) {
    const back = document.createElement('div');
    back.className = 'library-card';
    back.innerHTML = `<span>Retour aux ${sort === 'tag' ? 'tags' : sort === 'user' ? 'auteurs' : 'dates'}</span><strong>Clique pour revenir</strong>`;
    back.style.cursor = 'pointer';
    back.addEventListener('click', () => {
      currentLibraryGroup = null;
      renderLibrary();
    });
    libraryList.appendChild(back);

    const groupCards = cards.filter(card => {
      if (sort === 'tag') return card.tags.includes(currentLibraryGroup.key);
      if (sort === 'user') return card.user === currentLibraryGroup.key;
      return card.date === currentLibraryGroup.key;
    });

    groupCards.forEach(card => {
      const item = document.createElement('div');
      item.className = 'library-card';
      const editButton = canEditFlashcard(card) ? `<button type="button" class="secondary-button delete-inline-button" data-action="edit-flashcard" data-card-id="${card.id}">Modifier</button>` : '';
      const deleteButton = canDeleteFlashcard(card) ? `<button type="button" class="danger-button delete-inline-button" data-action="delete-flashcard" data-card-id="${card.id}">Supprimer</button>` : '';
      item.innerHTML = `<span>${card.user === state.currentUser ? 'Moi' : 'Autre'} • ${escapeHtml(card.date)}</span>
        <strong>${escapeHtml(card.question)}</strong>
        ${renderFlashcardAnswers(card)}
        <small>${escapeHtml((card.tags || []).join(', '))}</small>
        <p>${escapeHtml(card.explanation)}</p>
        ${editButton}
        ${deleteButton}`;
      libraryList.appendChild(item);
    });
    return;
  }

  if (sort === 'tag' || sort === 'user' || sort === 'date') {
    const groups = new Map();
    cards.forEach(card => {
      if (sort === 'tag') {
        card.tags.forEach(tag => {
          const entry = groups.get(tag) || { key: tag, count: 0 };
          entry.count += 1;
          groups.set(tag, entry);
        });
      } else if (sort === 'user') {
        const key = card.user;
        const entry = groups.get(key) || { key, count: 0 };
        entry.count += 1;
        groups.set(key, entry);
      } else {
        const key = card.date;
        const entry = groups.get(key) || { key, count: 0 };
        entry.count += 1;
        groups.set(key, entry);
      }
    });

    const sortedGroups = [...groups.values()].sort((a, b) => {
      if (sort === 'date') return b.key.localeCompare(a.key);
      const valueA = sort === 'user' ? (a.key === state.currentUser ? 'Moi' : 'Autre') : a.key;
      const valueB = sort === 'user' ? (b.key === state.currentUser ? 'Moi' : 'Autre') : b.key;
      return valueA.localeCompare(valueB, 'fr', { sensitivity: 'base' });
    });

    sortedGroups.forEach(group => {
      const item = document.createElement('div');
      item.className = 'library-card';
      const label = sort === 'user' ? (group.key === state.currentUser ? 'Moi' : 'Autre') : group.key;
      item.innerHTML = `<span>${label}</span><strong>${group.count} flashcard${group.count > 1 ? 's' : ''}</strong>`;
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => {
        currentLibraryGroup = { sort, key: group.key };
        renderLibrary();
      });
      libraryList.appendChild(item);
    });
    return;
  }

  cards.forEach(card => {
    const item = document.createElement('div');
    item.className = 'library-card';
    const editButton = canEditFlashcard(card) ? `<button type="button" class="secondary-button delete-inline-button" data-action="edit-flashcard" data-card-id="${card.id}">Modifier</button>` : '';
    const deleteButton = canDeleteFlashcard(card) ? `<button type="button" class="danger-button delete-inline-button" data-action="delete-flashcard" data-card-id="${card.id}">Supprimer</button>` : '';
    item.innerHTML = `<span>${card.user === state.currentUser ? 'Moi' : 'Autre'} • ${escapeHtml(card.date)}</span>
      <strong>${escapeHtml(card.question)}</strong>
      ${renderFlashcardAnswers(card)}
      <small>${escapeHtml((card.tags || []).join(', '))}</small>
      <p>${escapeHtml(card.explanation)}</p>
      ${editButton}
      ${deleteButton}`;
    libraryList.appendChild(item);
  });
}

function formatDuration(seconds) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

function renderWorkHistory() {
  const user = getUser(state.currentUser);
  const history = user.workHistory || [];
  workHistoryList.innerHTML = '';
  if (history.length === 0) {
    workHistoryList.innerHTML = '<div class="history-item"><span>Aucun travail encore</span></div>';
    return;
  }
  history.forEach(entry => {
    const item = document.createElement('div');
    item.className = 'history-item';
    const target = entry.sentToOther ? "Envoyé à l'autre" : 'Garder pour moi';
    item.innerHTML = `<span>${entry.date} • ${formatDuration(entry.duration)} • ${target}</span>
      <strong>${entry.note || 'Aucune note'}</strong>`;
    workHistoryList.appendChild(item);
  });
}

function updateWorkTimerDisplay() {
  if (!workTimerDisplay) return;
  workTimerDisplay.textContent = formatDuration(workTimerSeconds);
}

function showWorkHistory() {
  workTimerCard.classList.add('hidden');
  workNoteCard.classList.add('hidden');
  renderWorkHistory();
}

function startWorkTimer() {
  if (isWorkTimerRunning) return;
  currentWorkSession = { duration: workTimerSeconds, finished: false };
  workTimerStatus.textContent = 'Compteur actif';
  workTimerStart.classList.add('hidden');
  workTimerPause.classList.remove('hidden');
  isWorkTimerRunning = true;
  workTimerInterval = setInterval(() => {
    workTimerSeconds += 1;
    currentWorkSession.duration = workTimerSeconds;
    updateWorkTimerDisplay();
  }, 1000);
}

function pauseWorkTimer() {
  if (!isWorkTimerRunning) return;
  clearInterval(workTimerInterval);
  workTimerInterval = null;
  isWorkTimerRunning = false;
  workTimerPause.classList.add('hidden');
  workTimerStart.classList.remove('hidden');
  workTimerStatus.textContent = 'En pause';
}

function stopWorkTimer() {
  if (workTimerInterval) clearInterval(workTimerInterval);
  workTimerInterval = null;
  isWorkTimerRunning = false;
  currentWorkSession = currentWorkSession || { duration: workTimerSeconds, finished: false };
  currentWorkSession.duration = workTimerSeconds;
  currentWorkSession.finished = true;
  workTimerStart.classList.remove('hidden');
  workTimerPause.classList.add('hidden');
  workTimerStatus.textContent = workTimerSeconds > 0 ? `Terminé : ${formatDuration(workTimerSeconds)}. Ajoute une note.` : 'Aucun travail enregistré.';
  workNoteCard.classList.remove('hidden');
  workNoteText.value = '';
}

function saveWorkNote(sendToOther) {
  if (!currentWorkSession) {
    currentWorkSession = { duration: workTimerSeconds, finished: true };
  }
  if (!currentWorkSession) return;
  const user = getUser(state.currentUser);
  if (!user.workHistory) user.workHistory = [];
  const note = workNoteText.value.trim();
  const entryTimestamp = new Date().toISOString();
  const entry = {
    id: createEventId('work'),
    date: entryTimestamp,
    createdAt: entryTimestamp,
    updatedAt: entryTimestamp,
    duration: currentWorkSession.duration,
    note,
    sentToOther: sendToOther,
    createdBy: state.currentUser,
    shared: sendToOther
  };
  user.workHistory.unshift(entry);
  if (sendToOther) {
    const other = getUser(getOtherUserId());
    if (!other.workHistory) other.workHistory = [];
    other.workHistory.unshift({
      id: createEventId('work-received'),
      date: entryTimestamp,
      createdAt: entryTimestamp,
      updatedAt: entryTimestamp,
      duration: currentWorkSession.duration,
      note,
      sentFrom: state.currentUser,
      received: true,
      shared: true,
      createdBy: state.currentUser
    });
  }
  saveState();
  currentWorkSession = null;
  workTimerSeconds = 0;
  updateWorkTimerDisplay();
  workTimerCard.classList.add('hidden');
  workNoteCard.classList.add('hidden');
  workTimerStatus.textContent = sendToOther ? 'Note envoyée à l’autre.' : 'Note gardée pour moi.';
  renderWorkHistory();
}

function renderProfile() {
  const userG = getUser('G');
  const userR = getUser('R');
  const displayG = getProfileDisplayStats(userG);
  const displayR = getProfileDisplayStats(userR);
  setText(profileHeadingG, 'G');
  setText(profileHeadingR, 'R');
  setText(myJokers, userG.jokers);
  setText(myTotalCards, displayG.totalCards);
  setText(myWeekCards, displayG.weekCards);
  setText(myTotalTests, displayG.totalTests);
  setText(myTotalQuizzes, displayG.totalQuizzes);
  setText(mySuccessRate, `${displayG.successRate}%`);
  setText(myTotalReading, `${displayG.totalReading} min`);
  setText(otherJokers, userR.jokers);
  setText(otherTotalCards, displayR.totalCards);
  setText(otherWeekCards, displayR.weekCards);
  setText(otherTotalTests, displayR.totalTests);
  setText(otherTotalQuizzes, displayR.totalQuizzes);
  setText(otherSuccessRate, `${displayR.successRate}%`);
  setText(otherTotalReading, `${displayR.totalReading} min`);
  if (adminSyncCard) {
    adminSyncCard.classList.remove('hidden');
  }
  renderSettings();
}

function renderSettings() {
  adminPanel.classList.toggle('hidden', state.currentUser !== 'R');
  if (state.currentUser === 'R') {
    populateAdminInputs();
  }
  if (syncEnabledInput) syncEnabledInput.checked = Boolean(state.sync?.enabled);
  if (syncEndpointInput) syncEndpointInput.value = state.sync?.endpoint || '';
  if (syncTokenInput) syncTokenInput.value = state.sync?.token || '';
  if (syncStatus) {
    if (!state.sync?.enabled) {
      setSyncStatus('Sync désactivée.');
    } else if (!state.sync?.endpoint) {
      setSyncStatus('Ajoute une URL de synchronisation.');
    } else if (!navigator.onLine) {
      setSyncStatus('Hors ligne, sync en attente.');
    } else {
      const lastSynced = state.syncMeta?.lastSyncedAt;
      if (lastSynced) {
        setSyncStatus(`Dernière sync: ${new Date(lastSynced).toLocaleTimeString('fr-FR')}`);
      } else {
        setSyncStatus('Sync activée, en attente du premier envoi.');
      }
    }
  }
}

function getProfileDisplayStats(user) {
  if (!user) {
    return {
      totalCards: 0,
      weekCards: 0,
      totalTests: 0,
      totalQuizzes: 0,
      successRate: 0,
      totalReading: 0
    };
  }
  const baseStats = computeStats(user);
  const readings = user.reading && typeof user.reading === 'object' ? user.reading : {};
  const flashcards = Array.isArray(user.flashcards) ? user.flashcards : [];
  const tests = Array.isArray(user.tests) ? user.tests : [];
  const quizzes = Array.isArray(user.quizzes) ? user.quizzes : [];
  const totalReading = Object.values(readings || {}).reduce((sum, v) => sum + Number(v || 0), 0);
  return {
    totalCards: flashcards.length,
    weekCards: baseStats.weekCards,
    totalTests: tests.length,
    totalQuizzes: quizzes.length,
    successRate: baseStats.successRate,
    totalReading
  };
}

function populateAdminInputs() {
  if (adminStreakJokers) adminStreakJokers.value = state.jokers;
}

function saveAdminChanges() {
  if (state.currentUser !== 'R') return;
  state.jokers = Math.max(0, Number(adminStreakJokers?.value) || 0);
  saveState();
  renderApp();
  showAdminFeedback(`Jokers de streak mis à jour : ${state.jokers}`);
}

function showAdminFeedback(message) {
  if (!adminActionFeedback) return;
  adminActionFeedback.textContent = message;
  adminActionFeedback.classList.remove('hidden');
  clearTimeout(adminFeedbackTimeout);
  adminFeedbackTimeout = setTimeout(() => {
    adminActionFeedback.classList.add('hidden');
  }, 2500);
}

function showProfileStats(userKey) {
  statsTarget = userKey === 'R' ? 'R' : 'G';
  renderStats();
  goToPage('stats', true);
}

function showProfileBadges(userKey) {
  badgesTarget = userKey;
  renderBadges();
  goToPage('badges', true);
}

function computeStats(user) {
  if (!user) return { weekCards: 0, successRate: 0 };
  const weekDays = getLastDays(7);
  const flashcards = Array.isArray(user.flashcards) ? user.flashcards : [];
  const tests = Array.isArray(user.tests) ? user.tests : [];
  const quizzes = Array.isArray(user.quizzes) ? user.quizzes : [];
  const weekCards = flashcards.filter(card => weekDays.includes(card.date)).length;
  const totalTests = tests.length + quizzes.length;
  const successful = tests.filter(t => t.score >= 50).length + quizzes.filter(q => q.correct).length;
  const successRate = totalTests === 0 ? 0 : Math.round((successful / totalTests) * 100);
  return { weekCards, successRate };
}

let statsTarget = null;
let badgesTarget = null;

function getMondayKey(dayKey = getToday()) {
  const [year, month, day] = dayKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const offsetToMonday = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - offsetToMonday);
  return toLocalDateKey(date);
}

function getReadingSecondsForDay(user, dayKey) {
  if (user.readingSeconds && Number.isFinite(user.readingSeconds[dayKey])) {
    return Math.max(0, Number(user.readingSeconds[dayKey]));
  }
  if (user.reading && Number.isFinite(user.reading[dayKey])) {
    return Math.max(0, Number(user.reading[dayKey]) * 60);
  }
  const daily = user.daily?.[dayKey];
  return Math.max(0, Number(daily?.reading || 0) * 60);
}

function formatReadingSeconds(totalSeconds) {
  const safe = Math.max(0, Math.round(totalSeconds || 0));
  const hours = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function getQuestionCreatedDay(question) {
  if (question.createdAt) {
    const date = new Date(question.createdAt);
    if (!Number.isNaN(date.getTime())) return toLocalDateKey(date);
  }
  if (question.id) {
    const manualMatch = String(question.id).match(/^manual-(\d+)$/);
    if (manualMatch) return toLocalDateKey(new Date(Number(manualMatch[1])));
    const importMatch = String(question.id).match(/^import-(\d+)-\d+$/);
    if (importMatch) return toLocalDateKey(new Date(Number(importMatch[1])));
  }
  return null;
}

function getPeriodStats(user, period) {
  const inRange = (dayKey) => {
    if (!dayKey) return false;
    if (!period.start || !period.end) return true;
    return dayKey >= period.start && dayKey <= period.end;
  };

  const readingKeys = new Set([
    ...Object.keys(user.reading || {}),
    ...Object.keys(user.readingSeconds || {})
  ]);
  let readingSeconds = 0;
  readingKeys.forEach(dayKey => {
    if (inRange(dayKey)) readingSeconds += getReadingSecondsForDay(user, dayKey);
  });

  const flashcardsCreated = user.flashcards.filter(card => inRange(card.date)).length;
  const flashcardsTested = user.tests
    .filter(test => inRange(test.date))
    .reduce((sum, test) => sum + (Number(test.count) || 0), 0);

  const quizQuestionsCreated = state.questionBank.filter(question => {
    if (question.createdBy !== user.name) return false;
    const createdDay = getQuestionCreatedDay(question);
    if (!period.start || !period.end) return true;
    return createdDay ? inRange(createdDay) : false;
  }).length;

  const quizQuestionsTested = user.quizzes.filter(quiz => inRange(quiz.date)).length;

  return {
    readingSeconds,
    flashcardsCreated,
    flashcardsTested,
    quizQuestionsCreated,
    quizQuestionsTested
  };
}

function createStatsComparisonCard(title, leftLabel, rightLabel, leftStats, rightStats) {
  const card = document.createElement('div');
  card.className = 'stats-compare-card';
  card.innerHTML = `<h3>${title}</h3>
    <div class="stats-compare-grid stats-compare-head">
      <span>Indicateur</span>
      <strong>${leftLabel}</strong>
      <strong>${rightLabel}</strong>
    </div>
    <div class="stats-compare-grid">
      <span>Temps de lecture</span>
      <strong>${formatReadingSeconds(leftStats.readingSeconds)}</strong>
      <strong>${formatReadingSeconds(rightStats.readingSeconds)}</strong>
    </div>
    <div class="stats-compare-grid">
      <span>Flashcards créées</span>
      <strong>${leftStats.flashcardsCreated}</strong>
      <strong>${rightStats.flashcardsCreated}</strong>
    </div>
    <div class="stats-compare-grid">
      <span>Flashcards testées</span>
      <strong>${leftStats.flashcardsTested}</strong>
      <strong>${rightStats.flashcardsTested}</strong>
    </div>
    <div class="stats-compare-grid">
      <span>Questions quiz créées</span>
      <strong>${leftStats.quizQuestionsCreated}</strong>
      <strong>${rightStats.quizQuestionsCreated}</strong>
    </div>
    <div class="stats-compare-grid">
      <span>Questions quiz testées</span>
      <strong>${leftStats.quizQuestionsTested}</strong>
      <strong>${rightStats.quizQuestionsTested}</strong>
    </div>`;
  return card;
}

function renderStats() {
  const leftUser = getUser('G');
  const rightUser = getUser('R');
  document.querySelector('#page-stats h2').textContent = `Statistiques ${leftUser.name} vs ${rightUser.name}`;
  setStatsTargetHint(leftUser, rightUser);
  statsCharts.innerHTML = '';

  const today = getToday();
  const monday = getMondayKey(today);

  const periods = [
    { title: `Aujourd'hui (${today})`, start: today, end: today },
    { title: `Depuis lundi (${monday} → ${today})`, start: monday, end: today },
    { title: 'All time', start: null, end: null }
  ];

  periods.forEach(period => {
    const leftStats = getPeriodStats(leftUser, period);
    const rightStats = getPeriodStats(rightUser, period);
    statsCharts.appendChild(
      createStatsComparisonCard(period.title, leftUser.name, rightUser.name, leftStats, rightStats)
    );
  });
}

function setStatsTargetHint(leftUser, rightUser) {
  if (!statsTargetHint) return;
  statsTargetHint.textContent = `Comparaison en cours : ${leftUser.name} et ${rightUser.name}.`;
  statsTargetHint.classList.remove('hidden');
}

function renderChapters() {
  const chapters = getTrackedChapters();
  chapterProgress.innerHTML = '';
  if (chapters.length === 0) {
    chapterProgress.innerHTML = '<div class="chapter-item"><span>Aucun chapitre suivi pour l’instant</span><strong>Ajoute des cartes ou des quiz</strong></div>';
    return;
  }
  chapters.forEach(name => {
    const progress = computeChapterProgress(name);
    const item = document.createElement('div');
    item.className = 'chapter-item';
    item.innerHTML = `<span>${escapeHtml(name)}</span><strong>${progress}% de progression</strong>`;
    chapterProgress.appendChild(item);
  });
}

function getTrackedChapters() {
  const chapters = new Set();
  ['G', 'R'].forEach(userId => {
    const user = getUser(userId);
    (user.flashcards || []).forEach(card => {
      (card.tags || []).forEach(tag => {
        if (tag) chapters.add(tag);
      });
    });
    (user.quizzes || []).forEach(quiz => {
      if (quiz.chapter) chapters.add(quiz.chapter);
    });
  });
  (state.questionBank || []).forEach(question => {
    if (question.chapter) chapters.add(question.chapter);
  });
  return [...chapters].sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
}

function computeChapterProgress(chapter) {
  let totalCards = 0;
  let masteredCards = 0;
  let quizAttempts = 0;
  let quizCorrect = 0;

  ['G', 'R'].forEach(userId => {
    const user = getUser(userId);
    (user.flashcards || []).forEach(card => {
      if (!(card.tags || []).includes(chapter)) return;
      totalCards += 1;
      const mastery = getFlashcardMastery(card);
      if (mastery === 'maitrise') masteredCards += 1;
      else if (mastery === 'moyen+') masteredCards += 0.75;
      else if (mastery === 'moyen-') masteredCards += 0.4;
    });
    (user.quizzes || []).forEach(quiz => {
      if (quiz.chapter !== chapter) return;
      quizAttempts += 1;
      if (quiz.correct) quizCorrect += 1;
    });
  });

  const cardScore = totalCards ? Math.round((masteredCards / totalCards) * 100) : 0;
  const quizScore = quizAttempts ? Math.round((quizCorrect / quizAttempts) * 100) : 0;
  if (totalCards && quizAttempts) return Math.round((cardScore + quizScore) / 2);
  return totalCards ? cardScore : quizScore;
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
  const scoreUser = sumWorkLast7(user) + sumLast7(user.reading) + user.flashcards.filter(card => getLastDays(7).includes(card.date)).length * 3 + (user.tests.filter(test => getLastDays(7).includes(test.date)).length + user.quizzes.filter(quiz => getLastDays(7).includes(quiz.date)).length) * 4;
  const scoreOther = sumWorkLast7(other) + sumLast7(other.reading) + other.flashcards.filter(card => getLastDays(7).includes(card.date)).length * 3 + (other.tests.filter(test => getLastDays(7).includes(test.date)).length + other.quizzes.filter(quiz => getLastDays(7).includes(quiz.date)).length) * 4;
  if (scoreUser === scoreOther) return 'Match nul';
  return scoreUser > scoreOther ? 'Toi' : 'Autre personne';
}

function getLastDays(count) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - index);
    return toLocalDateKey(date);
  });
}

function updateTimerDisplay() {
  const minutes = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
  const seconds = String(timerSeconds % 60).padStart(2, '0');
  timerDisplay.textContent = `${minutes}:${seconds}`;
  if (timerStart && !isTimerRunning) {
    timerStart.textContent = timerSeconds > 0 ? 'Reprendre' : 'Démarrer';
  }
}

function startTimer() {
  if (isTimerRunning) return;
  isTimerRunning = true;
  timerStart.textContent = 'Démarrer';
  timerStart.classList.add('hidden');
  timerPause.classList.remove('hidden');
  timerStatus.textContent = timerSeconds > 0 ? 'Lecture reprise...' : 'Lecture en cours...';
  timerInterval = setInterval(() => {
    timerSeconds += 1;
    updateTimerDisplay();
  }, 1000);
}

function pauseTimer() {
  isTimerRunning = false;
  timerStart.classList.remove('hidden');
  timerPause.classList.add('hidden');
  timerStart.textContent = timerSeconds > 0 ? 'Reprendre' : 'Démarrer';
  timerStatus.textContent = 'Lecture en pause. Termine pour enregistrer.';
  clearInterval(timerInterval);
}

function stopTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
  const elapsedSeconds = timerSeconds;
  timerSeconds = 0;
  isTimerRunning = false;
  timerStart.classList.remove('hidden');
  timerPause.classList.add('hidden');
  timerStart.textContent = 'Démarrer';
  updateTimerDisplay();

  if (elapsedSeconds > 0) {
    addReadingSeconds(elapsedSeconds);
    timerStatus.textContent = `Ajouté ${formatReadingSeconds(elapsedSeconds)} de lecture.`;
  } else {
    timerStatus.textContent = 'Aucun temps à ajouter.';
  }
}

function addReading(minutes) {
  addReadingSeconds((Number(minutes) || 0) * 60);
}

function addReadingSeconds(seconds) {
  const roundedSeconds = Math.max(0, Math.round(seconds));
  if (!roundedSeconds) return;
  const user = getUser(state.currentUser);
  const daily = getDaily(user);
  if (!user.readingSeconds) user.readingSeconds = {};
  user.readingSeconds[getToday()] = (Number(user.readingSeconds[getToday()]) || 0) + roundedSeconds;
  daily.reading = Math.ceil(user.readingSeconds[getToday()] / 60);
  user.reading[getToday()] = daily.reading;
  tryCompleteDay(user);
  saveState();
  if (isSyncConfigured() && navigator.onLine) syncNow(false);
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
  const answer = cardAnswer ? cardAnswer.value.trim() : '';
  const tags = cardTags.value.split(',').map(tag => tag.trim()).filter(Boolean);
  const explanation = cardExplanation.value.trim();
  const note = cardNote.value.trim();
  if (!question || !answer || tags.length === 0 || !explanation) {
    alert('Remplis la question, la réponse complète, ajoute un tag et une explication.');
    return;
  }
  const cardData = {
    question,
    answer,
    tags,
    explanation,
    note,
    mastery: 'non-maitrise',
    user: state.currentUser
  };
  if (editingFlashcardId) {
    updateFlashcard(editingFlashcardId, cardData);
    return;
  }
  const creator = state.currentUser;
  const user = getUser(state.currentUser);
  const newCard = {
    id: `${state.currentUser}-${Date.now()}`,
    user: state.currentUser,
    date: getToday(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    question,
    answer,
    tags,
    explanation,
    note,
    mastery: 'non-maitrise',
    reviews: [],
    seenBy: [creator]
  };
  user.flashcards.push(newCard);
  const daily = getDaily(user);
  daily.cards = user.flashcards.filter(card => card.date === getToday()).length;
  tryCompleteDay(user);
  saveState();
  if (isSyncConfigured() && navigator.onLine) syncNow(false);
  resetFlashcardForm();
  renderApp();
}

function resetFlashcardForm() {
  editingFlashcardId = null;
  cardQuestion.value = '';
  if (cardAnswer) cardAnswer.value = '';
  cardTags.value = '';
  cardExplanation.value = '';
  cardNote.value = '';
  saveCardBtn.textContent = 'Enregistrer la carte';
  if (flashcardTargetHint) flashcardTargetHint.classList.add('hidden');
}

function resetQuizCreateForm() {
  if (quizCreateChapter) quizCreateChapter.value = '';
  if (quizCreateTheme) quizCreateTheme.value = '';
  if (quizCreateQuestion) quizCreateQuestion.value = '';
  if (quizCreateExplanation) quizCreateExplanation.value = '';
  if (quizCreateOptionsList) {
    quizCreateOptionsList.innerHTML = '';
    addQuizCreateOption();
    addQuizCreateOption();
  }
}

function ensureQuizCreateOptions() {
  if (!quizCreateOptionsList) return;
  if (quizCreateOptionsList.querySelectorAll('.quiz-create-option-row').length === 0) {
    addQuizCreateOption();
    addQuizCreateOption();
  }
}

function addQuizCreateOption(value = '', checked = false) {
  if (!quizCreateOptionsList) return;
  const idx = quizCreateOptionsList.querySelectorAll('.quiz-create-option-row').length;
  const row = document.createElement('div');
  row.className = 'quiz-create-option-row';
  row.innerHTML = `
    <input type="checkbox" class="quiz-create-option-correct" ${checked ? 'checked' : ''} aria-label="Bonne réponse" />
    <input type="text" class="quiz-create-option-input" placeholder="Proposition ${idx + 1}" value="${escapeHtml(value)}" />
    <button type="button" class="secondary-button quiz-create-option-remove">Supprimer</button>
  `;
  quizCreateOptionsList.appendChild(row);
  const removeBtn = row.querySelector('.quiz-create-option-remove');
  removeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    row.remove();
  });
}

function createQuizQuestion() {
  if (!quizCreateQuestion || !quizCreateOptionsList) return;
  const chapter = (quizCreateChapter?.value || '').trim() || 'Quiz';
  const theme = (quizCreateTheme?.value || '').trim() || 'Création manuelle';
  const question = quizCreateQuestion.value.trim();
  const explanation = (quizCreateExplanation?.value || '').trim();
  // collect options from rows
  const rows = Array.from(quizCreateOptionsList.querySelectorAll('.quiz-create-option-row'));
  const options = [];
  const correctIndices = [];
  rows.forEach((row, idx) => {
    const input = row.querySelector('.quiz-create-option-input');
    const chk = row.querySelector('.quiz-create-option-correct');
    const val = input?.value.trim();
    if (!val) return;
    options.push(val);
    if (chk?.checked) correctIndices.push(options.length - 1);
  });

  if (!question || options.length < 2 || correctIndices.length === 0) {
    alert('Ajoute une question, au moins 2 options et au moins une bonne réponse.');
    return;
  }

  state.questionBank.push({
    id: `manual-${Date.now()}`,
    chapter,
    theme,
    question,
    options,
    correctAnswers: correctIndices,
    explanation,
    source: 'Manuel',
    createdBy: state.currentUser,
    createdAt: new Date().toISOString()
  });
  saveState();
  if (isSyncConfigured() && navigator.onLine) syncNow(false);
  renderQuizStatus();
  resetQuizCreateForm();
  if (quizCreateStatus) {
    quizCreateStatus.textContent = 'Question enregistrée.';
  }
}

function populateTagFilter() {
  const tagFilterSelect = document.getElementById('review-tag-filter');
  if (!tagFilterSelect) return;
  
  const allCards = [
    ...getUser(state.currentUser).flashcards,
    ...getUser(getOtherUserId()).flashcards
  ];
  
  const tags = new Set();
  allCards.forEach(card => {
    (card.tags || []).forEach(tag => tags.add(tag));
  });
  
  const sortedTags = Array.from(tags).sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
  
  tagFilterSelect.innerHTML = '<option value="">Tous les chapitres</option>';
  sortedTags.forEach(tag => {
    const option = document.createElement('option');
    option.value = tag;
    option.textContent = tag;
    tagFilterSelect.appendChild(option);
  });
}

function buildFlashcardReviewPool(options = {}) {
  const { todayOnly = false, selectedTag = '', otherUnseenOnly = false } = options;
  const current = getUser(state.currentUser);
  const other = getUser(getOtherUserId());
  const sourceCards = otherUnseenOnly
    ? (other.flashcards || []).filter(card => !(card.seenBy || []).includes(state.currentUser))
    : [...(current.flashcards || []), ...(other.flashcards || [])];
  const filteredCards = sourceCards.filter(card => {
    if (todayOnly && card.date !== getToday()) return false;
    if (selectedTag && !(card.tags || []).includes(selectedTag)) return false;
    return true;
  });
  return filteredCards.map(normalizeFlashcard).filter(Boolean);
}

function startFlashcardReview(cards, mode = 'review') {
  const count = parseInt(reviewCount.value, 10) || 10;
  reviewQueue = mode === 'other-unseen'
    ? cards.map(normalizeFlashcard).filter(Boolean)
    : sampleWeightedFlashcards(cards, count);
  if (reviewQueue.length === 0) {
    alert('Aucune carte disponible pour ce test. Crée des flashcards d’abord.');
    return;
  }
  reviewIndex = 0;
  reviewCorrect = 0;
  reviewRevealMode = false;
  reviewSessionMode = mode;
  state.viewingOtherUnseen = false;
  reviewCard.classList.remove('hidden');
  reviewSummary.classList.add('hidden');
  reviewAnswer.classList.remove('hidden');
  showAnswer.classList.remove('hidden');
  showAnswer.disabled = false;
  showAnswer.textContent = 'Voir la réponse';
  [easyBtn, mediumBtn, hardBtn, notMasteredBtn].forEach(btn => btn?.classList.add('hidden'));
  renderReviewCard();
}

function startReviewSession() {
  const todayOnly = document.getElementById('review-today-only')?.checked ?? false;
  const selectedTag = document.getElementById('review-tag-filter')?.value ?? '';
  const pool = buildFlashcardReviewPool({ todayOnly, selectedTag });
  startFlashcardReview(pool, 'review');
}

function renderReviewCard() {
  if (reviewIndex >= reviewQueue.length) {
    finishReviewSession();
    return;
  }
  const card = reviewQueue[reviewIndex];
  const answerText = getFlashcardAnswerText(card);
  reviewProgress.textContent = `Carte ${reviewIndex + 1} / ${reviewQueue.length}`;
  reviewQuestion.textContent = card.question;
  reviewAnswer.innerHTML = reviewRevealMode
    ? `<div class="flashcard-answer-reveal">
        <div class="flashcard-answer-text">${escapeHtml(answerText || 'Aucune réponse renseignée.')}</div>
        <div class="flashcard-explanation">${escapeHtml(card.explanation || 'Aucune explication fournie.')}</div>
      </div>`
    : '<div class="flashcard-answer-prompt">Clique sur Voir la réponse.</div>';
  reviewAnswer.classList.remove('hidden');
  showAnswer.classList.toggle('hidden', reviewRevealMode);
  [easyBtn, mediumBtn, hardBtn, notMasteredBtn].forEach(btn => btn?.classList.toggle('hidden', !reviewRevealMode));
  if (easyBtn) easyBtn.textContent = 'Maîtrisé';
  if (mediumBtn) mediumBtn.textContent = 'Moyen +';
  if (hardBtn) hardBtn.textContent = 'Moyen -';
  if (notMasteredBtn) notMasteredBtn.textContent = 'Non maîtrisé';
}

function revealReviewAnswer() {
  reviewRevealMode = true;
  renderReviewCard();
}

function gradeReviewAnswer(selectedMastery) {
  const card = reviewQueue[reviewIndex];
  const original = findFlashcardById(card.id)?.card || card;
  if (!original.reviews) original.reviews = [];
  original.reviews.push({
    date: getToday(),
    mastery: selectedMastery
  });
  setFlashcardMastery(original, selectedMastery);
  if (reviewSessionMode === 'other-unseen') {
    if (!original.seenBy) original.seenBy = [];
    if (!original.seenBy.includes(state.currentUser)) original.seenBy.push(state.currentUser);
  }
  Object.assign(card, normalizeFlashcard(original));
  if (selectedMastery === 'maitrise') reviewCorrect += 1;
  reviewIndex += 1;
  reviewRevealMode = false;
  saveState();
  renderReviewCard();
}

function finishReviewSession() {
  reviewCard.classList.add('hidden');
  reviewSummary.classList.remove('hidden');
  if (reviewSessionMode === 'other-unseen') {
    reviewQueue.forEach(card => {
      const original = findFlashcardById(card.id)?.card;
      if (!original) return;
      if (!original.seenBy) original.seenBy = [];
      if (!original.seenBy.includes(state.currentUser)) original.seenBy.push(state.currentUser);
    });
  }
  const mastered = reviewCorrect;
  reviewResults.textContent = reviewSessionMode === 'other-unseen'
    ? `Cartes vues: ${reviewQueue.length}.`
    : `Tu as classé ${mastered} carte(s) comme maîtrisées sur ${reviewQueue.length}.`;
  const user = getUser(state.currentUser);
  const reviewTimestamp = new Date().toISOString();
  user.tests.push({
    id: createEventId('test'),
    date: getToday(),
    createdAt: reviewTimestamp,
    updatedAt: reviewTimestamp,
    count: reviewQueue.length,
    correct: reviewCorrect,
    score: Math.round((reviewCorrect / reviewQueue.length) * 100),
    mode: reviewSessionMode
  });
  const daily = getDaily(user);
  daily.tested = user.tests.filter(test => test.date === getToday()).length;
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

function showIBAnnales() {
  importAnnalesInput.click();
}

function renderQuizRunCard() {
  if (!quizState) return;
  const question = quizState.questions[quizState.index];
  const correctIndices = Array.isArray(question.correctAnswers) && question.correctAnswers.length > 0
    ? question.correctAnswers
    : (question.answer ? [question.options.indexOf(question.answer)] : []);
  const correctCount = Math.max(1, correctIndices.filter(index => index >= 0).length);
  quizMeta.textContent = `Question ${quizState.index + 1} / ${quizState.questions.length}`;
  quizQuestion.textContent = question.question;
  const answerLabel = correctCount === 1 ? '1 bonne réponse' : `${correctCount} bonnes réponses`;
  quizMeta.textContent = `Question ${quizState.index + 1} / ${quizState.questions.length} • ${answerLabel}`;
  quizOptions.innerHTML = '';
  const multi = correctIndices.length > 1;
  question.options.forEach((option, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-button';
    btn.type = 'button';
    btn.dataset.index = String(idx);
    btn.textContent = option;
    btn.addEventListener('click', () => selectQuizOption(btn, idx, multi));
    quizOptions.appendChild(btn);
  });
  quizState.selected = multi ? new Set() : null;
  validateQuiz.disabled = false;
  quizSummary.classList.add('hidden');
  quizProgressFill.style.width = `${(quizState.index / quizState.questions.length) * 100}%`;
  quizProgressLabel.textContent = `${quizState.index + 1} / ${quizState.questions.length}`;
}

function selectQuizOption(btn, idx, multi) {
  if (!quizState) return;
  if (multi) {
    if (!quizState.selected) quizState.selected = new Set();
    if (quizState.selected.has(idx)) {
      quizState.selected.delete(idx);
      btn.classList.remove('selected');
    } else {
      quizState.selected.add(idx);
      btn.classList.add('selected');
    }
  } else {
    // single select
    // clear previous
    Array.from(quizOptions.querySelectorAll('.option-button')).forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    quizState.selected = idx;
  }
}

function validateQuizAnswer() {
  if (!quizState || quizState.selected == null || (quizState.selected instanceof Set && quizState.selected.size === 0)) {
    alert('Choisis une réponse.');
    return;
  }
  const question = quizState.questions[quizState.index];
  const correctIndices = Array.isArray(question.correctAnswers) ? question.correctAnswers : (question.answer ? [question.options.indexOf(question.answer)] : []);
  let selectedIndices = [];
  if (quizState.selected instanceof Set) selectedIndices = Array.from(quizState.selected);
  else selectedIndices = [quizState.selected];

  const setsEqual = (a, b) => a.length === b.length && a.every(v => b.includes(v));
  const isCorrect = setsEqual([...selectedIndices].sort((x,y)=>x-y), [...correctIndices].sort((x,y)=>x-y));

  const user = getUser(state.currentUser);
  const quizTimestamp = new Date().toISOString();
  user.quizzes.push({
    id: createEventId('quiz'),
    date: getToday(),
    createdAt: quizTimestamp,
    updatedAt: quizTimestamp,
    questionId: question.id,
    correct: isCorrect,
    score: isCorrect ? 100 : 0,
    chapter: question.chapter
  });
  const daily = getDaily(user);
  daily.tested = user.tests.filter(test => test.date === getToday()).length + user.quizzes.filter(quiz => quiz.date === getToday()).length;
  tryCompleteDay(user);
  if (isCorrect) {
    quizState.correct += 1;
    saveState();
    // advance immediately
    quizState.index += 1;
    if (quizState.index < quizState.questions.length) {
      renderQuizRunCard();
      return;
    }
    showQuizSummary();
    return;
  }

  // incorrect -> show explanation and correct answers, require user to click 'Suivant'
  saveState();
  validateQuiz.disabled = true;
  // highlight correct options
  Array.from(quizOptions.querySelectorAll('.option-button')).forEach(btn => {
    const idx = Number(btn.dataset.index);
    if (correctIndices.includes(idx)) btn.classList.add('correct');
    else if ((quizState.selected instanceof Set && quizState.selected.has(idx)) || quizState.selected === idx) btn.classList.add('chosen-wrong');
    btn.disabled = true;
  });
  // show explanation + next button
  const explanationDiv = document.createElement('div');
  explanationDiv.className = 'quiz-explanation';
  explanationDiv.innerHTML = `<p>${escapeHtml(question.explanation || 'Explication non fournie.')}</p>`;
  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'primary-button';
  nextBtn.textContent = 'Suivant';
  nextBtn.addEventListener('click', () => {
    // cleanup
    explanationDiv.remove();
    quizState.index += 1;
    if (quizState.index < quizState.questions.length) renderQuizRunCard();
    else showQuizSummary();
  });
  explanationDiv.appendChild(nextBtn);
  quizOptions.parentNode.appendChild(explanationDiv);
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
  renderApp();
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
          state.questionBank.push({
            id: `import-${Date.now()}-${index}`,
            chapter: item.chapter || 'IBO',
            theme: item.theme || 'Annales',
            question: item.question,
            options: item.options,
            answer: item.answer,
            source: 'Annales',
            createdBy: item.createdBy || state.currentUser,
            createdAt: item.createdAt || new Date().toISOString()
          });
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

function getVisibleQuizQuestions() {
  const filterMode = quizQuestionFilter?.value || 'mine';
  const searchText = quizQuestionSearch?.value.trim().toLowerCase() || '';
  return state.questionBank.filter(question => {
    const owner = question.createdBy || '';
    const matchesScope = filterMode === 'all'
      ? true
      : (owner === state.currentUser || (!owner && question.source === 'Annales'));
    if (!matchesScope) return false;
    if (!searchText) return true;
    const answersText = (question.answer || (Array.isArray(question.correctAnswers) ? question.correctAnswers.map(i => question.options?.[i]).join(' ') : '') || '');
    return [question.question, question.chapter, question.theme, answersText]
      .filter(Boolean)
      .some(text => String(text).toLowerCase().includes(searchText));
  });
}

function renderQuizQuestionManager() {
  if (!quizQuestionList) return;
  const questions = getVisibleQuizQuestions();
  quizQuestionList.innerHTML = '';
  if (questions.length === 0) {
    quizQuestionList.innerHTML = '<div class="history-item"><span>Aucune question à afficher.</span></div>';
    return;
  }
  questions
    .slice()
    .reverse()
    .forEach(question => {
      const item = document.createElement('div');
      item.className = 'history-item';
      const owner = question.createdBy ? ` • ${question.createdBy}` : '';
      const deleteButton = canDeleteQuizQuestion(question)
        ? `<button type="button" class="danger-button delete-inline-button" data-action="delete-quiz-question" data-question-id="${question.id}">Supprimer</button>`
        : '';
      item.innerHTML = `<span>${question.chapter || 'IBO'} • ${question.theme || 'Annales'}${owner}</span>
        <strong>${question.question}</strong>
        ${deleteButton}`;
      quizQuestionList.appendChild(item);
    });
}

function deleteQuizQuestionById(questionId) {
  const index = state.questionBank.findIndex(question => question.id === questionId);
  if (index === -1) return;
  const question = state.questionBank[index];
  if (!canDeleteQuizQuestion(question)) {
    alert('Tu ne peux pas supprimer cette question.');
    return;
  }
  markDeleted('questionBank', questionId);
  state.questionBank.splice(index, 1);
  saveState();
  if (isSyncConfigured() && navigator.onLine) syncNow(false);
  renderQuizStatus();
}

function deleteFlashcardById(cardId) {
  const users = [getUser('G'), getUser('R')];
  for (const user of users) {
    const index = user.flashcards.findIndex(card => card.id === cardId);
    if (index === -1) continue;
    const card = user.flashcards[index];
    if (!canDeleteFlashcard(card)) {
      alert('Tu ne peux pas supprimer cette flashcard.');
      return;
    }
    const confirmed = confirm(`Supprimer la carte "${card.question}" ?`);
    if (!confirmed) return;
    markDeleted('flashcards', cardId);
    user.flashcards.splice(index, 1);
    if (editingFlashcardId === cardId) resetFlashcardForm();
    const daily = getDaily(user);
    daily.cards = user.flashcards.filter(entry => entry.date === getToday()).length;
    saveState();
    if (isSyncConfigured() && navigator.onLine) syncNow(false);
    renderApp();
    return;
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
  const correctIndices = Array.isArray(question.correctAnswers) && question.correctAnswers.length > 0
    ? question.correctAnswers
    : (question.answer ? [question.options.indexOf(question.answer)] : []);
  const answerLabel = Math.max(1, correctIndices.filter(index => index >= 0).length) === 1 ? '1 bonne réponse' : `${correctIndices.filter(index => index >= 0).length} bonnes réponses`;
  monthlyMeta.textContent = `${question.chapter} • ${question.theme} • ${answerLabel}`;
  monthlyQuestion.textContent = question.question;
  monthlyOptions.innerHTML = '';
  question.options.forEach((option, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.index = String(idx);
    btn.textContent = option;
    btn.addEventListener('click', () => selectMonthlyOption(btn, idx, correctIndices.length > 1));
    monthlyOptions.appendChild(btn);
  });
}

function selectMonthlyOption(button, idx, multi) {
  if (!monthlyState) return;
  if (multi) {
    if (!monthlyState.selected || !(monthlyState.selected instanceof Set)) monthlyState.selected = new Set();
    if (monthlyState.selected.has(idx)) {
      monthlyState.selected.delete(idx);
      button.classList.remove('active');
    } else {
      monthlyState.selected.add(idx);
      button.classList.add('active');
    }
    return;
  }
  monthlyState.selected = idx;
  Array.from(monthlyOptions.children).forEach(btn => btn.classList.toggle('active', btn === button));
}

function validateMonthlyAnswer() {
  if (!monthlyState || monthlyState.selected == null || (monthlyState.selected instanceof Set && monthlyState.selected.size === 0)) return alert('Choisis une réponse.');
  const question = monthlyState.questions[monthlyState.index];
  const correctIndices = Array.isArray(question.correctAnswers) && question.correctAnswers.length > 0
    ? question.correctAnswers
    : (question.answer ? [question.options.indexOf(question.answer)] : []);
  const selectedIndices = monthlyState.selected instanceof Set ? Array.from(monthlyState.selected) : [monthlyState.selected];
  const normalizedSelected = selectedIndices.filter(index => index >= 0).sort((a, b) => a - b);
  const normalizedCorrect = correctIndices.filter(index => index >= 0).sort((a, b) => a - b);
  const correct = normalizedSelected.length === normalizedCorrect.length && normalizedSelected.every((value, index) => value === normalizedCorrect[index]);
  if (correct) monthlyState.correct += 1;
  Array.from(monthlyOptions.children).forEach(btn => {
    const idx = Number(btn.dataset.index);
    btn.classList.toggle('correct', normalizedCorrect.includes(idx));
    if (normalizedSelected.includes(idx) && !normalizedCorrect.includes(idx)) btn.classList.add('wrong');
    btn.disabled = true;
  });
  if (!correct) {
    const explanationDiv = document.createElement('div');
    explanationDiv.className = 'quiz-explanation';
    explanationDiv.innerHTML = `<p>${escapeHtml(question.explanation || 'Explication non fournie.')}</p>`;
    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'primary-button';
    nextBtn.textContent = 'Suivant';
    nextBtn.addEventListener('click', () => {
      explanationDiv.remove();
      monthlyState.index += 1;
      renderMonthlyQuestion();
    });
    explanationDiv.appendChild(nextBtn);
    monthlyOptions.parentNode.appendChild(explanationDiv);
    return;
  }
  monthlyState.index += 1;
  renderMonthlyQuestion();
}

function finishMonthlyTest() {
  monthlyCard.classList.add('hidden');
  monthlySummary.classList.remove('hidden');
  const score = Math.round((monthlyState.correct / monthlyState.questions.length) * 100);
  monthlyResults.textContent = `Score mensuel : ${score}% (${monthlyState.correct}/${monthlyState.questions.length}).`;
  const user = getUser(state.currentUser);
  const monthlyTimestamp = new Date().toISOString();
  user.monthlyTests.push({
    id: createEventId('monthly'),
    date: getToday(),
    createdAt: monthlyTimestamp,
    updatedAt: monthlyTimestamp,
    score,
    total: monthlyState.questions.length
  });
  saveState();
  monthlyState = null;
  renderApp();
}

function finishMonthlyReview() {
  monthlySummary.classList.add('hidden');
  renderApp();
}

function buildResetState(options = {}) {
  const nextState = JSON.parse(JSON.stringify(defaultState));
  nextState.currentUser = state.currentUser;
  nextState.theme = state.theme;
  nextState.sync = JSON.parse(JSON.stringify(state.sync || defaultState.sync));
  nextState.syncMeta.lastSyncedAt = options.keepLastSyncedAt ? Number(state.syncMeta?.lastSyncedAt) || 0 : 0;
  nextState.syncMeta.resetEpoch = Number(options.resetEpoch) || 0;
  nextState.syncMeta.globalUpdatedAt = Number(options.globalUpdatedAt) || 0;
  nextState.lastUpdate = getDayKeyFor();
  nextState.lastMonth = getDayKeyFor().slice(0, 7);
  return nextState;
}

async function resetLocalData() {
  if (!confirm('Réinitialiser uniquement cet appareil ?')) return;
  const nextState = buildResetState({ keepLastSyncedAt: false, resetEpoch: Number(state.syncMeta?.resetEpoch) || 0 });
  replaceState(nextState);
  saveState({ skipTouch: true, skipSync: true });
  renderApp();
  if (isSyncConfigured() && navigator.onLine) {
    await syncNow(true);
  }
  window.location.reload();
}

async function resetGlobalData() {
  if (!confirm('Réinitialiser toutes les données sur tous les appareils synchronisés ?')) return;
  if (!isSyncConfigured() || !navigator.onLine) {
    setSyncStatus('Impossible de réinitialiser partout : connecte cet appareil et active la sync.');
    return;
  }
  setSyncStatus('Réinitialisation globale en cours...');
  try {
    const maxAttempts = 6;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const remote = await pullRemoteDoc(true);
      const remoteEpoch = Number(remote.doc?.meta?.resetEpoch) || 0;
      const localEpoch = Number(state.syncMeta?.resetEpoch) || 0;
      const resetEpoch = Math.max(Date.now(), remoteEpoch + 1, localEpoch + 1);
      const nextState = buildResetState({ keepLastSyncedAt: false, resetEpoch, globalUpdatedAt: resetEpoch });
      replaceState(nextState);
      const resetDoc = buildSyncDocument();
      const result = await pushRemoteDoc(resetDoc, remote.etag);
      if (result.conflict) continue;
      applySyncDoc(resetDoc);
      state.syncMeta.lastSyncedAt = Date.now();
      saveState({ skipTouch: true, skipSync: true });
      renderApp();
      setSyncStatus('Réinitialisation globale confirmée.');
      window.location.reload();
      return;
    }
    throw new Error('conflit de synchronisation persistant');
  } catch (error) {
    setSyncStatus(`Erreur reset global: ${error.message}`);
  }
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
    btn.addEventListener('click', (event) => {
      const action = btn.dataset.action;
      if (action === 'view-other-unseen') {
        event.preventDefault();
        startViewingOtherUnseen();
        return;
      }
      goToPage(btn.dataset.nav);
    });
  });
  showIbAnnales.addEventListener('click', showIBAnnales);
  monthlyQuickButton.addEventListener('click', startMonthlyTest);
  importAnnalesInput.addEventListener('change', () => {
    if (importAnnalesInput.files.length) importAnnales();
  });
  if (saveAdminSettings) saveAdminSettings.addEventListener('click', saveAdminChanges);
  viewMyStats.addEventListener('click', () => showProfileStats('G'));
  viewMyBadges.addEventListener('click', () => showProfileBadges('G'));
  viewOtherStats.addEventListener('click', () => showProfileStats('R'));
  viewOtherBadges.addEventListener('click', () => showProfileBadges('R'));
  timerStart.addEventListener('click', startTimer);
  timerPause.addEventListener('click', pauseTimer);
  timerStop.addEventListener('click', stopTimer);
  setMinutes.addEventListener('click', addManualReading);
  if (readingHistory) readingHistory.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const dayKey = button.dataset.day;
    if (!dayKey) return;
    event.preventDefault();
    if (button.dataset.action === 'edit-reading') {
      editReadingEntry(dayKey);
    }
    if (button.dataset.action === 'delete-reading') {
      deleteReadingEntry(dayKey);
    }
  });
  saveCardBtn.addEventListener('click', addFlashcard);
  clearCardBtn.addEventListener('click', resetFlashcardForm);
  if (quizCreateAddOption) quizCreateAddOption.addEventListener('click', (event) => {
    event.preventDefault();
    addQuizCreateOption();
  });
  librarySearch.addEventListener('input', () => {
    currentLibraryGroup = null;
    renderLibrary();
  });
  librarySort.addEventListener('change', () => {
    currentLibraryGroup = null;
    renderLibrary();
  });
  if (todayCardsList) todayCardsList.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    event.preventDefault();
    if (button.dataset.action === 'edit-flashcard') startEditFlashcard(button.dataset.cardId);
    if (button.dataset.action === 'delete-flashcard') deleteFlashcardById(button.dataset.cardId);
  });
  if (libraryList) libraryList.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    event.preventDefault();
    if (button.dataset.action === 'edit-flashcard') startEditFlashcard(button.dataset.cardId);
    if (button.dataset.action === 'delete-flashcard') deleteFlashcardById(button.dataset.cardId);
  });
  if (quizQuestionFilter) {
    quizQuestionFilter.addEventListener('change', () => {
      renderQuizQuestionManager();
    });
  }
  if (quizQuestionSearch) {
    quizQuestionSearch.addEventListener('input', () => {
      renderQuizQuestionManager();
    });
  }
  if (quizCreateSave) {
    quizCreateSave.addEventListener('click', (event) => {
      event.preventDefault();
      createQuizQuestion();
    });
  }
  if (quizCreateClear) {
    quizCreateClear.addEventListener('click', (event) => {
      event.preventDefault();
      resetQuizCreateForm();
      if (quizCreateStatus) quizCreateStatus.textContent = '';
    });
  }
  if (showAnswer) showAnswer.addEventListener('click', (event) => {
    event.preventDefault();
    revealReviewAnswer();
  });
  if (easyBtn) easyBtn.addEventListener('click', (event) => {
    event.preventDefault();
    gradeReviewAnswer('maitrise');
  });
  if (mediumBtn) mediumBtn.addEventListener('click', (event) => {
    event.preventDefault();
    gradeReviewAnswer('moyen+');
  });
  if (hardBtn) hardBtn.addEventListener('click', (event) => {
    event.preventDefault();
    gradeReviewAnswer('moyen-');
  });
  if (notMasteredBtn) notMasteredBtn.addEventListener('click', (event) => {
    event.preventDefault();
    gradeReviewAnswer('non-maitrise');
  });
  [quizCreateChapter, quizCreateTheme, quizCreateQuestion, quizCreateExplanation].forEach(input => {
    if (!input) return;
    input.addEventListener('input', () => {
      if (quizCreateStatus) quizCreateStatus.textContent = '';
    });
  });
  if (quizQuestionList) quizQuestionList.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action="delete-quiz-question"]');
    if (!button) return;
    event.preventDefault();
    const questionId = button.dataset.questionId;
    const question = state.questionBank.find(item => item.id === questionId);
    if (!question) return;
    const confirmed = confirm(`Supprimer la question "${question.question}" ?`);
    if (!confirmed) return;
    deleteQuizQuestionById(questionId);
  });
  if (workStartButton) workStartButton.addEventListener('click', (event) => {
    event.preventDefault();
    workTimerCard.classList.remove('hidden');
    workNoteCard.classList.add('hidden');
    workTimerSeconds = 0;
    updateWorkTimerDisplay();
    workTimerStatus.textContent = 'Prêt à travailler.';
    currentWorkSession = null;
    renderWorkHistory();
  });
  if (workHistoryButton) workHistoryButton.addEventListener('click', (event) => {
    event.preventDefault();
    showWorkHistory();
  });
  if (workTimerStart) workTimerStart.addEventListener('click', (event) => {
    event.preventDefault();
    startWorkTimer();
  });
  if (workTimerPause) workTimerPause.addEventListener('click', (event) => {
    event.preventDefault();
    pauseWorkTimer();
  });
  if (workTimerStop) workTimerStop.addEventListener('click', (event) => {
    event.preventDefault();
    stopWorkTimer();
  });
  if (workNoteSend) workNoteSend.addEventListener('click', (event) => {
    event.preventDefault();
    saveWorkNote(true);
  });
  if (workNoteSave) workNoteSave.addEventListener('click', (event) => {
    event.preventDefault();
    saveWorkNote(false);
  });
  startReview.addEventListener('click', startReviewSession);
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
  if (clearData) clearData.addEventListener('click', () => {
    resetLocalData();
  });
  if (globalResetButton) globalResetButton.addEventListener('click', () => {
    resetGlobalData();
  });
  // Ensure settings navigation works on both click and touch (mobile)
  if (settingsButton) {
    settingsButton.addEventListener('click', () => goToPage('settings'));
    settingsButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      goToPage('settings');
    });
  }
  themeToggle.addEventListener('click', toggleTheme);
  if (syncDataNowBtn) syncDataNowBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    await syncNow(true);
  });
  if (syncSaveButton) syncSaveButton.addEventListener('click', (event) => {
    event.preventDefault();
    saveSyncSettings();
  });
  if (syncNowButton) syncNowButton.addEventListener('click', async (event) => {
    event.preventDefault();
    await syncNow(true);
  });
  if (syncEditToggle && syncAdvanced) {
    syncEditToggle.addEventListener('click', (event) => {
      event.preventDefault();
      syncAdvanced.classList.toggle('hidden');
    });
  }
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

function saveSyncSettings() {
  if (!state.sync) state.sync = { enabled: false, endpoint: '', token: '' };
  state.sync.enabled = Boolean(syncEnabledInput?.checked);
  state.sync.endpoint = normalizeSyncEndpoint(syncEndpointInput?.value);
  state.sync.token = (syncTokenInput?.value || '').trim();
  saveState({ skipTouch: true });
  startSyncPolling();
  if (state.sync.enabled && state.sync.endpoint) startSyncRealtime();
  else stopSyncRealtime();
  renderSettings();
  if (state.sync.enabled && state.sync.endpoint) {
    syncNow(true);
  }
}

function initUserDaily() {
  const user = getUser(state.currentUser);
  getDaily(user);
  const other = getUser(getOtherUserId());
  getDaily(other);
}

function init() {
  if (!state.sync) state.sync = { enabled: false, endpoint: DEFAULT_SYNC_ENDPOINT, token: '' };
  if (state.sync.endpoint === LEGACY_SYNC_ENDPOINT) {
    state.sync.endpoint = DEFAULT_SYNC_ENDPOINT;
  }
  if (!state.syncMeta) state.syncMeta = { usersUpdatedAt: { G: 0, R: 0 }, globalUpdatedAt: 0, lastSyncedAt: 0 };
  checkMonthTransition();
  checkDayTransition();
  renderQuizStatus();
  resetFlashcardForm();
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
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then((registration) => {
      registration.update().catch(() => {});
    }).catch(console.error);
  }
  window.addEventListener('online', () => {
    setSyncStatus('Connexion retrouvée, synchronisation...');
    startSyncRealtime();
    syncNow(false);
  });
  window.addEventListener('focus', () => {
    if (!isSyncConfigured()) return;
    syncNow(false);
  });
  window.addEventListener('pageshow', () => {
    if (!isSyncConfigured()) return;
    syncNow(false);
  });
  document.addEventListener('visibilitychange', () => {
    startSyncPolling();
    if (!document.hidden && isSyncConfigured()) {
      syncNow(false);
    }
  });
  window.addEventListener('offline', () => {
    stopSyncRealtime();
    setSyncStatus('Hors ligne, sync en attente.');
  });
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    try {
      replaceState(parseState(event.newValue));
      renderApp();
    } catch (error) {
      console.warn('Could not apply external state update', error);
    }
  });
  if (isSyncConfigured()) {
    scheduleSync(300);
    startSyncPolling();
    startSyncRealtime();
    syncNow(false);
  }
}

function renderQuizStatus() {
  setText(questionBankCount, state.questionBank.length);
  if (quizChapter) {
    const chapters = [...new Set(state.questionBank.map(q => q.chapter).filter(Boolean))].sort();
    quizChapter.innerHTML = '<option value="all">Tous les chapitres</option>' + chapters.map(ch => `<option value="${ch}">${ch}</option>`).join('');
  }
  renderQuizQuestionManager();
}

function shuffleArray(array) {
  return array.slice().sort(() => Math.random() - 0.5);
}

init();

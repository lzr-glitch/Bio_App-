const STORAGE_KEY = 'revisio-ibo-state';
const SYNC_DEVICE_STORAGE_KEY = 'revisio-ibo-sync-device-id';
const LEGACY_SYNC_ENDPOINT = 'https://lzr-glitch.github.io/Bio_App-/';
const DEFAULT_SYNC_ENDPOINT = '';
const FIREBASE_SDK_VERSION = '12.18.0';
const FIREBASE_CONFIG = Object.freeze({
  apiKey: 'AIzaSyDzac4yOPOK5A1APSllZRfjvtq7B76vEWM',
  authDomain: 'bio-app-sync.firebaseapp.com',
  databaseURL: 'https://bio-app-sync-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'bio-app-sync',
  storageBucket: 'bio-app-sync.firebasestorage.app',
  messagingSenderId: '625519492146',
  appId: '1:625519492146:web:feb0005eb31b3ae409902b'
});
const FIREBASE_V5_PATH = 'bio-app/realtime-v5';
const FIREBASE_LEGACY_STATE_URL = `${FIREBASE_CONFIG.databaseURL}/bio-app/state.json`;
const V5_OUTBOX_BACKUP_KEY = 'revisio-ibo-v5-outbox';
const V5_OUTBOX_DB_NAME = 'revisio-ibo-v5-sync';
const V5_OUTBOX_STORE = 'outbox';
const WEEKLY_FINALIZATION_HOUR = 14;
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
  sync: { enabled: true, endpoint: FIREBASE_CONFIG.databaseURL, token: '' },
  syncMeta: { usersUpdatedAt: { G: 0, R: 0 }, globalUpdatedAt: 0, lastSyncedAt: 0, resetEpoch: 0 },
  dayResetHour: 4,
  lastUpdate: getDayKeyFor(),
  lastMonth: getDayKeyFor().slice(0, 7),
  jokers: 0,
  dailyThresholds: { reading: 5, cards: 3, tested: 1 },
  deleted: { flashcards: {}, questionBank: {} },
  users: {
    G: { name: 'G', jokers: 0, chapters: {}, flashcards: [], quizzes: [], reading: {}, readingSeconds: {}, tests: [], daily: {}, monthlyTests: [], badges: [], workHistory: [], weeklyAwards: {} },
    R: { name: 'R', jokers: 0, chapters: {}, flashcards: [], quizzes: [], reading: {}, readingSeconds: {}, tests: [], daily: {}, monthlyTests: [], badges: [], workHistory: [], weeklyAwards: {} }
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
const myTotalWork = document.getElementById('my-total-work');
const myWeeklyWins = document.getElementById('my-weekly-wins');
const otherJokers = document.getElementById('other-jokers');
const otherTotalCards = document.getElementById('other-total-cards');
const otherWeekCards = document.getElementById('other-week-cards');
const otherTotalTests = document.getElementById('other-total-tests');
const otherTotalQuizzes = document.getElementById('other-total-quizzes');
const otherSuccessRate = document.getElementById('other-success-rate');
const otherTotalReading = document.getElementById('other-total-reading');
const otherTotalWork = document.getElementById('other-total-work');
const otherWeeklyWins = document.getElementById('other-weekly-wins');
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
let weeklyFinalizationInFlight = false;
let weeklyFinalizationTimer = null;
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
let syncRetryTimeout = null;
let syncFailureCount = 0;
const SYNC_REQUEST_TIMEOUT_MS = 8000;
const firebaseV5 = {
  started: false,
  starting: null,
  database: null,
  rootRef: null,
  modules: null,
  unsubscribe: null,
  connectionUnsubscribe: null,
  connected: false,
  seeding: null,
  remoteDoc: null,
  effectiveDoc: null,
  outbox: new Map(),
  outboxReady: null,
  flushTimer: null,
  flushing: false,
  remoteQueue: Promise.resolve(),
  calendarChecked: false,
  status: 'Initialisation de Firebase…'
};

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

function touchSyncMeta(options = {}) {
  if (!state.syncMeta) state.syncMeta = { usersUpdatedAt: { G: 0, R: 0 }, globalUpdatedAt: 0, lastSyncedAt: 0, resetEpoch: 0 };
  if (!state.syncMeta.usersUpdatedAt) state.syncMeta.usersUpdatedAt = { G: 0, R: 0 };
  if (!Number.isFinite(state.syncMeta.resetEpoch)) state.syncMeta.resetEpoch = 0;
  const now = Date.now();
  if (state.currentUser && state.syncMeta.usersUpdatedAt[state.currentUser] != null) {
    state.syncMeta.usersUpdatedAt[state.currentUser] = now;
  }
  if (options.shared) state.syncMeta.globalUpdatedAt = now;
}

function saveState(options = {}) {
  if (!options.skipTouch) {
    touchSyncMeta({ shared: Boolean(options.shared) });
  }
  if (!options.skipSync && state.currentUser) {
    if (!state.syncMeta) state.syncMeta = { usersUpdatedAt: { G: 0, R: 0 }, globalUpdatedAt: 0, lastSyncedAt: 0, resetEpoch: 0 };
    state.syncMeta.pendingUpdateAt = Date.now();
    state.syncMeta.localRevision = (Number(state.syncMeta.localRevision) || 0) + 1;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('saveState: localStorage.setItem failed', e);
  }
  if (!options.skipSync) {
    if (isFirebaseV5Enabled()) {
      queueV5CurrentState();
      scheduleFirebaseV5Sync();
    } else {
      console.debug('saveState: scheduling sync');
      scheduleSync();
    }
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
  if (isFirebaseV5Enabled()) return true;
  return Boolean(state.sync?.enabled && state.sync?.endpoint);
}

function isFirebaseV5Enabled() {
  return true;
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

async function fetchWithSyncTimeout(url, options) {
  if (typeof AbortController === 'undefined') return fetch(url, options);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SYNC_REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('délai de synchronisation dépassé');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function scheduleSyncRetry() {
  if (!isSyncConfigured() || !navigator.onLine) return;
  syncFailureCount = Math.min(syncFailureCount + 1, 5);
  const delay = Math.min(30000, 1000 * (2 ** syncFailureCount)) + Math.floor(Math.random() * 400);
  clearTimeout(syncRetryTimeout);
  syncRetryTimeout = setTimeout(() => syncNow(false), delay);
}

function resetSyncRetry() {
  syncFailureCount = 0;
  clearTimeout(syncRetryTimeout);
  syncRetryTimeout = null;
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

function restoreSyncCollection(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).map(([id, item]) => {
    if (!item || typeof item !== 'object') return null;
    const restored = { ...item, id: item.id || id };
    if (restored.reviews && !Array.isArray(restored.reviews)) restored.reviews = restoreSyncCollection(restored.reviews);
    if (restored.seenBy && !Array.isArray(restored.seenBy)) restored.seenBy = Object.keys(restored.seenBy).filter(userId => restored.seenBy[userId]);
    return restored;
  }).filter(Boolean);
}

function restoreV4User(user, userId) {
  const restored = JSON.parse(JSON.stringify(user || {}));
  ['flashcards', 'quizzes', 'tests', 'monthlyTests', 'workHistory'].forEach(collection => {
    restored[collection] = restoreSyncCollection(restored[collection]);
  });
  return deepMerge(JSON.parse(JSON.stringify(defaultState.users[userId])), restored);
}

function buildSyncDocument() {
  return {
    syncSchema: 3,
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
      _shared: {
        updatedAt: Number(state.syncMeta?.globalUpdatedAt) || 0,
        streak: state.streak,
        pending: state.pending,
        jokers: state.jokers,
        dailyThresholds: JSON.parse(JSON.stringify(state.dailyThresholds || { reading: 5, cards: 3, tested: 1 })),
        dayResetHour: state.dayResetHour,
        lastUpdate: state.lastUpdate,
        lastMonth: state.lastMonth
      }
    }
  };
}

function sanitizeSyncDoc(doc) {
  if (!doc || typeof doc !== 'object') return null;
  const shared = doc.data?._shared && typeof doc.data._shared === 'object' ? doc.data._shared : (doc.data || {});
  const isV4 = Number(doc.syncSchema) === 4;
  const safe = {
    syncSchema: Number(doc.syncSchema) || 0,
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
        G: isV4 ? restoreV4User(doc.data?.users?.G, 'G') : deepMerge(JSON.parse(JSON.stringify(defaultState.users.G)), doc.data?.users?.G || {}),
        R: isV4 ? restoreV4User(doc.data?.users?.R, 'R') : deepMerge(JSON.parse(JSON.stringify(defaultState.users.R)), doc.data?.users?.R || {})
      },
      deleted: {
        flashcards: doc.data?.deleted?.flashcards || {},
        questionBank: doc.data?.deleted?.questionBank || {}
      },
      questionBank: isV4 ? restoreSyncCollection(doc.data?.questionBank) : (Array.isArray(doc.data?.questionBank) ? doc.data.questionBank : []),
      _shared: {
        updatedAt: Number(shared.updatedAt) || Number(doc.meta?.globalUpdatedAt) || 0,
        streak: Number(shared.streak) || 0,
        pending: Boolean(shared.pending),
        jokers: Number(shared.jokers) || 0,
        dailyThresholds: shared.dailyThresholds || { reading: 5, cards: 3, tested: 1 },
        dayResetHour: Number(shared.dayResetHour ?? 4),
        lastUpdate: shared.lastUpdate || getToday(),
        lastMonth: shared.lastMonth || getToday().slice(0, 7)
      }
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
  return [...merged.values()].sort((left, right) => String(left.id || '').localeCompare(String(right.id || '')));
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
    const newer = itemTime >= previousTime ? item : previous;
    const older = itemTime >= previousTime ? previous : item;
    const combined = { ...older, ...newer };
    if (Array.isArray(previous.seenBy) || Array.isArray(item.seenBy)) {
      combined.seenBy = [...new Set([...(previous.seenBy || []), ...(item.seenBy || [])])];
    }
    if (Array.isArray(previous.reviews) || Array.isArray(item.reviews)) {
      combined.reviews = mergeById(previous.reviews || [], item.reviews || []);
    }
    merged.set(key, combined);
  });
  return [...merged.values()].sort((left, right) => String(left.id || '').localeCompare(String(right.id || '')));
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

function normalizeWeeklyAwards(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const normalized = {};
  Object.entries(value).forEach(([weekKey, rawAward]) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(weekKey) || !rawAward || typeof rawAward !== 'object') return;
    normalized[weekKey] = {
      weekKey,
      start: /^\d{4}-\d{2}-\d{2}$/.test(rawAward.start) ? rawAward.start : weekKey,
      end: /^\d{4}-\d{2}-\d{2}$/.test(rawAward.end) ? rawAward.end : addDaysToDateKey(weekKey, 6),
      winner: rawAward.winner === 'G' || rawAward.winner === 'R' ? rawAward.winner : null,
      scoreG: Math.max(0, Math.round(Number(rawAward.scoreG) || 0)),
      scoreR: Math.max(0, Math.round(Number(rawAward.scoreR) || 0)),
      finalizedAt: Math.max(0, Number(rawAward.finalizedAt) || 0)
    };
  });
  return normalized;
}

function mergeWeeklyAwards(localAwards = {}, remoteAwards = {}) {
  const merged = normalizeWeeklyAwards(localAwards);
  Object.entries(normalizeWeeklyAwards(remoteAwards)).forEach(([weekKey, remoteAward]) => {
    const localAward = merged[weekKey];
    if (!localAward || (remoteAward.finalizedAt && (!localAward.finalizedAt || remoteAward.finalizedAt < localAward.finalizedAt))) {
      merged[weekKey] = remoteAward;
    }
  });
  return merged;
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
    workHistory: mergeById((local.workHistory || []).map(item => normalizeEventItem(item, 'work')), (remote.workHistory || []).map(item => normalizeEventItem(item, 'work'))),
    weeklyAwards: mergeWeeklyAwards(local.weeklyAwards, remote.weeklyAwards)
  };
}

function applyDeletedToUser(user, deleted = {}) {
  const safeUser = deepMerge(JSON.parse(JSON.stringify(defaultState.users[user?.name] || defaultState.users.G)), user || {});
  safeUser.flashcards = mergeById(safeUser.flashcards || [], [], deleted.flashcards || {}).map(normalizeFlashcard);
  safeUser.quizzes = (safeUser.quizzes || []).map(item => normalizeEventItem(item, 'quiz'));
  safeUser.tests = (safeUser.tests || []).map(item => normalizeEventItem(item, 'test'));
  safeUser.monthlyTests = (safeUser.monthlyTests || []).map(item => normalizeEventItem(item, 'monthly'));
  safeUser.workHistory = (safeUser.workHistory || []).map(item => normalizeEventItem(item, 'work'));
  safeUser.weeklyAwards = normalizeWeeklyAwards(safeUser.weeklyAwards);
  return safeUser;
}

function mergeUserSnapshots(localUser, remoteUser, localTs, remoteTs, deleted = {}) {
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

  if ((remote.data._shared.updatedAt || 0) > (local.data._shared.updatedAt || 0)) {
    merged.data._shared = remote.data._shared;
  }
  merged.meta.globalUpdatedAt = Math.max(local.meta.globalUpdatedAt || 0, remote.meta.globalUpdatedAt || 0, merged.data._shared.updatedAt || 0);

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
  state.streak = safe.data._shared.streak;
  state.pending = safe.data._shared.pending;
  state.jokers = safe.data._shared.jokers;
  state.dailyThresholds = safe.data._shared.dailyThresholds;
  state.dayResetHour = safe.data._shared.dayResetHour;
  state.lastUpdate = safe.data._shared.lastUpdate;
  state.lastMonth = safe.data._shared.lastMonth;
  if (!state.syncMeta) state.syncMeta = { usersUpdatedAt: { G: 0, R: 0 }, globalUpdatedAt: 0, lastSyncedAt: 0 };
  state.syncMeta.usersUpdatedAt = safe.meta.usersUpdatedAt;
  state.syncMeta.globalUpdatedAt = safe.meta.globalUpdatedAt;
  state.syncMeta.resetEpoch = safe.meta.resetEpoch || 0;
}

function cloneV5Value(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function isV5Record(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getV5ItemId(item, prefix, index) {
  if (item?.id) return String(item.id);
  const stamp = item?.createdAt || item?.updatedAt || item?.date || item?.question || item?.title || index;
  return `${prefix}-legacy-${String(stamp)}`;
}

function getV5MapKey(item, prefix, index, usedKeys) {
  const base = `${prefix}-${getV5ItemId(item, prefix, index)}`.replace(/[.#$/\[\]]/g, '_');
  let key = base || `${prefix}-${index}`;
  let suffix = 1;
  while (usedKeys.has(key)) {
    key = `${base}-${suffix}`;
    suffix += 1;
  }
  usedKeys.add(key);
  return key;
}

function v5CollectionToMap(items, prefix, transform = value => value) {
  const source = Array.isArray(items) ? items : Object.values(items || {});
  const result = {};
  const usedKeys = new Set();
  source.forEach((rawItem, index) => {
    if (!rawItem || typeof rawItem !== 'object') return;
    const item = cloneV5Value(rawItem);
    if (!item.id) item.id = getV5ItemId(item, prefix, index);
    const key = getV5MapKey(item, prefix, index, usedKeys);
    result[key] = transform(item, index);
  });
  return result;
}

function v5MapToCollection(value, prefix, transform = item => item) {
  const entries = Array.isArray(value)
    ? value.map((item, index) => [String(index), item])
    : Object.entries(value || {});
  return entries
    .map(([key, rawItem], index) => {
      if (!rawItem || typeof rawItem !== 'object') return null;
      const item = cloneV5Value(rawItem);
      if (!item.id) item.id = getV5ItemId({ ...item, id: key }, prefix, index);
      return transform(item, index);
    })
    .filter(Boolean)
    .sort((left, right) => String(left.id || '').localeCompare(String(right.id || '')));
}

function serializeV5Flashcard(rawCard, index) {
  const card = normalizeFlashcard(cloneV5Value(rawCard || {}));
  if (!card.id) card.id = getV5ItemId(card, 'card', index);
  card.reviews = v5CollectionToMap(card.reviews || [], 'review', review => cloneV5Value(review));
  card.seenBy = Object.fromEntries((card.seenBy || []).filter(Boolean).map(userId => [String(userId), true]));
  return card;
}

function deserializeV5Flashcard(rawCard, index) {
  const card = cloneV5Value(rawCard || {});
  if (!card.id) card.id = getV5ItemId(card, 'card', index);
  card.reviews = v5MapToCollection(card.reviews || {}, 'review', review => cloneV5Value(review));
  card.seenBy = Array.isArray(card.seenBy)
    ? [...new Set(card.seenBy.filter(Boolean))]
    : Object.keys(card.seenBy || {}).filter(userId => card.seenBy[userId]);
  return normalizeFlashcard(card);
}

function serializeV5User(rawUser, userId) {
  const user = deepMerge(cloneV5Value(defaultState.users[userId]), cloneV5Value(rawUser || {}));
  user.flashcards = v5CollectionToMap(user.flashcards || [], 'card', serializeV5Flashcard);
  ['quizzes', 'tests', 'monthlyTests', 'workHistory'].forEach(collection => {
    user[collection] = v5CollectionToMap(user[collection] || [], collection.slice(0, -1), item => cloneV5Value(item));
  });
  return user;
}

function deserializeV5User(rawUser, userId) {
  const user = cloneV5Value(rawUser || {});
  user.flashcards = v5MapToCollection(user.flashcards || {}, 'card', deserializeV5Flashcard);
  ['quizzes', 'tests', 'monthlyTests', 'workHistory'].forEach(collection => {
    user[collection] = v5MapToCollection(user[collection] || {}, collection.slice(0, -1), item => cloneV5Value(item));
  });
  return deepMerge(cloneV5Value(defaultState.users[userId]), user);
}

function buildV5DocumentFromState(sourceState = state) {
  const sourceUsers = sourceState.users || {};
  const sourceMeta = sourceState.syncMeta || {};
  return {
    syncSchema: 5,
    version: 1,
    meta: {
      resetEpoch: Number(sourceMeta.resetEpoch) || 0,
      updatedAt: Number(sourceMeta.v5UpdatedAt) || 0
    },
    data: {
      users: {
        G: serializeV5User(sourceUsers.G, 'G'),
        R: serializeV5User(sourceUsers.R, 'R')
      },
      deleted: cloneV5Value(sourceState.deleted || { flashcards: {}, questionBank: {} }),
      questionBank: v5CollectionToMap(sourceState.questionBank || [], 'question', item => cloneV5Value(item)),
      _shared: {
        streak: Number(sourceState.streak) || 0,
        pending: Boolean(sourceState.pending),
        jokers: Number(sourceState.jokers) || 0,
        dailyThresholds: cloneV5Value(sourceState.dailyThresholds || { reading: 5, cards: 3, tested: 1 }),
        dayResetHour: Number(sourceState.dayResetHour ?? 4),
        lastUpdate: sourceState.lastUpdate || getToday(),
        lastMonth: sourceState.lastMonth || getToday().slice(0, 7)
      }
    }
  };
}

function buildV5DocumentFromSyncDoc(syncDoc) {
  const safe = sanitizeSyncDoc(syncDoc) || buildSyncDocument();
  const source = deepMerge(cloneV5Value(defaultState), {
    users: safe.data.users,
    deleted: safe.data.deleted,
    questionBank: safe.data.questionBank,
    streak: safe.data._shared.streak,
    pending: safe.data._shared.pending,
    jokers: safe.data._shared.jokers,
    dailyThresholds: safe.data._shared.dailyThresholds,
    dayResetHour: safe.data._shared.dayResetHour,
    lastUpdate: safe.data._shared.lastUpdate,
    lastMonth: safe.data._shared.lastMonth,
    syncMeta: {
      resetEpoch: safe.meta.resetEpoch || 0,
      v5UpdatedAt: safe.updatedAt || safe.meta.globalUpdatedAt || 0
    }
  });
  return buildV5DocumentFromState(source);
}

function normalizeV5Document(rawDocument) {
  if (!rawDocument || Number(rawDocument.syncSchema) !== 5 || !isV5Record(rawDocument.data)) return null;
  const rawData = rawDocument.data || {};
  const normalized = {
    syncSchema: 5,
    version: 1,
    meta: {
      resetEpoch: Number(rawDocument.meta?.resetEpoch) || 0,
      updatedAt: Number(rawDocument.meta?.updatedAt) || 0
    },
    data: {
      users: {
        G: deserializeV5User(rawData.users?.G, 'G'),
        R: deserializeV5User(rawData.users?.R, 'R')
      },
      deleted: {
        flashcards: cloneV5Value(rawData.deleted?.flashcards || {}),
        questionBank: cloneV5Value(rawData.deleted?.questionBank || {})
      },
      questionBank: v5MapToCollection(rawData.questionBank || {}, 'question', item => cloneV5Value(item)),
      _shared: {
        streak: Number(rawData._shared?.streak) || 0,
        pending: Boolean(rawData._shared?.pending),
        jokers: Number(rawData._shared?.jokers) || 0,
        dailyThresholds: cloneV5Value(rawData._shared?.dailyThresholds || { reading: 5, cards: 3, tested: 1 }),
        dayResetHour: Number(rawData._shared?.dayResetHour ?? 4),
        lastUpdate: rawData._shared?.lastUpdate || getToday(),
        lastMonth: rawData._shared?.lastMonth || getToday().slice(0, 7)
      }
    }
  };
  return buildV5DocumentFromSyncDoc({
    syncSchema: 3,
    version: 1,
    updatedAt: normalized.meta.updatedAt,
    meta: {
      resetEpoch: normalized.meta.resetEpoch,
      globalUpdatedAt: normalized.meta.updatedAt,
      usersUpdatedAt: { G: 0, R: 0 }
    },
    data: normalized.data
  });
}

function v5DocumentToSyncDoc(document) {
  const safe = normalizeV5Document(document);
  if (!safe) return null;
  return {
    syncSchema: 3,
    version: 1,
    updatedAt: safe.meta.updatedAt,
    meta: {
      resetEpoch: safe.meta.resetEpoch,
      globalUpdatedAt: safe.meta.updatedAt,
      usersUpdatedAt: { G: 0, R: 0 }
    },
    data: {
      users: {
        G: deserializeV5User(safe.data.users.G, 'G'),
        R: deserializeV5User(safe.data.users.R, 'R')
      },
      deleted: cloneV5Value(safe.data.deleted),
      questionBank: v5MapToCollection(safe.data.questionBank, 'question', item => cloneV5Value(item)),
      _shared: cloneV5Value(safe.data._shared)
    }
  };
}

function buildV5Patch(baseValue, targetValue, path = '', patch = {}) {
  if (JSON.stringify(baseValue) === JSON.stringify(targetValue)) return patch;
  if (isV5Record(baseValue) && isV5Record(targetValue)) {
    const keys = new Set([...Object.keys(baseValue), ...Object.keys(targetValue)]);
    [...keys].sort().forEach(key => {
      buildV5Patch(baseValue[key], targetValue[key], path ? `${path}/${key}` : key, patch);
    });
    return patch;
  }
  if (path) patch[path] = targetValue === undefined ? null : cloneV5Value(targetValue);
  return patch;
}

function applyV5Patch(document, patch) {
  const next = cloneV5Value(document || {});
  Object.entries(patch || {})
    .sort(([left], [right]) => left.split('/').length - right.split('/').length)
    .forEach(([path, value]) => {
      const parts = path.split('/').filter(Boolean);
      if (!parts.length) return;
      let cursor = next;
      parts.slice(0, -1).forEach(part => {
        if (!isV5Record(cursor[part])) cursor[part] = {};
        cursor = cursor[part];
      });
      const leaf = parts[parts.length - 1];
      if (value === null) delete cursor[leaf];
      else cursor[leaf] = cloneV5Value(value);
    });
  return next;
}

function getV5OutboxBackup() {
  try {
    const parsed = JSON.parse(localStorage.getItem(V5_OUTBOX_BACKUP_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function persistV5OutboxBackup() {
  try {
    localStorage.setItem(V5_OUTBOX_BACKUP_KEY, JSON.stringify([...firebaseV5.outbox.values()]));
  } catch (error) {
    console.warn('Impossible de sauvegarder la boîte d’envoi locale', error);
  }
}

function openV5OutboxDatabase() {
  if (!('indexedDB' in window)) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(V5_OUTBOX_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(V5_OUTBOX_STORE)) {
        database.createObjectStore(V5_OUTBOX_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function loadV5Outbox() {
  getV5OutboxBackup().forEach(operation => {
    if (operation?.id) firebaseV5.outbox.set(operation.id, operation);
  });
  try {
    const database = await openV5OutboxDatabase();
    if (!database) return;
    const operations = await new Promise((resolve, reject) => {
      const transaction = database.transaction(V5_OUTBOX_STORE, 'readonly');
      const request = transaction.objectStore(V5_OUTBOX_STORE).getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
    operations.forEach(operation => {
      if (operation?.id && !firebaseV5.outbox.has(operation.id)) firebaseV5.outbox.set(operation.id, operation);
    });
    persistV5OutboxBackup();
  } catch (error) {
    console.warn('IndexedDB indisponible : la copie locale de secours reste utilisée.', error);
  }
}

function ensureV5OutboxReady() {
  if (!firebaseV5.outboxReady) firebaseV5.outboxReady = loadV5Outbox();
  return firebaseV5.outboxReady;
}

async function persistV5Operation(operation) {
  try {
    const database = await openV5OutboxDatabase();
    if (!database) return;
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(V5_OUTBOX_STORE, 'readwrite');
      transaction.objectStore(V5_OUTBOX_STORE).put(operation);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } catch (error) {
    console.warn('Impossible d’enregistrer une mise à jour hors ligne dans IndexedDB', error);
  }
}

async function removeV5Operation(operationId) {
  firebaseV5.outbox.delete(operationId);
  persistV5OutboxBackup();
  try {
    const database = await openV5OutboxDatabase();
    if (!database) return;
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(V5_OUTBOX_STORE, 'readwrite');
      transaction.objectStore(V5_OUTBOX_STORE).delete(operationId);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } catch (error) {
    console.warn('Impossible de retirer une mise à jour déjà envoyée', error);
  }
}

async function clearV5Outbox() {
  firebaseV5.outbox.clear();
  persistV5OutboxBackup();
  try {
    const database = await openV5OutboxDatabase();
    if (!database) return;
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(V5_OUTBOX_STORE, 'readwrite');
      transaction.objectStore(V5_OUTBOX_STORE).clear();
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } catch (error) {
    console.warn('Impossible de vider la boîte d’envoi', error);
  }
}

function getV5OutboxOperations() {
  return [...firebaseV5.outbox.values()].sort((left, right) => {
    const timeDifference = (Number(left.createdAt) || 0) - (Number(right.createdAt) || 0);
    return timeDifference || String(left.id).localeCompare(String(right.id));
  });
}

function setV5SyncStatus(message) {
  firebaseV5.status = message;
  setSyncStatus(message);
}

function primeV5EffectiveDocument() {
  if (!firebaseV5.effectiveDoc) firebaseV5.effectiveDoc = buildV5DocumentFromState(state);
}

function queueV5CurrentState() {
  if (!isFirebaseV5Enabled() || !state.currentUser) return;
  primeV5EffectiveDocument();
  const target = buildV5DocumentFromState(state);
  const patch = buildV5Patch(firebaseV5.effectiveDoc, target);
  if (!Object.keys(patch).length) return;
  const now = Date.now();
  patch['meta/updatedAt'] = now;
  if (!state.syncMeta) state.syncMeta = { usersUpdatedAt: { G: 0, R: 0 }, globalUpdatedAt: 0, resetEpoch: 0 };
  state.syncMeta.v5UpdatedAt = now;
  const operation = {
    id: `v5-${getSyncDeviceId()}-${now}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    resetEpoch: Number(firebaseV5.effectiveDoc.meta?.resetEpoch) || 0,
    patch
  };
  firebaseV5.effectiveDoc = applyV5Patch(firebaseV5.effectiveDoc, patch);
  firebaseV5.outbox.set(operation.id, operation);
  persistV5OutboxBackup();
  void persistV5Operation(operation);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Impossible de mémoriser la mise à jour locale', error);
  }
  if (!navigator.onLine) setV5SyncStatus('Hors ligne : mise à jour conservée et en attente d’envoi.');
}

function scheduleFirebaseV5Sync(delay = 250) {
  if (!isFirebaseV5Enabled() || !navigator.onLine) return;
  clearTimeout(firebaseV5.flushTimer);
  firebaseV5.flushTimer = setTimeout(() => {
    void startFirebaseV5().then(started => {
      if (started) return flushV5Outbox(false);
      return false;
    });
  }, delay);
}

async function readLegacyStateForV5() {
  const response = await fetch(FIREBASE_LEGACY_STATE_URL, { cache: 'no-store' });
  if (!response.ok) throw new Error(`lecture des données existantes impossible (${response.status})`);
  return sanitizeSyncDoc(await response.json());
}

async function ensureV5Seed() {
  if (firebaseV5.remoteDoc || !firebaseV5.rootRef || !navigator.onLine) return false;
  if (firebaseV5.seeding) return firebaseV5.seeding;
  firebaseV5.seeding = (async () => {
    setV5SyncStatus('Migration unique des données existantes vers Firebase V5…');
    const legacyDocument = await readLegacyStateForV5();
    const seed = buildV5DocumentFromSyncDoc(legacyDocument || buildSyncDocument());
    const result = await firebaseV5.modules.runTransaction(firebaseV5.rootRef, current => {
      if (current && typeof current === 'object') return;
      return seed;
    }, { applyLocally: false });
    if (result.committed) return true;
    return Boolean(normalizeV5Document(result.snapshot?.val?.()));
  })().catch(error => {
    setV5SyncStatus(`Erreur de migration Firebase : ${error.message}`);
    return false;
  }).finally(() => {
    firebaseV5.seeding = null;
  });
  return firebaseV5.seeding;
}

async function discardStaleV5Operations(remoteEpoch) {
  const staleIds = getV5OutboxOperations()
    .filter(operation => Number(operation.resetEpoch) < Number(remoteEpoch))
    .map(operation => operation.id);
  await Promise.all(staleIds.map(operationId => removeV5Operation(operationId)));
  return staleIds.length;
}

function applyV5DocumentToState(document) {
  const syncDocument = v5DocumentToSyncDoc(document);
  if (!syncDocument) return false;
  applySyncDoc(syncDocument);
  if (!state.syncMeta) state.syncMeta = { usersUpdatedAt: { G: 0, R: 0 }, globalUpdatedAt: 0, resetEpoch: 0 };
  state.syncMeta.resetEpoch = Number(document.meta?.resetEpoch) || 0;
  state.syncMeta.v5UpdatedAt = Number(document.meta?.updatedAt) || 0;
  state.syncMeta.lastSyncedAt = Date.now();
  if (!firebaseV5.outbox.size) delete state.syncMeta.pendingUpdateAt;
  saveState({ skipTouch: true, skipSync: true });
  renderApp();
  return true;
}

function queueIncomingV5Snapshot(rawDocument) {
  firebaseV5.remoteQueue = firebaseV5.remoteQueue
    .then(() => handleIncomingV5Snapshot(rawDocument))
    .catch(error => {
      console.error('Impossible d’appliquer la mise à jour Firebase', error);
      setV5SyncStatus(`Erreur sync: ${error.message}`);
    });
}

async function handleIncomingV5Snapshot(rawDocument) {
  if (!rawDocument) {
    await ensureV5Seed();
    return;
  }
  const remoteDocument = normalizeV5Document(rawDocument);
  if (!remoteDocument) {
    throw new Error('format Firebase V5 invalide');
  }
  firebaseV5.remoteDoc = remoteDocument;
  await ensureV5OutboxReady();
  await discardStaleV5Operations(remoteDocument.meta.resetEpoch);
  let effectiveDocument = cloneV5Value(remoteDocument);
  const pendingOperations = getV5OutboxOperations().filter(operation => (
    Number(operation.resetEpoch) === Number(remoteDocument.meta.resetEpoch)
  ));
  pendingOperations.forEach(operation => {
    effectiveDocument = applyV5Patch(effectiveDocument, operation.patch);
  });
  firebaseV5.effectiveDoc = effectiveDocument;
  applyV5DocumentToState(effectiveDocument);
  if (!firebaseV5.calendarChecked) {
    firebaseV5.calendarChecked = true;
    checkMonthTransition();
    checkDayTransition();
  }
  if (pendingOperations.length) {
    setV5SyncStatus(`${pendingOperations.length} mise(s) à jour en attente d’envoi…`);
    void flushV5Outbox(false);
  } else {
    setV5SyncStatus(`Synchronisé (${new Date().toLocaleTimeString('fr-FR')}).`);
    void finalizeWeeklyAwardIfDue();
  }
}

async function startFirebaseV5() {
  if (firebaseV5.started) return true;
  if (firebaseV5.starting) return firebaseV5.starting;
  firebaseV5.starting = (async () => {
    await ensureV5OutboxReady();
    setV5SyncStatus('Connexion Firebase en cours…');
    const [appSdk, databaseSdk] = await Promise.all([
      import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app.js`),
      import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-database.js`)
    ]);
    const appName = 'bio-app-web-v5';
    const existingApp = appSdk.getApps().find(app => app.name === appName);
    const firebaseApp = existingApp || appSdk.initializeApp(FIREBASE_CONFIG, appName);
    firebaseV5.modules = databaseSdk;
    firebaseV5.database = databaseSdk.getDatabase(firebaseApp);
    firebaseV5.rootRef = databaseSdk.ref(firebaseV5.database, FIREBASE_V5_PATH);
    firebaseV5.connectionUnsubscribe = databaseSdk.onValue(databaseSdk.ref(firebaseV5.database, '.info/connected'), snapshot => {
      firebaseV5.connected = snapshot.val() === true;
      if (firebaseV5.connected) {
        if (!firebaseV5.remoteDoc) void ensureV5Seed();
        void flushV5Outbox(false);
      } else if (navigator.onLine) {
        setV5SyncStatus('Connexion Firebase en attente : les modifications restent conservées localement.');
      }
    });
    firebaseV5.unsubscribe = databaseSdk.onValue(firebaseV5.rootRef, snapshot => {
      queueIncomingV5Snapshot(snapshot.val());
    }, error => {
      setV5SyncStatus(`Erreur de connexion Firebase : ${error.message}`);
    });
    firebaseV5.started = true;
    if (navigator.onLine) setTimeout(() => { void ensureV5Seed(); }, 0);
    return true;
  })();
  try {
    return await firebaseV5.starting;
  } catch (error) {
    firebaseV5.started = false;
    firebaseV5.rootRef = null;
    setV5SyncStatus(`Firebase indisponible : ${error.message}`);
    return false;
  } finally {
    if (!firebaseV5.started) firebaseV5.starting = null;
  }
}

async function flushV5Outbox(showFeedback = false) {
  await ensureV5OutboxReady();
  if (!navigator.onLine) {
    if (showFeedback) setV5SyncStatus('Hors ligne : les mises à jour restent conservées sur cet appareil.');
    return false;
  }
  if (!firebaseV5.started && !await startFirebaseV5()) return false;
  if (!firebaseV5.connected) {
    if (showFeedback) setV5SyncStatus('Connexion Firebase en attente : les mises à jour restent conservées localement.');
    return false;
  }
  if (!firebaseV5.rootRef || !firebaseV5.remoteDoc) {
    if (showFeedback) setV5SyncStatus('Connexion Firebase en cours : réessaie dans quelques secondes.');
    return false;
  }
  if (firebaseV5.flushing) return false;
  firebaseV5.flushing = true;
  try {
    let remoteEpoch = Number(firebaseV5.remoteDoc.meta?.resetEpoch) || 0;
    for (const operation of getV5OutboxOperations()) {
      if (Number(operation.resetEpoch) < remoteEpoch) {
        await removeV5Operation(operation.id);
        continue;
      }
      if (Number(operation.resetEpoch) > remoteEpoch) break;
      const result = await commitV5Operation(operation);
      firebaseV5.remoteDoc = result.document;
      remoteEpoch = Number(result.document.meta?.resetEpoch) || remoteEpoch;
      await removeV5Operation(operation.id);
      if (!result.committed && result.stale) {
        await discardStaleV5Operations(remoteEpoch);
        firebaseV5.effectiveDoc = cloneV5Value(result.document);
        applyV5DocumentToState(result.document);
        break;
      }
    }
    state.syncMeta.lastSyncedAt = Date.now();
    if (!firebaseV5.outbox.size) delete state.syncMeta.pendingUpdateAt;
    saveState({ skipTouch: true, skipSync: true });
    if (!firebaseV5.outbox.size) {
      setV5SyncStatus(`Synchronisé (${new Date(state.syncMeta.lastSyncedAt).toLocaleTimeString('fr-FR')}).`);
      void finalizeWeeklyAwardIfDue();
    } else {
      setV5SyncStatus(`${firebaseV5.outbox.size} mise(s) à jour attendent le prochain envoi.`);
    }
    return !firebaseV5.outbox.size;
  } catch (error) {
    setV5SyncStatus(`Erreur sync: ${error.message}`);
    return false;
  } finally {
    firebaseV5.flushing = false;
  }
}

async function syncNowV5(showFeedback = false) {
  if (!navigator.onLine) {
    if (showFeedback) setV5SyncStatus('Hors ligne : dernière copie affichée, envoi conservé pour plus tard.');
    return false;
  }
  if (showFeedback) setV5SyncStatus('Synchronisation Firebase en cours…');
  if (!await startFirebaseV5()) return false;
  return flushV5Outbox(showFeedback);
}

async function finalizeWeeklyAwardIfDue(now = new Date()) {
  const period = getEligibleWeeklyAwardPeriod(now);
  if (!period || weeklyFinalizationInFlight || !state.currentUser || !navigator.onLine) return false;
  if (getWeeklyAwards()[period.key]) return false;
  weeklyFinalizationInFlight = true;
  try {
    if (!await startFirebaseV5() || !firebaseV5.rootRef || !firebaseV5.connected) return false;
    if (firebaseV5.flushing) return false;
    if (firebaseV5.outbox.size && !await flushV5Outbox(false)) return false;

    let changed = false;
    const finalizedAt = Date.now();
    const result = await firebaseV5.modules.runTransaction(firebaseV5.rootRef, current => {
      const currentDocument = normalizeV5Document(current);
      if (!currentDocument) return;
      const finalized = finalizeWeeklyAwardDocument(currentDocument, period, finalizedAt);
      if (!finalized.changed) return;
      changed = true;
      return finalized.document;
    }, { applyLocally: false });
    const document = normalizeV5Document(result.snapshot?.val?.());
    if (!document) throw new Error('résultat hebdomadaire Firebase invalide');
    firebaseV5.remoteDoc = document;
    firebaseV5.effectiveDoc = cloneV5Value(document);
    applyV5DocumentToState(document);
    if (changed && result.committed) setV5SyncStatus('Victoire hebdomadaire enregistrée.');
    return Boolean(changed && result.committed);
  } catch (error) {
    console.warn('Impossible de finaliser la victoire hebdomadaire', error);
    return false;
  } finally {
    weeklyFinalizationInFlight = false;
  }
}

function startWeeklyAwardScheduler() {
  if (weeklyFinalizationTimer) clearInterval(weeklyFinalizationTimer);
  weeklyFinalizationTimer = setInterval(() => {
    if (!document.hidden) void finalizeWeeklyAwardIfDue();
  }, 60 * 1000);
  void finalizeWeeklyAwardIfDue();
}

async function commitV5Operation(operation) {
  const result = await firebaseV5.modules.runTransaction(firebaseV5.rootRef, current => {
    const currentDocument = normalizeV5Document(current);
    if (!currentDocument) return;
    if (Number(currentDocument.meta.resetEpoch) !== Number(operation.resetEpoch)) return;
    return applyV5Patch(currentDocument, operation.patch);
  }, { applyLocally: false });
  const document = normalizeV5Document(result.snapshot?.val?.());
  if (result.committed && document) return { committed: true, document };
  if (document && Number(document.meta.resetEpoch) > Number(operation.resetEpoch)) {
    return { committed: false, stale: true, document };
  }
  throw new Error('opération Firebase non confirmée');
}

function configureFirebaseV5Sync() {
  state.sync = {
    enabled: true,
    endpoint: FIREBASE_CONFIG.databaseURL,
    token: ''
  };
}

async function resetGlobalDataV5() {
  if (!confirm('Réinitialiser toutes les données sur tous les appareils synchronisés ?')) return;
  if (!navigator.onLine) {
    setV5SyncStatus('Impossible de réinitialiser partout : reconnecte cet appareil à Internet.');
    return;
  }
  setV5SyncStatus('Réinitialisation globale Firebase en cours…');
  if (!await startFirebaseV5() || !firebaseV5.rootRef) return;
  try {
    const requestedEpoch = Date.now();
    const result = await firebaseV5.modules.runTransaction(firebaseV5.rootRef, current => {
      const currentDocument = normalizeV5Document(current);
      const resetEpoch = Math.max(
        requestedEpoch,
        (Number(currentDocument?.meta?.resetEpoch) || 0) + 1,
        (Number(state.syncMeta?.resetEpoch) || 0) + 1
      );
      const resetState = buildResetState({
        keepLastSyncedAt: false,
        resetEpoch,
        globalUpdatedAt: resetEpoch
      });
      const resetDocument = buildV5DocumentFromState(resetState);
      resetDocument.meta.resetEpoch = resetEpoch;
      resetDocument.meta.updatedAt = requestedEpoch;
      return resetDocument;
    }, { applyLocally: false });
    const resetDocument = normalizeV5Document(result.snapshot?.val?.());
    if (!result.committed || !resetDocument) throw new Error('reset Firebase non confirmé');
    await clearV5Outbox();
    firebaseV5.remoteDoc = resetDocument;
    firebaseV5.effectiveDoc = cloneV5Value(resetDocument);
    applyV5DocumentToState(resetDocument);
    setV5SyncStatus('Réinitialisation globale confirmée sur Firebase.');
  } catch (error) {
    setV5SyncStatus(`Erreur reset global: ${error.message}`);
  }
}

async function pullRemoteDoc(withEtag = false) {
  console.debug('pullRemoteDoc: fetching', state.sync.endpoint);
  const headers = getSyncHeaders();
  if (withEtag) headers['X-Firebase-ETag'] = 'true';
  const response = await fetchWithSyncTimeout(state.sync.endpoint, {
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
      headers['if-match'] = etag || 'null_etag';
      const response = await fetchWithSyncTimeout(state.sync.endpoint, {
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

async function syncNowLegacy(showFeedback = false) {
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

function getSyncV2BaseUrl() {
  return state.sync.endpoint.replace(/\/state\.json(?:\?.*)?$/i, '/sync-v2');
}

function getSyncV2Url(section) {
  return `${getSyncV2BaseUrl()}/${section}.json`;
}

function getSyncDeviceId() {
  if (!state.syncMeta) state.syncMeta = { usersUpdatedAt: { G: 0, R: 0 }, globalUpdatedAt: 0, lastSyncedAt: 0, resetEpoch: 0 };
  if (!state.syncMeta.deviceId) {
    const storedDeviceId = localStorage.getItem(SYNC_DEVICE_STORAGE_KEY);
    if (storedDeviceId) {
      state.syncMeta.deviceId = storedDeviceId;
    } else {
      const randomPart = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      state.syncMeta.deviceId = `device-${randomPart}`;
      localStorage.setItem(SYNC_DEVICE_STORAGE_KEY, state.syncMeta.deviceId);
    }
  }
  return state.syncMeta.deviceId;
}

function getSyncV2UpdateDocs(payload) {
  if (!payload || typeof payload !== 'object') return [];
  const docs = [];
  if (payload.data && payload.meta) docs.push(payload);
  Object.values(payload).forEach(value => {
    if (value?.data && value?.meta) docs.push(value);
  });
  return docs.sort((left, right) => {
    const timeDifference = (Number(left.updatedAt) || 0) - (Number(right.updatedAt) || 0);
    if (timeDifference) return timeDifference;
    return JSON.stringify(left).localeCompare(JSON.stringify(right));
  });
}

async function fetchSyncJson(url, withEtag = false) {
  const headers = getSyncHeaders();
  if (withEtag) headers['X-Firebase-ETag'] = 'true';
  const response = await fetchWithSyncTimeout(url, { method: 'GET', cache: 'no-store', headers });
  if (response.status === 404) return { doc: null, etag: null };
  if (!response.ok) throw new Error(`GET ${response.status}`);
  return { doc: await response.json(), etag: response.headers.get('etag') };
}

async function putSyncJson(url, doc, etag = null) {
  const headers = getSyncHeaders();
  if (etag) headers['if-match'] = etag;
  const response = await fetchWithSyncTimeout(url, { method: 'PUT', headers, body: JSON.stringify(doc) });
  if (response.status === 412) return false;
  if (!response.ok) throw new Error(`PUT ${response.status}`);
  return true;
}

async function loadSyncV2() {
  const [common, updateG, updateR] = await Promise.all([
    fetchSyncJson(getSyncV2Url('common'), true),
    fetchSyncJson(getSyncV2Url('updates/G'), true),
    fetchSyncJson(getSyncV2Url('updates/R'), true)
  ]);
  let commonDoc = common.doc;
  let migrated = false;
  if (!commonDoc) {
    commonDoc = await pullRemoteDoc() || buildSyncDocument();
    const stored = await putSyncJson(getSyncV2Url('common'), commonDoc, common.etag);
    if (!stored) return loadSyncV2();
    migrated = true;
  }
  let merged = sanitizeSyncDoc(commonDoc) || buildSyncDocument();
  [...getSyncV2UpdateDocs(updateG.doc), ...getSyncV2UpdateDocs(updateR.doc)].forEach(update => {
    if (update) merged = mergeSyncDocs(merged, update);
  });
  return { doc: merged, migrated };
}

async function saveSyncV2Update(userId, doc) {
  const url = getSyncV2Url(`updates/${userId}/${getSyncDeviceId()}`);
  let candidate = doc;
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    const remote = await fetchSyncJson(url, true);
    candidate = remote.doc ? mergeSyncDocs(candidate, remote.doc) : candidate;
    if (remote.doc && getComparableSyncDoc(candidate) === getComparableSyncDoc(remote.doc)) {
      return remote.doc;
    }
    if (await putSyncJson(url, candidate, remote.etag)) return candidate;
    await new Promise(resolve => setTimeout(resolve, 100 + Math.floor(Math.random() * 200)));
  }
  throw new Error('mise à jour du profil en attente');
}

async function syncNowV2Legacy(showFeedback = false) {
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
    const pendingUpdateAt = Number(state.syncMeta?.pendingUpdateAt) || 0;
    const localRevision = Number(state.syncMeta?.localRevision) || 0;
    const localDoc = buildSyncDocument();
    const remote = await loadSyncV2();
    let mergedDoc = mergeSyncDocs(localDoc, remote.doc);
    const resetFromRemote = (remote.doc.meta?.resetEpoch || 0) > (localDoc.meta?.resetEpoch || 0);
    if (!resetFromRemote && (Number(state.syncMeta?.localRevision) || 0) !== localRevision) {
      syncRequestedWhileBusy = true;
      return false;
    }
    if (resetFromRemote) {
      applySyncDoc(remote.doc);
      if (state.syncMeta) delete state.syncMeta.pendingUpdateAt;
    } else {
      applySyncDoc(mergedDoc);
      if (pendingUpdateAt || remote.migrated) {
        mergedDoc = await saveSyncV2Update(state.currentUser, mergedDoc);
        if ((Number(state.syncMeta?.localRevision) || 0) !== localRevision) {
          syncRequestedWhileBusy = true;
          return false;
        }
        applySyncDoc(mergedDoc);
        if (state.syncMeta?.pendingUpdateAt === pendingUpdateAt) delete state.syncMeta.pendingUpdateAt;
      }
    }
    state.syncMeta.lastSyncedAt = Date.now();
    saveState({ skipTouch: true, skipSync: true });
    resetSyncRetry();
    renderApp();
    const timeLabel = new Date(state.syncMeta.lastSyncedAt).toLocaleTimeString('fr-FR');
    setSyncStatus(`Synchronisé (${timeLabel}).`);
    return true;
  } catch (error) {
    scheduleSyncRetry();
    setSyncStatus(`Erreur sync: ${error.message}`);
    return false;
  } finally {
    syncInFlight = false;
    if (syncRequestedWhileBusy && isSyncConfigured() && navigator.onLine) {
      syncRequestedWhileBusy = false;
      setTimeout(() => syncNow(false), 150);
    }
  }
}

function scheduleSync(delay = 1200) {
  if (isFirebaseV5Enabled()) {
    scheduleFirebaseV5Sync(delay);
    return;
  }
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
  if (isFirebaseV5Enabled()) {
    syncPollInterval = null;
    void startFirebaseV5();
    return;
  }
  if (!isSyncConfigured()) {
    syncPollInterval = null;
    return;
  }
  const intervalMs = document.hidden ? 15000 : 4000;
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
  if (isFirebaseV5Enabled()) {
    void startFirebaseV5();
    return;
  }
  stopSyncRealtime();
  if (!isSyncConfigured() || typeof EventSource === 'undefined' || state.sync?.token) return;
  try {
    syncEventSource = new EventSource(state.sync.endpoint);
    const requestRefresh = () => {
      if (syncInFlight) {
        syncRequestedWhileBusy = true;
        return;
      }
      scheduleSync(80);
    };
    syncEventSource.addEventListener('put', requestRefresh);
    syncEventSource.addEventListener('patch', requestRefresh);
  } catch (error) {
    console.warn('Impossible de démarrer le flux temps réel Firebase', error);
  }
}

function isCommonSyncDoc(doc) {
  return Number(doc?.syncSchema) === 3;
}

function getCanonicalNodeUrl(path) {
  const suffix = String(path).replace(/^\/+|\/+$/g, '').split('/').map(encodeURIComponent).join('/');
  return state.sync.endpoint.replace(/\/state\.json(?:\?.*)?$/i, `/state/${suffix}.json`);
}

async function putSyncJsonConditionally(url, doc, etag) {
  const headers = getSyncHeaders();
  headers['if-match'] = etag || 'null_etag';
  const response = await fetchWithSyncTimeout(url, { method: 'PUT', headers, body: JSON.stringify(doc) });
  if (response.status === 412) return false;
  if (!response.ok) throw new Error(`PUT ${response.status}`);
  return true;
}

async function syncCanonicalBranch(path, localValue, mergeValue) {
  const url = getCanonicalNodeUrl(path);
  for (let attempt = 1; attempt <= 50; attempt += 1) {
    const remote = await fetchSyncJson(url, true);
    const next = mergeValue(localValue, remote.doc);
    if (JSON.stringify(next) === JSON.stringify(remote.doc)) return next;
    if (await putSyncJsonConditionally(url, next, remote.etag)) return next;
    await new Promise(resolve => setTimeout(resolve, Math.min(2500, 80 + Math.floor(Math.random() * 180) + (attempt * 45))));
  }
  throw new Error(`écriture concurrente bloquée (${path})`);
}

async function pushCanonicalBranches(doc) {
  const target = sanitizeSyncDoc(doc);
  const deleted = await syncCanonicalBranch('data/deleted', target.data.deleted, (local, remote) => ({
    flashcards: mergeDeletedMaps(local.flashcards, remote?.flashcards),
    questionBank: mergeDeletedMaps(local.questionBank, remote?.questionBank)
  }));
  const mergeBranchUser = (local, remote) => mergeUsers(local, remote, deleted);
  await Promise.all([
    syncCanonicalBranch('data/users/G', target.data.users.G, mergeBranchUser),
    syncCanonicalBranch('data/users/R', target.data.users.R, mergeBranchUser),
    syncCanonicalBranch('data/questionBank', target.data.questionBank, (local, remote) => mergeQuestionBank(local, Array.isArray(remote) ? remote : [], deleted.questionBank)),
    syncCanonicalBranch('data/_shared', target.data._shared, (local, remote) => {
      const remoteShared = remote && typeof remote === 'object' ? remote : {};
      return (Number(local.updatedAt) || 0) >= (Number(remoteShared.updatedAt) || 0) ? local : remoteShared;
    })
  ]);
  const remote = await pullRemoteDoc(true);
  return sanitizeSyncDoc(remote.doc);
}

async function readLegacyV2Doc() {
  try {
    const [common, updateG, updateR] = await Promise.all([
      fetchSyncJson(getSyncV2Url('common')),
      fetchSyncJson(getSyncV2Url('updates/G')),
      fetchSyncJson(getSyncV2Url('updates/R'))
    ]);
    let merged = common.doc ? sanitizeSyncDoc(common.doc) : null;
    [...getSyncV2UpdateDocs(updateG.doc), ...getSyncV2UpdateDocs(updateR.doc)].forEach(update => {
      merged = merged ? mergeSyncDocs(merged, update) : sanitizeSyncDoc(update);
    });
    return merged;
  } catch (error) {
    console.warn('Impossible de lire les anciennes données sync-v2', error);
    return null;
  }
}

async function clearLegacyV2Data() {
  try {
    await Promise.all([
      putSyncJson(getSyncV2Url('common'), null),
      putSyncJson(getSyncV2Url('updates/G'), null),
      putSyncJson(getSyncV2Url('updates/R'), null)
    ]);
  } catch (error) {
    console.warn('Impossible de nettoyer les anciennes données sync-v2', error);
  }
}

async function readCanonicalRemote() {
  const root = await pullRemoteDoc(true);
  if (isCommonSyncDoc(root.doc)) {
    return { doc: sanitizeSyncDoc(root.doc), etag: root.etag, needsMigration: false };
  }
  let migrated = root.doc ? sanitizeSyncDoc(root.doc) : null;
  const legacyV2 = await readLegacyV2Doc();
  if (legacyV2) migrated = migrated ? mergeSyncDocs(migrated, legacyV2) : legacyV2;
  if (!migrated) migrated = buildSyncDocument();
  migrated.syncSchema = 3;
  return { doc: migrated, etag: root.etag, needsMigration: true };
}

async function syncNow(showFeedback = false) {
  if (isFirebaseV5Enabled()) return syncNowV5(showFeedback);
  if (!isSyncConfigured()) {
    if (showFeedback) setSyncStatus('Configure une URL puis active la sync.');
    return false;
  }
  if (!navigator.onLine) {
    if (showFeedback) setSyncStatus('Hors ligne, dernière copie affichée.');
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
    const maxAttempts = 16;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const pendingUpdateAt = Number(state.syncMeta?.pendingUpdateAt) || 0;
      const localRevision = Number(state.syncMeta?.localRevision) || 0;
      const localDoc = buildSyncDocument();
      const remote = await readCanonicalRemote();
      const remoteResetWins = (remote.doc.meta?.resetEpoch || 0) > (localDoc.meta?.resetEpoch || 0);
      if (!remoteResetWins && (Number(state.syncMeta?.localRevision) || 0) !== localRevision) {
        syncRequestedWhileBusy = true;
        return false;
      }

      let targetDoc = remote.doc;
      if (!remoteResetWins && pendingUpdateAt) {
        targetDoc = mergeSyncDocs(localDoc, remote.doc);
      }
      targetDoc.syncSchema = 3;

      const needsWrite = remote.needsMigration || (!remoteResetWins && pendingUpdateAt && getComparableSyncDoc(targetDoc) !== getComparableSyncDoc(remote.doc));
      if (needsWrite) {
        if (remote.needsMigration) {
          const result = await pushRemoteDoc(targetDoc, remote.etag);
          if (result.conflict) {
            await new Promise(resolve => setTimeout(resolve, 180 + Math.floor(Math.random() * 420) + (attempt * 80)));
            continue;
          }
          clearLegacyV2Data();
        } else {
          targetDoc = await pushCanonicalBranches(targetDoc);
        }
      }

      if (!remoteResetWins && (Number(state.syncMeta?.localRevision) || 0) !== localRevision) {
        syncRequestedWhileBusy = true;
        return false;
      }
      applySyncDoc(targetDoc);
      if (remoteResetWins || state.syncMeta?.pendingUpdateAt === pendingUpdateAt) {
        delete state.syncMeta.pendingUpdateAt;
      }
      state.syncMeta.lastSyncedAt = Date.now();
      saveState({ skipTouch: true, skipSync: true });
      resetSyncRetry();
      renderApp();
      setSyncStatus(`Synchronisé (${new Date(state.syncMeta.lastSyncedAt).toLocaleTimeString('fr-FR')}).`);
      return true;
    }
    throw new Error('synchronisation occupée, nouvel essai automatique en cours');
  } catch (error) {
    scheduleSyncRetry();
    setSyncStatus(`Erreur sync: ${error.message}`);
    return false;
  } finally {
    syncInFlight = false;
    if (syncRequestedWhileBusy && isSyncConfigured() && navigator.onLine) {
      syncRequestedWhileBusy = false;
      setTimeout(() => syncNow(false), 150);
    }
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
      workHistory: [],
      weeklyAwards: {}
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
  if (!user.weeklyAwards || typeof user.weeklyAwards !== 'object' || Array.isArray(user.weeklyAwards)) user.weeklyAwards = {};
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
    saveState({ shared: true });
  }
}

function checkMonthTransition() {
  const currentMonth = getToday().slice(0, 7);
  if (state.lastMonth !== currentMonth) {
    processMonthlyEnd(state.lastMonth);
    state.lastMonth = currentMonth;
    saveState({ shared: true });
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
  const seconds = getWorkSecondsForPeriod(user, { start: last7[last7.length - 1], end: last7[0] });
  return Math.floor(seconds / 60);
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
  setText(myTotalWork, formatReadingSeconds(displayG.totalWorkSeconds));
  setText(myWeeklyWins, displayG.weeklyWins);
  setText(otherJokers, userR.jokers);
  setText(otherTotalCards, displayR.totalCards);
  setText(otherWeekCards, displayR.weekCards);
  setText(otherTotalTests, displayR.totalTests);
  setText(otherTotalQuizzes, displayR.totalQuizzes);
  setText(otherSuccessRate, `${displayR.successRate}%`);
  setText(otherTotalReading, `${displayR.totalReading} min`);
  setText(otherTotalWork, formatReadingSeconds(displayR.totalWorkSeconds));
  setText(otherWeeklyWins, displayR.weeklyWins);
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
  if (syncEnabledInput) {
    syncEnabledInput.checked = true;
    syncEnabledInput.disabled = true;
  }
  if (syncEndpointInput) {
    syncEndpointInput.value = FIREBASE_CONFIG.databaseURL;
    syncEndpointInput.disabled = true;
  }
  if (syncTokenInput) {
    syncTokenInput.value = '';
    syncTokenInput.disabled = true;
  }
  if (syncStatus) {
    if (!navigator.onLine) {
      setSyncStatus('Hors ligne, sync en attente.');
    } else if (firebaseV5.status) {
      setSyncStatus(firebaseV5.status);
    } else if (state.syncMeta?.lastSyncedAt) {
      setSyncStatus(`Synchronisé (${new Date(state.syncMeta.lastSyncedAt).toLocaleTimeString('fr-FR')}).`);
    } else {
      setSyncStatus('Connexion Firebase en cours…');
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
      totalReading: 0,
      totalWorkSeconds: 0,
      weeklyWins: 0
    };
  }
  const baseStats = computeStats(user);
  const readings = user.reading && typeof user.reading === 'object' ? user.reading : {};
  const flashcards = Array.isArray(user.flashcards) ? user.flashcards : [];
  const tests = Array.isArray(user.tests) ? user.tests : [];
  const quizzes = Array.isArray(user.quizzes) ? user.quizzes : [];
  const totalReading = Object.values(readings || {}).reduce((sum, v) => sum + Number(v || 0), 0);
  const totalWorkSeconds = getWorkSecondsForPeriod(user, { start: null, end: null });
  return {
    totalCards: flashcards.length,
    weekCards: baseStats.weekCards,
    totalTests: tests.length,
    totalQuizzes: quizzes.length,
    successRate: baseStats.successRate,
    totalReading,
    totalWorkSeconds,
    weeklyWins: getWeeklyWinCount(user.name)
  };
}

function populateAdminInputs() {
  if (adminStreakJokers) adminStreakJokers.value = state.jokers;
}

function saveAdminChanges() {
  if (state.currentUser !== 'R') return;
  state.jokers = Math.max(0, Number(adminStreakJokers?.value) || 0);
  saveState({ shared: true });
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

function addDaysToDateKey(dayKey, days) {
  const [year, month, day] = String(dayKey || '').split('-').map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1);
  date.setDate(date.getDate() + days);
  return toLocalDateKey(date);
}

function isDayInPeriod(dayKey, period = {}) {
  if (!dayKey) return false;
  if (!period.start || !period.end) return true;
  return dayKey >= period.start && dayKey <= period.end;
}

function getWorkEntryDayKey(entry) {
  const value = entry?.date || entry?.createdAt || entry?.updatedAt;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : toLocalDateKey(date);
}

function getWorkSecondsForPeriod(user, period = {}) {
  const history = Array.isArray(user?.workHistory) ? user.workHistory : [];
  return history.reduce((total, entry) => {
    if (!entry || entry.received || !isDayInPeriod(getWorkEntryDayKey(entry), period)) return total;
    return total + Math.max(0, Number(entry.duration) || 0);
  }, 0);
}

function getWeekPeriodForDay(dayKey = getToday()) {
  const start = getMondayKey(dayKey);
  return { key: start, start, end: addDaysToDateKey(start, 6) };
}

function getEligibleWeeklyAwardPeriod(now = new Date()) {
  const currentPeriod = getWeekPeriodForDay(toLocalDateKey(now));
  const isSundayAfternoon = now.getDay() === 0 && now.getHours() >= WEEKLY_FINALIZATION_HOUR;
  return isSundayAfternoon
    ? currentPeriod
    : getWeekPeriodForDay(addDaysToDateKey(currentPeriod.start, -1));
}

function getWeeklyAwards() {
  return normalizeWeeklyAwards(getUser('G')?.weeklyAwards);
}

function getWeeklyWinCount(userId, awards = getWeeklyAwards()) {
  if (userId !== 'G' && userId !== 'R') return 0;
  return Object.values(awards).filter(award => award.winner === userId).length;
}

function getWeeklyCompetitionScore(user, period) {
  const stats = getPeriodStats(user, period);
  const completedTests = (user?.tests || []).filter(test => isDayInPeriod(test.date, period)).length
    + (user?.quizzes || []).filter(quiz => isDayInPeriod(quiz.date, period)).length;
  return Math.floor(stats.workSeconds / 60)
    + Math.floor(stats.readingSeconds / 60)
    + stats.flashcardsCreated * 3
    + completedTests * 4;
}

function createWeeklyAward(users, period, finalizedAt = Date.now()) {
  const scoreG = getWeeklyCompetitionScore(users?.G, period);
  const scoreR = getWeeklyCompetitionScore(users?.R, period);
  return {
    weekKey: period.key,
    start: period.start,
    end: period.end,
    winner: scoreG === scoreR ? null : (scoreG > scoreR ? 'G' : 'R'),
    scoreG,
    scoreR,
    finalizedAt
  };
}

function finalizeWeeklyAwardDocument(document, period, finalizedAt = Date.now()) {
  const next = cloneV5Value(document);
  const users = {
    G: deserializeV5User(next.data?.users?.G, 'G'),
    R: deserializeV5User(next.data?.users?.R, 'R')
  };
  const awards = normalizeWeeklyAwards(users.G.weeklyAwards);
  if (awards[period.key]) return { document: next, changed: false };
  awards[period.key] = createWeeklyAward(users, period, finalizedAt);
  next.data.users.G.weeklyAwards = awards;
  next.meta.updatedAt = finalizedAt;
  return { document: next, changed: true };
}

function getWeeklyWinnerLabel(award, userId) {
  if (!award || !award.winner) return 'Match nul';
  return award.winner === userId ? 'Toi' : 'Autre personne';
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
  const safeUser = user || {};
  const inRange = dayKey => isDayInPeriod(dayKey, period);

  const readingKeys = new Set([
    ...Object.keys(safeUser.reading || {}),
    ...Object.keys(safeUser.readingSeconds || {})
  ]);
  let readingSeconds = 0;
  readingKeys.forEach(dayKey => {
    if (inRange(dayKey)) readingSeconds += getReadingSecondsForDay(safeUser, dayKey);
  });

  const flashcardsCreated = (safeUser.flashcards || []).filter(card => inRange(card.date)).length;
  const flashcardsTested = (safeUser.tests || [])
    .filter(test => inRange(test.date))
    .reduce((sum, test) => sum + (Number(test.count) || 0), 0);

  const quizQuestionsCreated = state.questionBank.filter(question => {
    if (question.createdBy !== safeUser.name) return false;
    const createdDay = getQuestionCreatedDay(question);
    if (!period.start || !period.end) return true;
    return createdDay ? inRange(createdDay) : false;
  }).length;

  const quizQuestionsTested = (safeUser.quizzes || []).filter(quiz => inRange(quiz.date)).length;
  const workSeconds = getWorkSecondsForPeriod(safeUser, period);

  return {
    readingSeconds,
    workSeconds,
    flashcardsCreated,
    flashcardsTested,
    quizQuestionsCreated,
    quizQuestionsTested,
    weeklyWins: getWeeklyWinCount(safeUser.name)
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
      <span>Temps de travail</span>
      <strong>${formatReadingSeconds(leftStats.workSeconds)}</strong>
      <strong>${formatReadingSeconds(rightStats.workSeconds)}</strong>
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
    </div>
    <div class="stats-compare-grid">
      <span>Victoires hebdomadaires</span>
      <strong>${leftStats.weeklyWins}</strong>
      <strong>${rightStats.weeklyWins}</strong>
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
    { title: `Depuis lundi (${monday} ? ${today})`, start: monday, end: today },
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
    item.innerHTML = `<span>${badge.label}</span><strong>${badge.earned ? '??' : '??'}</strong>`;
    badgeList.appendChild(item);
  });
}

function renderRecap() {
  const user = getUser(state.currentUser);
  const other = getUser(getOtherUserId());
  const currentWeek = getWeekPeriodForDay(getToday());
  const currentWeekStats = getPeriodStats(user, { start: currentWeek.start, end: getToday() });
  const recap = document.createElement('div');
  recap.className = 'recap-section';
  recap.innerHTML = `
    <span>Temps de lecture cette semaine</span><strong>${sumLast7(user.reading)} min</strong>
    <span>Temps de travail cette semaine</span><strong>${formatReadingSeconds(currentWeekStats.workSeconds)}</strong>
    <span>Flashcards créées cette semaine</span><strong>${user.flashcards.filter(card => getLastDays(7).includes(card.date)).length}</strong>
    <span>Tests réalisés cette semaine</span><strong>${user.tests.filter(test => getLastDays(7).includes(test.date)).length + user.quizzes.filter(quiz => getLastDays(7).includes(quiz.date)).length}</strong>
    <span>Score moyen quiz</span><strong>${averageQuizScore(user)}%</strong>
    <span>Victoires hebdomadaires</span><strong>${getWeeklyWinCount(user.name)}</strong>
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
  const completedPeriod = getEligibleWeeklyAwardPeriod();
  const completedAward = getWeeklyAwards()[completedPeriod.key];
  if (completedAward) return getWeeklyWinnerLabel(completedAward, user.name);
  const currentPeriod = getWeekPeriodForDay(getToday());
  const scoreUser = getWeeklyCompetitionScore(user, currentPeriod);
  const scoreOther = getWeeklyCompetitionScore(other, currentPeriod);
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
    <input type="text" class="quiz-create-option-input" dir="ltr" placeholder="Proposition ${idx + 1}" value="${escapeHtml(value)}" />
    <button type="button" class="quiz-create-option-remove" aria-label="Supprimer cette proposition" title="Supprimer cette proposition">×</button>
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
  const reviewTimestamp = new Date().toISOString();
  original.reviews.push({
    id: createEventId('review'),
    date: getToday(),
    mastery: selectedMastery,
    createdAt: reviewTimestamp,
    updatedAt: reviewTimestamp
  });
  setFlashcardMastery(original, selectedMastery);
  if (reviewSessionMode === 'other-unseen') {
    if (!original.seenBy) original.seenBy = [];
    if (!original.seenBy.includes(state.currentUser)) original.seenBy.push(state.currentUser);
  }
  original.updatedAt = reviewTimestamp;
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
      if (!original.seenBy.includes(state.currentUser)) {
        original.seenBy.push(state.currentUser);
        original.updatedAt = new Date().toISOString();
      }
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
  quizQuestion.dir = 'ltr';
  quizOptions.innerHTML = '';
  const multi = correctIndices.length > 1;
  question.options.forEach((option, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-button';
    btn.type = 'button';
    btn.dir = 'ltr';
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
  monthlyQuestion.dir = 'ltr';
  monthlyQuestion.textContent = question.question;
  monthlyOptions.innerHTML = '';
  question.options.forEach((option, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dir = 'ltr';
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
  if (isFirebaseV5Enabled()) return resetGlobalDataV5();
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
      resetDoc.syncSchema = 3;
      const result = await pushRemoteDoc(resetDoc, remote.etag);
      if (result.conflict) continue;
      clearLegacyV2Data();
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
      void finalizeWeeklyAwardIfDue();
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
  configureFirebaseV5Sync();
  saveState({ skipTouch: true, skipSync: true });
  renderSettings();
  void syncNowV5(true);
}

function initUserDaily() {
  const user = getUser(state.currentUser);
  getDaily(user);
  const other = getUser(getOtherUserId());
  getDaily(other);
}

function init() {
  configureFirebaseV5Sync();
  primeV5EffectiveDocument();
  void ensureV5OutboxReady();
  if (!state.syncMeta) state.syncMeta = { usersUpdatedAt: { G: 0, R: 0 }, globalUpdatedAt: 0, lastSyncedAt: 0 };
  if (!isFirebaseV5Enabled()) {
    checkMonthTransition();
    checkDayTransition();
  }
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
    setV5SyncStatus('Connexion retrouvée, synchronisation Firebase…');
    void startFirebaseV5().then(() => syncNowV5(false));
  });
  window.addEventListener('focus', () => {
    if (isFirebaseV5Enabled()) {
      void syncNowV5(false);
      return;
    }
    if (isSyncConfigured()) syncNow(false);
  });
  window.addEventListener('pageshow', () => {
    if (isFirebaseV5Enabled()) {
      void syncNowV5(false);
      return;
    }
    if (isSyncConfigured()) syncNow(false);
  });
  document.addEventListener('visibilitychange', () => {
    if (isFirebaseV5Enabled()) {
      if (!document.hidden) {
        void syncNowV5(false);
        void finalizeWeeklyAwardIfDue();
      }
      return;
    }
    startSyncPolling();
    if (!document.hidden && isSyncConfigured()) {
      syncNow(false);
    }
  });
  window.addEventListener('offline', () => {
    stopSyncRealtime();
    setV5SyncStatus('Hors ligne : les nouvelles actions restent conservées sur cet appareil.');
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
  startWeeklyAwardScheduler();
  void startFirebaseV5().then(() => syncNowV5(false));
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

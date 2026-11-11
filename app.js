const canvas = document.querySelector('#wheel');
const context = canvas.getContext('2d');
const result = document.querySelector('#result');
const statusMessage = document.querySelector('#status');
const wheelStage = document.querySelector('#wheel-stage');
const wheelHint = document.querySelector('#wheel-hint');
const languageSelect = document.querySelector('#language-select');
const languageFlag = document.querySelector('#language-flag');
const themeToggle = document.querySelector('#theme-toggle');
const themeIcon = document.querySelector('#theme-icon');
const drawTab = document.querySelector('#draw-tab');
const itemsTab = document.querySelector('#items-tab');
const drawPanel = document.querySelector('#draw-panel');
const itemsPanel = document.querySelector('#items-panel');
const itemsText = document.querySelector('#items-text');
const itemsSave = document.querySelector('#items-save');
const itemsSaveLabel = document.querySelector('#items-save-label');
const itemsStatus = document.querySelector('#items-status');
const sharedLists = document.querySelector('#shared-lists');
const loginPanel = document.querySelector('#login-panel');
const loginForm = document.querySelector('#login-form');
const loginUserSelect = document.querySelector('#login-user');
const loginPinInputs = [...document.querySelectorAll('.pin-digit')];
const loginStatus = document.querySelector('#login-status');
const appContent = document.querySelector('#app-content');
const accountActions = document.querySelector('#account-actions');
const brandName = document.querySelector('#brand-name');
const drawUser = document.querySelector('#draw-user');
const itemsOwner = document.querySelector('#items-owner');
const colors = ['#e96843', '#a9d7b1', '#f2c94c', '#70b8bd', '#e89a88', '#2e694d'];
const languageFlags = { en: '🇺🇸', de: '🇩🇪', uk: '🇺🇦' };
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const translations = {
  en: {
    documentTitle: 'Family Draw', brandName: 'Family Draw', brandLabel: 'Family Draw home', tagline: 'A little luck goes a long way',
    eyebrow: 'ONE TURN EACH', heading: 'Who’s your<br><span>lucky pick?</span>',
    userLabel: 'I’m', chooseName: 'Choose your name', chooseNameAria: 'Choose your name',
    prompt: 'Pick your name to get started.', ready: 'You’re up.', loading: 'Loading your draw…',
    picked: 'Your lucky pick is {name}.', wheelWaiting: 'Your wheel is waiting',
    wheelHint: 'Tap the wheel to spin.',
    wheelAria: 'Name selection wheel', canvasAria: 'Wheel of names', themeToggle: 'Dark theme',
    footerLeft: 'FAMILY DRAW CLUB', languageAria: 'Choose language',
    noNames: 'There are no other names on the wheel.', chooseFromList: 'Choose a name from the list.',
    couldNotLoad: 'Could not load your draw.', noNamesLeft: 'There are no names left for this draw.',
    couldNotTurn: 'The wheel could not turn.', chooseBeforeTurn: 'Choose your name before turning.',
    requestTooLarge: 'Request is too large.', couldNotSave: 'Could not save your list.', tabsAria: 'Page sections', drawTab: 'Draw', itemsTab: 'Items',
    itemsEyebrow: 'SHARED LISTS', itemsTitle: 'Things we’d like',
    itemsDescription: 'View everyone’s list and edit your own.',
    itemsBudgetNote: 'The suggested budget is €50. You’re welcome to spend more if you like.',
    itemsOwner: 'Your list',
    itemsTextLabel: 'Your items, one per line', itemsTextPlaceholder: 'Add one item per line',
    itemsSave: 'Save list', itemsSaving: 'Saving…', itemsSaved: 'List saved.', noItems: 'No items yet.',
    sharedListsLabel: 'Everyone’s item lists',
    pinRequired: 'Enter your 6-digit PIN.', pinInvalid: 'That PIN is incorrect.',
    pinDigit: 'PIN digit {digit} of 6',
    itemLimit: 'A list can contain at most 50 items.', itemLength: 'Items must contain 1 to 200 characters.',
    itemType: 'Every item must be text.', ownerRequired: 'Choose your name before saving.',
    loginEyebrow: 'YOUR FAMILY DRAW', loginTitle: 'Come on in',
    loginDescription: 'Sign in with your name and personal PIN to continue.', loginName: 'Your name',
    loginPin: 'Your PIN',
    loginWaiting: 'Checking your details…', loginInvalid: 'Name or PIN is incorrect.',
    logout: 'Sign out',
    drawUserLabel: 'Playing as'
  },
  de: {
    documentTitle: 'Familienziehung', brandName: 'Familienziehung', brandLabel: 'Familienziehung Startseite', tagline: 'Ein bisschen Glück gehört dazu',
    eyebrow: 'JEDER DREHT EINMAL', heading: 'Wen ziehst<br><span>du heute?</span>',
    userLabel: 'Ich bin', chooseName: 'Wähle deinen Namen', chooseNameAria: 'Wähle deinen Namen',
    prompt: 'Wähle deinen Namen, um zu starten.', ready: 'Du bist dran.', loading: 'Deine Ziehung wird geladen…',
    picked: 'Dein Glückstreffer ist {name}.', wheelWaiting: 'Das Rad wartet auf dich',
    wheelHint: 'Tippe auf das Rad, um es zu drehen.',
    wheelAria: 'Namensglücksrad', canvasAria: 'Glücksrad mit Namen', themeToggle: 'Dunkles Design',
    footerLeft: 'FAMILIENZIEHUNG', languageAria: 'Sprache wählen',
    noNames: 'Es sind keine anderen Namen auf dem Rad.', chooseFromList: 'Wähle einen Namen aus der Liste.',
    couldNotLoad: 'Deine Ziehung konnte nicht geladen werden.', noNamesLeft: 'Für diese Ziehung sind keine Namen mehr übrig.',
    couldNotTurn: 'Das Rad konnte nicht gedreht werden.', chooseBeforeTurn: 'Wähle vor dem Drehen deinen Namen.',
    requestTooLarge: 'Die Anfrage ist zu groß.', couldNotSave: 'Deine Liste konnte nicht gespeichert werden.', tabsAria: 'Seitenbereiche', drawTab: 'Ziehung', itemsTab: 'Wunschliste',
    itemsEyebrow: 'GEMEINSAME LISTEN', itemsTitle: 'Was wir uns wünschen',
    itemsDescription: 'Sieh dir alle Listen an und bearbeite deine eigene.',
    itemsBudgetNote: 'Das vorgeschlagene Budget beträgt 50 €. Wenn du möchtest, kannst du auch mehr ausgeben.',
    itemsOwner: 'Deine Liste',
    itemsTextLabel: 'Deine Wünsche, je einer pro Zeile', itemsTextPlaceholder: 'Einen Wunsch pro Zeile eingeben',
    itemsSave: 'Liste speichern', itemsSaving: 'Wird gespeichert…', itemsSaved: 'Liste gespeichert.', noItems: 'Noch keine Wünsche.',
    sharedListsLabel: 'Wunschlisten aller Personen',
    pinRequired: 'Gib deine 6-stellige PIN ein.', pinInvalid: 'Diese PIN ist falsch.',
    pinDigit: 'PIN-Ziffer {digit} von 6',
    itemLimit: 'Eine Liste darf höchstens 50 Einträge enthalten.', itemLength: 'Einträge müssen 1 bis 200 Zeichen lang sein.',
    itemType: 'Jeder Eintrag muss Text sein.', ownerRequired: 'Wähle vor dem Speichern deinen Namen.',
    loginEyebrow: 'DEINE FAMILIENZIEHUNG', loginTitle: 'Komm herein',
    loginDescription: 'Melde dich mit deinem Namen und deiner persönlichen PIN an.', loginName: 'Dein Name',
    loginPin: 'Deine PIN',
    loginWaiting: 'Anmeldedaten werden geprüft…', loginInvalid: 'Name oder PIN ist falsch.',
    logout: 'Abmelden',
    drawUserLabel: 'Du spielst als'
  },
  uk: {
    documentTitle: 'Сімейне жеребкування', brandName: 'Сімейне жеребкування', brandLabel: 'Головна сторінка сімейного жеребкування', tagline: 'Трохи вдачі не завадить',
    eyebrow: 'КОЖЕН КРУТИТЬ ОДИН РАЗ', heading: 'Кого тобі<br><span>обере вдача?</span>',
    userLabel: 'Я', chooseName: 'Обери своє ім’я', chooseNameAria: 'Обери своє ім’я',
    prompt: 'Обери своє ім’я, щоб почати.', ready: 'Твій хід.', loading: 'Завантажуємо результати…',
    picked: 'Твій результат: {name}.', wheelWaiting: 'Колесо чекає на тебе',
    wheelHint: 'Торкнися колеса, щоб крутити.',
    wheelAria: 'Колесо вибору імені', canvasAria: 'Колесо з іменами', themeToggle: 'Темна тема',
    footerLeft: 'СІМЕЙНЕ ЖЕРЕБКУВАННЯ', languageAria: 'Обрати мову',
    noNames: 'На колесі не залишилося інших імен.', chooseFromList: 'Обери ім’я зі списку.',
    couldNotLoad: 'Не вдалося завантажити результати.', noNamesLeft: 'Для цього жеребкування більше не залишилося імен.',
    couldNotTurn: 'Не вдалося прокрутити колесо.', chooseBeforeTurn: 'Спочатку обери своє ім’я.',
    requestTooLarge: 'Запит завеликий.', couldNotSave: 'Не вдалося зберегти твій список.', tabsAria: 'Розділи сторінки', drawTab: 'Жеребкування', itemsTab: 'Список',
    itemsEyebrow: 'СПІЛЬНІ СПИСКИ', itemsTitle: 'Чого нам хотілося б',
    itemsDescription: 'Переглядай спільні списки й змінюй власний.',
    itemsBudgetNote: 'Рекомендований бюджет — 50 €. За бажанням можна витратити більше.',
    itemsOwner: 'Твій список',
    itemsTextLabel: 'Твої побажання, кожне з нового рядка', itemsTextPlaceholder: 'Додавай по одному пункту в рядок',
    itemsSave: 'Зберегти список', itemsSaving: 'Зберігаємо…', itemsSaved: 'Список збережено.', noItems: 'Поки що список порожній.',
    sharedListsLabel: 'Списки всіх учасників',
    pinRequired: 'Введи PIN-код із 6 цифр.', pinInvalid: 'PIN-код неправильний.',
    pinDigit: 'Цифра PIN-коду {digit} з 6',
    itemLimit: 'У списку може бути не більше 50 пунктів.', itemLength: 'Пункт має містити від 1 до 200 символів.',
    itemType: 'Кожен пункт має бути текстом.', ownerRequired: 'Перед збереженням обери своє ім’я.',
    loginEyebrow: 'ТВОЄ СІМЕЙНЕ ЖЕРЕБКУВАННЯ', loginTitle: 'Заходь',
    loginDescription: 'Увійди за своїм ім’ям та особистим PIN-кодом.', loginName: 'Твоє ім’я',
    loginPin: 'Твій PIN-код',
    loginWaiting: 'Перевіряємо дані…', loginInvalid: 'Ім’я або PIN-код неправильні.',
    logout: 'Вийти',
    drawUserLabel: 'Граєш як'
  }
};
function displayName(personId) {
  const person = people.find((entry) => String(entry.id) === String(personId));
  if (!person) return '';
  return currentLanguage === 'uk' ? person.ua : person.en;
}

const errorTranslations = {
  'Choose a name from the list.': 'chooseFromList',
  'Could not load your draw.': 'couldNotLoad',
  'There are no names left for this draw.': 'noNamesLeft',
  'There are no other names on the wheel.': 'noNames',
  'The wheel could not turn.': 'couldNotTurn',
  'Choose your name before turning.': 'chooseBeforeTurn',
  'Request is too large.': 'requestTooLarge',
  'Enter your 6-digit PIN.': 'pinRequired',
  'That PIN is incorrect.': 'pinInvalid',
  'A list can contain at most 50 items.': 'itemLimit',
  'Items must contain 1 to 200 characters.': 'itemLength',
  'Every item must be text.': 'itemType',
  'Choose your name before saving.': 'ownerRequired',
  'List saved.': 'itemsSaved',
  'Could not save your list.': 'couldNotSave',
  'Name or PIN is incorrect.': 'loginInvalid',
  'Checking your details…': 'loginWaiting'
};

let people = [];
let wheelNames = [];
let currentRotation = 0;
let spinning = false;
const savedLanguage = localStorage.getItem('family-draw-language');
const browserLanguage = (navigator.language || '').split('-')[0].toLowerCase();
let currentLanguage = savedLanguage || (translations[browserLanguage] ? browserLanguage : 'de');
let currentTheme = document.documentElement.dataset.theme || 'light';
let currentAssignment = null;
let loadingState = false;
let currentStatus = '';
let itemLists = {};
let savingItems = false;
let currentItemsStatus = '';
let activeUser = null;
let loginSubmitting = false;
let currentLoginStatus = '';

if (!translations[currentLanguage]) currentLanguage = 'en';
if (currentTheme !== 'dark' && currentTheme !== 'light') currentTheme = 'light';

function t(key, values = {}) {
  return Object.entries(values).reduce(
    (text, [name, value]) => text.replace(`{${name}}`, value),
    translations[currentLanguage][key],
  );
}

function applyTheme() {
  const isDark = currentTheme === 'dark';
  const label = translations[currentLanguage].themeToggle;
  document.documentElement.dataset.theme = currentTheme;
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeToggle.setAttribute('aria-label', label);
  themeToggle.title = label;
  themeIcon.textContent = isDark ? '☀️' : '🌙';
  themeIcon.classList.toggle('theme-icon-moon', !isDark);
  document.querySelector('meta[name="theme-color"]').content = isDark ? '#151b18' : '#f6f5ee';
}

function renderItemLists() {
  sharedLists.replaceChildren();
  people.forEach((person) => {
    const personId = String(person.id);
    const section = document.createElement('section');
    section.className = 'shared-person';
    const heading = document.createElement('h2');
    heading.textContent = displayName(personId);
    section.append(heading);
    const entries = itemLists[personId] || [];
    if (entries.length) {
      const list = document.createElement('ul');
      entries.forEach((entry) => {
        const item = document.createElement('li');
        item.textContent = entry;
        list.append(item);
      });
      section.append(list);
    } else {
      const empty = document.createElement('p');
      empty.className = 'shared-empty';
      empty.textContent = t('noItems');
      section.append(empty);
    }
    sharedLists.append(section);
  });
}

function setItemsStatus(message = '') {
  currentItemsStatus = message;
  const key = errorTranslations[message];
  itemsStatus.textContent = key ? t(key) : message;
  itemsStatus.style.color = message && !key ? 'var(--green)' : '';
}

function setLoginStatus(message = '') {
  currentLoginStatus = message;
  const key = errorTranslations[message];
  loginStatus.textContent = key ? t(key) : message;
}

function showLogin(message = '') {
  activeUser = null;
  brandName.textContent = translations[currentLanguage].brandName;
  localStorage.removeItem('family-draw-user');
  loginPanel.hidden = false;
  appContent.hidden = true;
  accountActions.hidden = true;
  loginPinInputs.forEach((input) => { input.value = ''; });
  itemsText.value = '';
  itemsText.disabled = true;
  itemsSave.disabled = true;
  setWheelForUser('');
  showAssignment(null);
  setLoginStatus(message);
}

function activateAccount(account) {
  activeUser = String(account.user);
  brandName.textContent = displayName(activeUser);
  localStorage.setItem('family-draw-user', activeUser);
  if (account.items) itemLists = account.items;
  loginPanel.hidden = true;
  appContent.hidden = false;
  accountActions.hidden = false;
  drawUser.textContent = displayName(activeUser);
  itemsOwner.textContent = displayName(activeUser);
  itemsText.value = (itemLists[activeUser] || []).join('\n');
  itemsText.disabled = false;
  itemsSave.disabled = savingItems;
  setItemsStatus('');
  setActiveTab('draw', false);
  renderItemLists();
  setWheelForUser(activeUser, account.assignment);
  showAssignment(account.assignment || null);
  drawWheel();
}

function setActiveTab(tab, moveFocus = true) {
  const showItems = tab === 'items';
  drawTab.setAttribute('aria-selected', String(!showItems));
  itemsTab.setAttribute('aria-selected', String(showItems));
  drawPanel.hidden = showItems;
  itemsPanel.hidden = !showItems;
  if (moveFocus) (showItems ? itemsTab : drawTab).focus();
}

function applyLanguage() {
  const text = translations[currentLanguage];
  applyTheme();
  document.documentElement.lang = currentLanguage;
  document.title = text.documentTitle;
  document.querySelector('.wordmark').setAttribute('aria-label', activeUser ? displayName(activeUser) : text.brandLabel);
  brandName.textContent = activeUser ? displayName(activeUser) : text.brandName;
  document.querySelector('#topbar-note').textContent = text.tagline;
  document.querySelector('#eyebrow').textContent = text.eyebrow;
  document.querySelector('#page-title').innerHTML = text.heading;
  document.querySelector('#wheel-stage').setAttribute('aria-label', text.wheelAria);
  wheelHint.textContent = text.wheelHint;
  canvas.setAttribute('aria-label', text.canvasAria);
  document.querySelector('#footer-left').textContent = text.footerLeft;
  languageSelect.setAttribute('aria-label', text.languageAria);
  languageSelect.value = currentLanguage;
  languageFlag.textContent = languageFlags[currentLanguage];
  document.querySelector('#view-tabs').setAttribute('aria-label', text.tabsAria);
  drawTab.textContent = text.drawTab;
  itemsTab.textContent = text.itemsTab;
  document.querySelector('#items-eyebrow').textContent = text.itemsEyebrow;
  document.querySelector('#items-title').textContent = text.itemsTitle;
  document.querySelector('#items-description').textContent = text.itemsDescription;
  document.querySelector('#items-budget-note').textContent = text.itemsBudgetNote;
  document.querySelector('#items-owner-label').textContent = text.itemsOwner;
  document.querySelector('#items-owner').textContent = activeUser ? displayName(activeUser) : '';
  drawUser.textContent = activeUser ? displayName(activeUser) : '';
  Array.from(loginUserSelect.options).slice(1).forEach((option) => {
    option.textContent = displayName(option.value);
  });
  document.querySelector('#items-text-label').textContent = text.itemsTextLabel;
  itemsText.placeholder = text.itemsTextPlaceholder;
  itemsSaveLabel.textContent = t(savingItems ? 'itemsSaving' : 'itemsSave');
  sharedLists.setAttribute('aria-label', text.sharedListsLabel);
  document.querySelector('#login-eyebrow').textContent = text.loginEyebrow;
  document.querySelector('#login-title').textContent = text.loginTitle;
  document.querySelector('#login-description').textContent = text.loginDescription;
  document.querySelector('#login-name-label').textContent = text.loginName;
  loginUserSelect.setAttribute('aria-label', text.loginName);
  loginUserSelect.options[0].textContent = text.chooseName;
  document.querySelector('#login-pin-label').textContent = text.loginPin;
  loginPinInputs.forEach((input, index) => {
    input.setAttribute('aria-label', t('pinDigit', { digit: index + 1 }));
  });
  document.querySelector('#logout-button').textContent = text.logout;
  document.querySelector('#draw-user-label').textContent = text.drawUserLabel;
  if (loadingState) {
    result.textContent = t('loading');
  } else {
    showAssignment(currentAssignment);
  }
  showStatus(currentStatus);
  setLoginStatus(currentLoginStatus);
  setItemsStatus(currentItemsStatus);
  renderItemLists();
  drawWheel();
}

function showStatus(message = '') {
  currentStatus = message;
  const key = errorTranslations[message];
  statusMessage.textContent = key ? t(key) : message;
}

function drawWheel() {
  const bounds = canvas.getBoundingClientRect();
  if (!bounds.width) return;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(bounds.width * ratio);
  canvas.height = Math.round(bounds.height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  const size = bounds.width;
  const center = size / 2;
  const radius = center - 2;
  const theme = getComputedStyle(document.documentElement);
  const themeColor = (name) => theme.getPropertyValue(name).trim();
  context.clearRect(0, 0, size, size);

  if (!wheelNames.length) {
    context.beginPath();
    context.arc(center, center, radius, 0, Math.PI * 2);
    context.fillStyle = themeColor('--wheel-waiting-surface');
    context.fill();
    context.fillStyle = themeColor('--wheel-waiting-text');
    context.font = "500 13px 'Manrope', sans-serif";
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(t('wheelWaiting'), center, center);
    return;
  }

  const slice = (Math.PI * 2) / wheelNames.length;
  const startOffset = -Math.PI / 2 - slice / 2;
  const selectedIndex = currentAssignment === null
    ? -1
    : wheelNames.indexOf(String(currentAssignment));
  const hasSelection = selectedIndex >= 0;
  const normalFontSize = Math.max(9, Math.min(15, 170 / wheelNames.length));
  wheelNames.forEach((name, index) => {
    const start = startOffset + index * slice;
    const end = start + slice;
    context.beginPath();
    context.moveTo(center, center);
    context.arc(center, center, radius, start, end);
    context.closePath();
    context.fillStyle = hasSelection ? themeColor('--wheel-muted-slice') : colors[index % colors.length];
    context.fill();
    context.strokeStyle = themeColor('--wheel-divider');
    context.lineWidth = 2;
    context.stroke();
  });

  if (hasSelection) {
    const start = startOffset + selectedIndex * slice;
    const end = start + slice;
    context.save();
    context.beginPath();
    context.moveTo(center, center);
    context.arc(center, center, radius, start, end);
    context.closePath();
    context.fillStyle = themeColor('--wheel-selected');
    context.shadowColor = themeColor('--wheel-glow');
    context.shadowBlur = Math.max(18, size * 0.055);
    context.fill();
    context.shadowBlur = 0;
    context.strokeStyle = themeColor('--wheel-selected-outline');
    context.lineWidth = 4;
    context.stroke();
    context.restore();
  }

  wheelNames.forEach((name, index) => {
    const start = startOffset + index * slice;
    const isSelected = hasSelection && index === selectedIndex;
    context.save();
    context.translate(center, center);
    context.rotate(start + slice / 2 + Math.PI / 2);
    context.fillStyle = isSelected
      ? themeColor('--wheel-selected-text')
      : hasSelection ? themeColor('--wheel-muted-text') : index % colors.length === 5 ? themeColor('--wheel-selected-text') : themeColor('--ink');
    context.font = `700 ${normalFontSize * (isSelected ? 2 : 1)}px 'Manrope', sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    const maxWidth = radius * (isSelected ? 0.9 : 0.48);
    let label = displayName(name);
    if (!isSelected) {
      while (context.measureText(label).width > maxWidth && label.length > 3) {
        label = `${label.slice(0, -2)}…`;
      }
      context.fillText(label, 0, -radius * 0.66);
    } else {
      context.fillText(label, 0, -radius * 0.66, maxWidth);
    }
    context.restore();
  });

  context.beginPath();
  context.arc(center, center, Math.max(19, size * 0.075), 0, Math.PI * 2);
  context.fillStyle = themeColor('--wheel-center');
  context.fill();
  context.beginPath();
  context.arc(center, center, Math.max(5, size * 0.018), 0, Math.PI * 2);
  context.fillStyle = themeColor('--wheel-hub');
  context.fill();
}

function setWheelForUser(user, assignment = null) {
  wheelNames = people
    .map((person) => String(person.id))
    .filter((personId) => personId !== String(user));
  currentRotation = 0;
  canvas.style.transition = 'none';
  canvas.style.transform = 'rotate(0deg)';
  drawWheel();
  if (assignment) {
    const index = wheelNames.indexOf(String(assignment));
    if (index >= 0) {
      currentRotation = ((-index * 360 / wheelNames.length) % 360 + 360) % 360;
      canvas.style.transform = `rotate(${currentRotation}deg)`;
    }
  }
  requestAnimationFrame(() => {
    canvas.style.transition = '';
  });
}

function showAssignment(name) {
  currentAssignment = name;
  result.textContent = name ? t('picked', { name: displayName(name) }) : activeUser ? t('ready') : t('prompt');
  result.classList.toggle('has-result', Boolean(name));
  updateWheelActionState();
  drawWheel();
}

function updateWheelActionState() {
  const enabled = Boolean(activeUser && !currentAssignment && wheelNames.length && !spinning);
  wheelStage.setAttribute('aria-disabled', String(!enabled));
  wheelStage.tabIndex = enabled ? 0 : -1;
  wheelStage.classList.toggle('is-interactive', enabled);
  wheelHint.hidden = !enabled;
}

function animateTo(name) {
  const index = wheelNames.indexOf(String(name));
  const sliceDegrees = 360 / wheelNames.length;
  const currentAngle = ((currentRotation % 360) + 360) % 360;
  const stopOffset = ((-index * sliceDegrees - currentAngle) % 360 + 360) % 360;
  const turns = reducedMotion.matches ? 1 : 6;
  currentRotation += turns * 360 + stopOffset;
  canvas.style.transform = `rotate(${currentRotation}deg)`;
  return new Promise((resolve) => {
    const finish = (event) => {
      if (event && event.target !== canvas) return;
      canvas.removeEventListener('transitionend', finish);
      resolve();
    };
    canvas.addEventListener('transitionend', finish);
    if (reducedMotion.matches) requestAnimationFrame(() => finish());
  });
}

async function spin() {
  if (!activeUser || spinning || currentAssignment || !wheelNames.length) return;
  spinning = true;
  updateWheelActionState();
  showStatus('');
  try {
    const response = await fetch('/api/spin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: Number(activeUser) }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'The wheel could not turn.');
    await animateTo(data.assignment);
    showAssignment(data.assignment);
  } catch (error) {
    showStatus(error.message);
  } finally {
    spinning = false;
    updateWheelActionState();
  }
}

async function initialize() {
  try {
    const response = await fetch('/api/state');
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not load the name list.');
    people = data.people;
    people.forEach((person) => {
      const option = document.createElement('option');
      option.value = String(person.id);
      option.textContent = displayName(person.id);
      loginUserSelect.append(option);
    });
    itemLists = Object.fromEntries(people.map((person) => [String(person.id), []]));
    renderItemLists();
    const savedUser = localStorage.getItem('family-draw-user');
    if (!savedUser) {
      showLogin();
      return;
    }
    const savedPerson = people.find((person) => (
      String(person.id) === savedUser || person.ua === savedUser || person.en === savedUser
    ));
    if (!savedPerson) {
      showLogin();
      return;
    }
    const savedPersonId = String(savedPerson.id);
    localStorage.setItem('family-draw-user', savedPersonId);
    loginUserSelect.value = savedPersonId;
    const accountResponse = await fetch(`/api/account?user=${encodeURIComponent(savedPersonId)}`);
    const account = await accountResponse.json();
    if (!accountResponse.ok) throw new Error(account.error || 'Could not load your account.');
    loginUserSelect.value = String(account.user);
    activateAccount(account);
  } catch (error) {
    showLogin(error.message);
  }
}

function maybeSubmitLogin() {
  if (!loginUserSelect.value || loginPinInputs.some((input) => input.value.length !== 1)) return;
  if (!loginSubmitting) loginForm.requestSubmit();
}

loginUserSelect.addEventListener('change', () => {
  setLoginStatus('');
  maybeSubmitLogin();
});

loginPinInputs.forEach((input, index) => {
  input.addEventListener('focus', () => input.select());
  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g, '').slice(-1);
    setLoginStatus('');
    if (input.value && index < loginPinInputs.length - 1) {
      loginPinInputs[index + 1].focus();
    }
    maybeSubmitLogin();
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Backspace' && !input.value && index > 0) {
      event.preventDefault();
      loginPinInputs[index - 1].value = '';
      loginPinInputs[index - 1].focus();
    } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      loginPinInputs[index - 1].focus();
    } else if (event.key === 'ArrowRight' && index < loginPinInputs.length - 1) {
      event.preventDefault();
      loginPinInputs[index + 1].focus();
    }
  });
  input.addEventListener('paste', (event) => {
    const digits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!digits) return;
    event.preventDefault();
    loginPinInputs.forEach((digitInput, digitIndex) => {
      digitInput.value = digits[digitIndex] || '';
    });
    loginPinInputs[Math.min(digits.length, loginPinInputs.length - 1)].focus();
    setLoginStatus('');
    maybeSubmitLogin();
  });
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (loginSubmitting) return;
  const pin = loginPinInputs.map((input) => input.value).join('');
  if (!loginUserSelect.value || pin.length !== 6) return;
  loginSubmitting = true;
  loginUserSelect.disabled = true;
  loginPinInputs.forEach((input) => { input.disabled = true; });
  setLoginStatus('Checking your details…');
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: Number(loginUserSelect.value), pin }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Name or PIN is incorrect.');
    loginPinInputs.forEach((input) => { input.value = ''; });
    const accountResponse = await fetch(`/api/account?user=${encodeURIComponent(data.user)}`);
    const account = await accountResponse.json();
    if (!accountResponse.ok) throw new Error(account.error || 'Could not load your account.');
    loginUserSelect.value = String(account.user);
    activateAccount(account);
    setLoginStatus('');
  } catch (error) {
    setLoginStatus(error.message);
  } finally {
    loginSubmitting = false;
    loginUserSelect.disabled = false;
    loginPinInputs.forEach((input) => { input.disabled = false; });
  }
});

document.querySelector('#logout-button').addEventListener('click', () => {
  const previousUser = activeUser;
  loginUserSelect.value = previousUser || '';
  showLogin();
});

wheelStage.addEventListener('click', spin);
wheelStage.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    spin();
  }
});
drawTab.addEventListener('click', () => setActiveTab('draw'));
itemsTab.addEventListener('click', () => setActiveTab('items'));
itemsSave.addEventListener('click', async () => {
  if (!activeUser) {
    showLogin('Sign in to continue.');
    return;
  }
  const items = itemsText.value.split('\n').map((item) => item.trim()).filter(Boolean);
  savingItems = true;
  itemsSave.disabled = true;
  itemsSaveLabel.textContent = t('itemsSaving');
  setItemsStatus('');
  try {
    const response = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: Number(activeUser), items }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not save your list.');
    itemLists[activeUser] = data.items;
    renderItemLists();
    itemsText.value = data.items.join('\n');
    setItemsStatus('List saved.');
  } catch (error) {
    setItemsStatus(error.message);
  } finally {
    savingItems = false;
    itemsSave.disabled = !activeUser;
    itemsSaveLabel.textContent = t('itemsSave');
  }
});
document.querySelector('#view-tabs').addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Home' || event.key === 'End') {
    event.preventDefault();
    setActiveTab(event.key === 'ArrowLeft' || event.key === 'Home' ? 'draw' : 'items');
  }
});
languageSelect.addEventListener('change', () => {
  currentLanguage = languageSelect.value;
  localStorage.setItem('family-draw-language', currentLanguage);
  applyLanguage();
});
themeToggle.addEventListener('click', () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('family-draw-theme', currentTheme);
  applyTheme();
  drawWheel();
});
window.addEventListener('resize', drawWheel);
applyLanguage();
initialize();
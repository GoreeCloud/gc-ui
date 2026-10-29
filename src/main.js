/** GC UI playground interactions. No runtime dependencies. */
const root = document.documentElement;
const allowedRoutes = new Set(['overview', 'components', 'foundations', 'guidelines']);
const allowedAccents = new Set(['neutral', 'ocean', 'iris', 'lagoon', 'ember', 'moss']);
const store = {
  get(key) { try { return localStorage.getItem(`gc-ui:${key}`); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(`gc-ui:${key}`, value); } catch { /* private mode */ } },
};
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
const labels = {overview: 'Overview', components: 'Components', foundations: 'Foundations', guidelines: 'Guidelines'};
const safeMode = store.get('mode');
const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
root.dataset.mode = ['light', 'dark'].includes(safeMode) ? safeMode : systemDark ? 'dark' : 'light';
root.dataset.accent = allowedAccents.has(store.get('accent')) ? store.get('accent') : 'neutral';
root.dataset.material = store.get('material') === 'solid' ? 'solid' : 'translucent';

function toast(message) {
  const stack = $('#toast-stack');
  const item = document.createElement('div');
  item.className = 'gc-toast';
  item.textContent = message;
  stack.replaceChildren(item);
  window.setTimeout(() => { if (stack.contains(item)) item.remove(); }, 3000);
}
function setMode(mode) {
  root.dataset.mode = mode;
  store.set('mode', mode);
  const isDark = mode === 'dark';
  $('#mode-label').textContent = isDark ? 'Light appearance' : 'Dark appearance';
  $('#mode-toggle').setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  $('#top-mode-toggle').textContent = isDark ? '☀' : '☾';
  $('#top-mode-toggle').setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  document.querySelector('meta[name="theme-color"]').content = isDark ? '#10131e' : '#f7f8fc';
}
function setAccent(accent) {
  if (!allowedAccents.has(accent)) return;
  root.dataset.accent = accent;
  store.set('accent', accent);
  $$('[data-set-accent]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.setAccent === accent)));
  $('#palette-name').textContent = accent[0].toUpperCase() + accent.slice(1);
}
function setMaterial(translucent) {
  root.dataset.material = translucent ? 'translucent' : 'solid';
  $('#material-toggle').checked = translucent;
  store.set('material', root.dataset.material);
}
function navigate(route, focusMain = false) {
  const active = allowedRoutes.has(route) ? route : 'overview';
  $$('.gc-view').forEach(view => { view.hidden = view.id !== active; });
  $$('[data-route]').forEach(link => {
    const selected = link.dataset.route === active;
    if (selected) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
    link.classList.toggle('is-active', selected);
  });
  $('#current-page').textContent = labels[active];
  document.title = `${labels[active]} — GC UI`;
  if (focusMain) {
    $('#main-content').focus({preventScroll:true});
    window.scrollTo({top:0,behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
}
function currentHash() {return window.location.hash.slice(1).toLowerCase();}

setMode(root.dataset.mode);
setAccent(root.dataset.accent);
const accentRow = document.querySelector('.accent-row');
if (accentRow) {
  for (const accent of ['neutral', 'ocean']) {
    if (accentRow.querySelector('[data-set-accent="' + accent + '"]')) continue;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'accent-swatch swatch-' + accent;
    button.dataset.setAccent = accent;
    button.setAttribute('aria-label', accent === 'neutral' ? 'Neutral accent' : 'Ocean blue accent');
    button.setAttribute('aria-pressed', String(root.dataset.accent === accent));
    const check = document.createElement('span');
    check.className = 'checkmark'; check.setAttribute('aria-hidden', 'true');
    check.textContent = '✓'; button.append(check);
    button.addEventListener('click', () => setAccent(accent));
    accentRow.prepend(button);
  }
}

setMaterial(root.dataset.material === 'translucent');
navigate(currentHash());
window.addEventListener('hashchange', () => navigate(currentHash(), true));
$$('[data-go]').forEach(button => button.addEventListener('click', () => { window.location.hash = button.dataset.go; }));
$$('[data-set-accent]').forEach(button => button.addEventListener('click', () => setAccent(button.dataset.setAccent)));
['#mode-toggle', '#top-mode-toggle'].forEach(selector => $(selector).addEventListener('click', () => setMode(root.dataset.mode === 'dark' ? 'light' : 'dark')));
$('#material-toggle').addEventListener('change', e => setMaterial(e.target.checked));
const taskItems = $$('[data-task]');
function updateTasks() {
  const completed = taskItems.filter(item => item.checked).length;
  const progress = $('#task-progress');
  progress.setAttribute('aria-valuenow', String(completed));
  $('#progress-label').textContent = `${completed} of ${taskItems.length}`;
  $('#progress-fill').style.width = `${(completed / taskItems.length) * 100}%`;
}
taskItems.forEach(item => item.addEventListener('change', updateTasks));
updateTasks();
$$('[data-segment]').forEach(button => button.addEventListener('click', () => {
  $$('[data-segment]').forEach(seg => {
    const selected = seg === button;
    seg.classList.toggle('is-selected', selected);
    seg.setAttribute('aria-pressed', String(selected));
  });
  $('#segment-value').textContent = button.textContent;
}));
$('#progress-range').addEventListener('input', e => {
  $('#slider-percentage').textContent = `${e.target.value}%`;
  $('#slider-progress').style.width = `${e.target.value}%`;
});
const dialog = $('#welcome-dialog');
$$('[data-open-dialog]').forEach(button => button.addEventListener('click', () => dialog.showModal()));
$('[data-close-dialog]').addEventListener('click', () => dialog.close());
$('#dialog-explore').addEventListener('click', () => { dialog.close(); window.location.hash = 'components'; });
dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
$('#demo-primary').addEventListener('click', () => toast('Primary action completed.'));
$('#demo-secondary').addEventListener('click', () => toast('Secondary action completed.'));
$('#preview-add').addEventListener('click', () => toast('New item action — preview only.'));
$('#demo-submit').addEventListener('click', () => {
  const name = $('#demo-name').value.trim();
  if (!name) {
    $('#demo-name').focus();
    toast('Enter a project name first.');
    return;
  }
  toast(`“${name}” saved in the local preview.`);
  $('#demo-name').value = '';
  $('#demo-description').value = '';
});

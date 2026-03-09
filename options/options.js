const CLOSE_MODE_KEY = 'closeMode';
const DEFAULT_CLOSE_MODE = 'except_current';

function getSelectedCloseMode() {
  const checked = document.querySelector('input[name="closeMode"]:checked');
  return checked ? checked.value : DEFAULT_CLOSE_MODE;
}

function setSelectedCloseMode(mode) {
  const selector = `input[name="closeMode"][value="${mode}"]`;
  const input = document.querySelector(selector);
  if (input) {
    input.checked = true;
    return;
  }

  const fallback = document.querySelector(`input[name="closeMode"][value="${DEFAULT_CLOSE_MODE}"]`);
  if (fallback) {
    fallback.checked = true;
  }
}

async function restoreOptions() {
  try {
    const stored = await browser.storage.local.get(CLOSE_MODE_KEY);
    setSelectedCloseMode(stored[CLOSE_MODE_KEY] || DEFAULT_CLOSE_MODE);
  } catch (error) {
    console.error('Failed to restore options:', error);
    setSelectedCloseMode(DEFAULT_CLOSE_MODE);
  }
}

async function saveOptions() {
  const status = document.getElementById('status');
  const closeMode = getSelectedCloseMode();

  try {
    await browser.storage.local.set({ [CLOSE_MODE_KEY]: closeMode });
    return { ok: true };
  } catch (error) {
    console.error('Failed to save options:', error);
    return { ok: false, error };
  }
}

function showStatus(message, isError = false) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.style.color = isError ? '#c33' : '';
  setTimeout(() => {
    status.textContent = '';
    status.style.color = '';
  }, 1700);
}

async function executeSelectedMode(saveFirst) {
  const closeMode = getSelectedCloseMode();

  if (saveFirst) {
    const saveResult = await saveOptions();
    if (!saveResult.ok) {
      showStatus('Could not save. Try again.', true);
      return;
    }
  }

  try {
    await browser.runtime.sendMessage({ action: 'closeTabs', closeMode });
    showStatus(saveFirst ? 'Saved and executed.' : 'Executed.');
  } catch (error) {
    console.error('Failed to execute mode:', error);
    showStatus('Could not execute. Try again.', true);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  restoreOptions();
  document.getElementById('saveButton').addEventListener('click', async () => {
    const result = await saveOptions();
    showStatus(result.ok ? 'Saved.' : 'Could not save. Try again.', !result.ok);
  });
  document.getElementById('executeButton').addEventListener('click', () => executeSelectedMode(false));
  document.getElementById('saveExecuteButton').addEventListener('click', () => executeSelectedMode(true));
});

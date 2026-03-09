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
    status.textContent = 'Saved.';
    setTimeout(() => {
      status.textContent = '';
    }, 1500);
  } catch (error) {
    console.error('Failed to save options:', error);
    status.textContent = 'Could not save. Try again.';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  restoreOptions();
  document.getElementById('saveButton').addEventListener('click', saveOptions);
});

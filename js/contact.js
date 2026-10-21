// ── CONFIG ────────────────────────────────────────────
// Paste your Google Apps Script Web App URL here after deploying
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbxWEDTi_f-QtXlysODraRVzyYdZvVGOwVlfyRGu1mpVGyroWLwjV2yePWuB3wztp0-I0g/exec';

document.getElementById('contactForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const name    = document.getElementById('cfName').value.trim();
  const email   = document.getElementById('cfEmail').value.trim();
  const phone   = document.getElementById('cfPhone').value.trim();
  const reason  = document.getElementById('cfReason').value;
  const message = document.getElementById('cfMessage').value.trim();

  // Basic validation
  if (!name || !email || !reason || !message) {
    showError('Please fill in all required fields.');
    return;
  }

  // Show loading state
  document.getElementById('cfBtnText').style.display    = 'none';
  document.getElementById('cfBtnLoading').style.display = 'inline-flex';
  document.getElementById('cfSubmit').disabled = true;
  document.getElementById('cfError').style.display   = 'none';
  document.getElementById('cfSuccess').style.display = 'none';

  try {
    await fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sheet: 'Contact Messages',
        timestamp: new Date().toLocaleString(),
        name, email, phone, reason, message
      })
    });

    // Show success (no-cors means we can't read response — assume success)
    document.getElementById('cfSuccess').style.display = 'flex';
    document.getElementById('contactForm').reset();

  } catch (err) {
    showError('Could not send your message. Please email us directly at info@spursbasefoundation.org');
  } finally {
    document.getElementById('cfBtnText').style.display    = 'inline-flex';
    document.getElementById('cfBtnLoading').style.display = 'none';
    document.getElementById('cfSubmit').disabled = false;
  }
});

function showError(msg) {
  document.getElementById('cfErrorMsg').textContent = msg;
  document.getElementById('cfError').style.display = 'flex';
}

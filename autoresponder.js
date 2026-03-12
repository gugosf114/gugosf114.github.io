/**
 * MBC Autoresponder — Client-side helper
 * Sends form data to Google Apps Script to trigger confirmation emails.
 * Fire-and-forget: does not block or affect the Web3Forms submission.
 *
 * SETUP: Replace the URL below with your deployed Google Apps Script URL.
 */
const MBC_AUTORESPONDER_URL = 'https://script.google.com/macros/s/AKfycbwrOZsMnC7PDd2zYsPcmK83FMKcctUgOdiUCPIkGcR59CyDdyIkgjpcrZp4lCbLpOhatQ/exec';

function sendConfirmationEmail(data) {
    if (!MBC_AUTORESPONDER_URL || MBC_AUTORESPONDER_URL === 'YOUR_APPS_SCRIPT_URL_HERE') return;
    try {
        fetch(MBC_AUTORESPONDER_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(data)
        });
    } catch (e) {
        // Silent fail — confirmation email is non-critical
        // Web3Forms already delivered the order to George
    }
}

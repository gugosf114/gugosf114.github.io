/**
 * MBC Review Emailer — Google Apps Script
 *
 * PURPOSE: Receives order completion data from Thursday dashboard,
 * waits 24 hours, then sends a review request email.
 *
 * DEPLOY: Paste this into a NEW Google Apps Script project.
 *   1. Go to https://script.google.com → New Project
 *   2. Paste this code (replace everything)
 *   3. Deploy → New deployment → Web app
 *      - Execute as: Me
 *      - Who has access: Anyone
 *   4. Copy the deployment URL → give it to Claude for Thursday integration
 *
 * DO NOT put this in the same project as the autoresponder.
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var name = data.name || 'there';
    var email = data.email;

    if (!email) {
      return ContentService.createTextOutput('No email');
    }

    // Create a 24-hour delayed trigger
    var trigger = ScriptApp.newTrigger('sendReviewEmail')
      .timeBased()
      .after(24 * 60 * 60 * 1000) // 24 hours in milliseconds
      .create();

    // Store customer data keyed by trigger ID so the trigger knows who to email
    var props = PropertiesService.getScriptProperties();
    props.setProperty(trigger.getUniqueId(), JSON.stringify({
      name: name,
      email: email
    }));

    return ContentService.createTextOutput('OK');

  } catch (err) {
    return ContentService.createTextOutput('Error: ' + err.message);
  }
}

/**
 * Fires 24 hours after order completion. Sends the review request email.
 * Each trigger is one-time and self-cleaning.
 */
function sendReviewEmail(e) {
  var props = PropertiesService.getScriptProperties();
  var triggerId = e.triggerUid;
  var dataStr = props.getProperty(triggerId);

  if (!dataStr) return; // Safety: no data found for this trigger

  var data = JSON.parse(dataStr);

  var subject = 'How was everything? — My Baking Creations';

  var htmlBody = '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">' +
    '<p>Hi ' + data.name + ',</p>' +
    '<p>Just wanted to check in \u2014 we hope you loved everything!</p>' +
    '<p>If you had a great experience, we\'d really appreciate a quick review. ' +
    'As a small family bakery, every single review makes a huge difference and helps other customers find us.</p>' +
    '<div style="margin:24px 0;text-align:center">' +
      '<a href="https://search.google.com/local/writereview?placeid=ChIJ0xQdUuyHhYDlPC6PVKTvxA" ' +
        'style="display:inline-block;padding:12px 24px;background:#4285F4;color:white;text-decoration:none;border-radius:6px;margin:6px;font-weight:bold">' +
        'Google Review</a> ' +
      '<a href="https://www.yelp.com/writeareview/biz/my-baking-creations-daly-city" ' +
        'style="display:inline-block;padding:12px 24px;background:#D32323;color:white;text-decoration:none;border-radius:6px;margin:6px;font-weight:bold">' +
        'Yelp Review</a> ' +
      '<a href="https://www.facebook.com/mybakingcreations/reviews" ' +
        'style="display:inline-block;padding:12px 24px;background:#1877F2;color:white;text-decoration:none;border-radius:6px;margin:6px;font-weight:bold">' +
        'Facebook Review</a>' +
    '</div>' +
    '<p>Thank you so much for choosing us!</p>' +
    '<p>Yana Y.<br><strong>My Baking Creations</strong></p>' +
    '<hr style="border:none;border-top:1px solid #eee;margin:20px 0">' +
    '<p style="font-size:12px;color:#888">' +
      'My Baking Creations | <a href="tel:4155688060">(415) 568-8060</a> | info@mybakingcreations.com<br>' +
      '1096 Wildwood Ave, Daly City, CA 94015<br>' +
      '<a href="https://mybakingcreations.com">www.mybakingcreations.com</a>' +
    '</p>' +
    '</div>';

  // Send the review request email
  GmailApp.sendEmail(data.email, subject, '', {
    htmlBody: htmlBody,
    name: 'My Baking Creations'
  });

  // Clean up: delete stored data
  props.deleteProperty(triggerId);

  // Clean up: delete the one-time trigger
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getUniqueId() === triggerId) {
      ScriptApp.deleteTrigger(triggers[i]);
      break;
    }
  }
}

/**
 * Utility: Clean up any orphaned triggers (run manually if needed).
 * If triggers pile up due to errors, run this from the script editor.
 */
function cleanupOrphanedTriggers() {
  var props = PropertiesService.getScriptProperties();
  var triggers = ScriptApp.getProjectTriggers();
  var cleaned = 0;

  for (var i = 0; i < triggers.length; i++) {
    var id = triggers[i].getUniqueId();
    if (!props.getProperty(id)) {
      ScriptApp.deleteTrigger(triggers[i]);
      cleaned++;
    }
  }

  Logger.log('Cleaned ' + cleaned + ' orphaned triggers');
}

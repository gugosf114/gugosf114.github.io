/**
 * MY BAKING CREATIONS — Order Confirmation Autoresponder
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com
 * 2. Click "New Project"
 * 3. Paste this entire file into Code.gs (replace the default code)
 * 4. Click "Deploy" → "New deployment"
 * 5. Type = "Web app"
 * 6. Execute as: "Me" (your Workspace email)
 * 7. Who has access: "Anyone"
 * 8. Click "Deploy" — authorize when prompted
 * 9. Copy the Web App URL
 * 10. Paste it into autoresponder.js (replace YOUR_APPS_SCRIPT_URL_HERE)
 *
 * AFTER DEPLOYMENT: You can delete this .gs file from the repo.
 * The script lives in Google Apps Script, not on your website.
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var customerEmail = data.email;
    if (!customerEmail) {
      return ContentService.createTextOutput(JSON.stringify({success: false, error: 'No email'}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var customerName = data.name || 'there';
    var subject = 'Thanks for reaching out! — My Baking Creations';
    var htmlBody = buildEmail(customerName);

    GmailApp.sendEmail(customerEmail, subject, '', {
      htmlBody: htmlBody,
      name: 'My Baking Creations',
      replyTo: 'info@mybakingcreations.com'
    });

    return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(error) {
    console.error('Autoresponder error:', error);
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// For testing in Apps Script editor
function doGet(e) {
  return ContentService.createTextOutput('MBC Autoresponder is running.')
    .setMimeType(ContentService.MimeType.TEXT);
}

// ─── SINGLE EMAIL TEMPLATE ─────────────────────────────────

function buildEmail(name) {
  return '<!DOCTYPE html>'
    + '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>'
    + '<body style="margin:0;padding:0;background-color:#FFF8F0;font-family:Georgia,serif;">'
    + '<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFF8F0;padding:20px 0;">'
    + '<tr><td align="center">'
    + '<table width="600" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">'

    // Header
    + '<tr><td style="background-color:#8B4513;padding:30px 40px;text-align:center;">'
    + '<h1 style="margin:0;color:#FFFFFF;font-size:28px;font-weight:normal;letter-spacing:1px;">My Baking Creations</h1>'
    + '<p style="margin:5px 0 0;color:#D4A574;font-size:14px;letter-spacing:2px;">HANDCRAFTED WITH LOVE</p>'
    + '</td></tr>'

    // Body
    + '<tr><td style="padding:40px;">'
    + '<p style="color:#333;font-size:16px;line-height:1.7;margin:0 0 16px;">Hi ' + name + ',</p>'
    + '<p style="color:#333;font-size:16px;line-height:1.7;margin:0 0 16px;">Thanks for reaching out! We\'ve received your submission and will get back to you in under 24 hours.</p>'
    + '<p style="color:#333;font-size:16px;line-height:1.7;margin:0 0 24px;">If your event is coming up fast, call or text us directly: <strong>(415) 568-8060</strong></p>'
    + '<p style="color:#333;font-size:16px;line-height:1.7;margin:0 0 4px;">Talk soon,</p>'
    + '<p style="color:#8B4513;font-size:16px;line-height:1.7;margin:0;"><strong>Yana Y.</strong></p>'
    + '</td></tr>'

    // Footer
    + '<tr><td style="background-color:#F5E6D3;padding:25px 40px;text-align:center;border-top:2px solid #D4A574;">'
    + '<p style="margin:0 0 8px;color:#8B4513;font-size:14px;font-weight:bold;">My Baking Creations</p>'
    + '<p style="margin:0 0 4px;color:#666;font-size:13px;">(415) 568-8060 &nbsp;|&nbsp; info@mybakingcreations.com</p>'
    + '<p style="margin:12px 0 0;"><a href="https://www.mybakingcreations.com" style="color:#8B4513;text-decoration:none;font-size:13px;">www.mybakingcreations.com</a></p>'
    + '</td></tr>'

    + '</table></td></tr></table></body></html>';
}

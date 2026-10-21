# Spursbase Foundation — Form Setup Guide
## Google Sheets + Email Automation + Paystack

---

## 1. GOOGLE SHEETS SETUP

### Create two sheets:
1. **Volunteer Registrations** — for volunteer-register.html
2. **Graduate Registrations** — for graduate-register.html

### Column headers for Volunteer sheet (Row 1):
Timestamp | First Name | Last Name | DOB | Gender | Nationality | Volunteer Type | Occupation | Employer | Email | Phone | City | Country | Availability | Mode | Language | Interest | Emergency Name | Emergency Relationship | Emergency Phone | Emergency Alt Phone | Previous Volunteer | Previous Experience | Motivation | Skills | Source | Photo Consent | Payment Status | Paystack Ref | Donation Amount

### Column headers for Graduate sheet (Row 1):
Timestamp | First Name | Last Name | DOB | Gender | Email | Phone | City | Country | Qualification | Field of Study | Institution | Grad Year | Employment | Tier | Interest | Source | Motivation | Skills | Outcome | International | Payment Method | Payment Status | Paystack Ref | Programme

---

## 2. GOOGLE APPS SCRIPT (One script handles both sheets)

### Steps:
1. Open your Google Sheet
2. Go to **Extensions → Apps Script**
3. Delete any existing code
4. Paste the code below
5. Click **Deploy → New Deployment**
6. Type: **Web App** | Execute as: **Me** | Who has access: **Anyone**
7. Click Deploy, copy the Web App URL
8. Paste the URL into both HTML files where it says `YOUR_SCRIPT_ID`

```javascript
const VOLUNTEER_SHEET = 'Volunteer Registrations';
const GRADUATE_SHEET  = 'Graduate Registrations';
const EMAIL_FROM      = 'noreply@spursbasefoundation.org'; // optional — uses your Gmail

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss   = SpreadsheetApp.getActiveSpreadsheet();
    const sheetName = data.programme === 'Graduate Learning Program'
      ? GRADUATE_SHEET : VOLUNTEER_SHEET;
    const sheet = ss.getSheetByName(sheetName);

    // Build row from data keys in order
    const row = sheetName === GRADUATE_SHEET
      ? [data.timestamp, data.firstName, data.lastName, data.dob, data.gender,
         data.email, data.phone, data.city, data.country, data.qualification,
         data.fieldOfStudy, data.institution, data.gradYear, data.employment,
         data.tier, data.interest, data.source, data.motivation, data.skills,
         data.outcome, data.international, data.paymentMethod, data.paymentStatus || 'Pending',
         data.paystackRef || '', data.programme]
      : [data.timestamp, data.firstName, data.lastName, data.dob, data.gender,
         data.nationality, data.volunteerType, data.occupation, data.employer,
         data.email, data.phone, data.city, data.country, data.availability,
         data.mode, data.language, data.interest, data.emergencyName,
         data.emergencyRel, data.emergencyPhone, data.emergencyAlt,
         data.previousVolunteer, data.previousExperience, data.motivation,
         data.skills, data.source, data.photoConsent,
         data.paymentStatus || 'Local/No Payment', data.paystackRef || '', data.donation || 0];

    sheet.appendRow(row);
    sendConfirmationEmail(data);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendConfirmationEmail(data) {
  const name = data.firstName + ' ' + data.lastName;
  const isGraduate = data.programme === 'Graduate Learning Program';

  let subject, body;

  if (isGraduate) {
    const tierNames = { starter:'Starter (3 months)', professional:'Professional (6 months)', leadership:'Leadership (12 months)' };
    subject = 'Your Elevate Graduate Program Application — Spursbase Foundation';
    body = `
Dear ${name},

Thank you for applying to the Elevate Graduate Learning Program at Spursbase Foundation!

We have received your application for the ${tierNames[data.tier] || data.tier} tier.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT HAPPENS NEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. APPLICATION REVIEW
   Our team will review your application within 5 working days.

2. CONFIRMATION & ONBOARDING PACK
   Once confirmed, you will receive your full onboarding pack including
   your mentor details, programme schedule, and resources.

3. ORIENTATION SESSION
   You will be invited to a group orientation session to meet your
   cohort and programme coordinator before the programme begins.

${data.international ? `⚠ INTERNATIONAL PRICING
   As an international participant, our team will contact you separately
   to confirm your fee in EUR and provide a payment link.` : ''}

If you have any questions in the meantime, please contact us at:
elevate@spursbasefoundation.org

We look forward to walking this journey with you.

With purpose,
The Spursbase Foundation Team
www.spursbasefoundation.org
    `;
  } else {
    subject = 'Volunteer Application Received — Spursbase Foundation';
    body = `
Dear ${name},

Thank you for applying to volunteer with Spursbase Foundation!

We are excited that you want to be part of our mission to empower children and communities across Ghana.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT HAPPENS NEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. APPLICATION REVIEW
   Our volunteer coordinator will review your application within
   5 working days.

2. ORIENTATION
   You will receive an invitation to your orientation session — either
   virtually or in-person — where you'll learn about our programmes,
   values, and your specific role.

3. ONBOARDING
   You'll be matched with a programme coordinator who will guide you
   through the onboarding process before your placement begins.

${data.volunteerType === 'international' ? `💳 PAYMENT
   A contribution of €300 applies to international volunteers to cover
   coordination and training. If payment was not completed online,
   our team will be in touch with payment instructions.` : ''}

Questions? Email us at:
volunteer@spursbasefoundation.org

Thank you for choosing to make a difference.

With gratitude,
The Spursbase Foundation Team
www.spursbasefoundation.org
    `;
  }

  MailApp.sendEmail({
    to: data.email,
    subject: subject,
    body: body.trim()
  });

  // Also notify internal team
  MailApp.sendEmail({
    to: 'info@spursbasefoundation.org',
    subject: '[New ' + (isGraduate ? 'Graduate' : 'Volunteer') + ' Application] ' + name,
    body: 'New application received from ' + name + ' (' + data.email + ').\n\nDetails saved to Google Sheet.'
  });
}
```

---

## 3. PAYSTACK SETUP

1. Sign up / log in at **paystack.com**
2. Go to **Settings → API Keys & Webhooks**
3. Copy your **Live Public Key** (starts with `pk_live_`)
4. In `volunteer-register.html`: replace `pk_live_YOUR_PAYSTACK_KEY`
5. In `graduate-register.html`: replace `pk_live_YOUR_PAYSTACK_KEY`

### Currency notes:
- **Volunteer (international):** currently set to EUR — adjust in the Paystack `currency` field
- **Graduate tiers:** set to GHS — amounts are in pesewas (×100)
- For international graduate participants, the team confirms pricing manually via email

---

## 4. FILES TO ADD TO YOUR CSS FOLDER

Copy these into your `css/` folder:
- `volunteer.css`
- `volunteer-register.css`
- `collaborate.css`
- `graduate.css`
- `graduate-register.css`

---

## 5. LINKS SUMMARY

| Page | URL | Links to |
|------|-----|----------|
| involve.html | /involve.html | All 3 pages below |
| volunteer.html | /volunteer.html | volunteer-register.html |
| volunteer-register.html | /volunteer-register.html | Google Sheets + Paystack |
| collaborate.html | /collaborate.html | (enquiry form inline) |
| graduate.html | /graduate.html | graduate-register.html?tier=X |
| graduate-register.html | /graduate-register.html | Google Sheets + Paystack |


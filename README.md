# 🧹 Gmail Smart-Unsubscriber

A "Smart" Janitor for your Gmail inbox that unsubscribes you from newsletters you've stopped reading, while respecting your current interests.

## 🚀 The Problem
Most "Unsubscribe All" tools are blunt instruments. They don't know the difference between a newsletter you've truly abandoned and one you just haven't had time to read this week. 

## ✨ The "Smart" Solution
This script uses **engagement-based logic** rather than just age. It follows a two-step verification process:

1.  **The 6-Month Rule:** It scans for unread emails in your `Promotions` or `Social` categories that are older than 6 months.
2.  **The Engagement Check:** Before unsubscribing, it checks if you have **read** any email from that specific sender in the last 30 days. If you have, it assumes you still care and skips them.
3.  **Automatic Unsubscribe:** It extracts the hidden `List-Unsubscribe` metadata to "click" the unsubscribe link or send the required email.
4.  **Audit Trail:** Every action is logged to a dedicated **Google Sheet** so you can review what was removed.

## 🛠️ Setup Instructions

### 1. Create the Script
1.  Go to [script.google.com](https://script.google.com/).
2.  Create a **New Project**.
3.  Copy the code from `code.gs` in this repo and paste it into the editor.

### 2. Enable Services
1.  In the Apps Script editor, click the **+** next to **Services**.
2.  Add the **Drive API**.

### 3. Run & Authorize
1.  Click **Run** to initialize the script.
2.  Google will ask for permissions to manage your email and Drive. Since you are running your own code, click **Advanced** -> **Go to [Project Name] (unsafe)**.
3.  Check your Google Drive for a new file named `Gmail Unsubscribe Log`.

### 4. Set It on Autopilot
1.  Click the **Triggers** (Clock icon) on the left sidebar.
2.  Add a new trigger for the `smartUnsubscribeWithLogging` function.
3.  Set the event source to **Time-driven** -> **Day timer** -> **Midnight to 1 AM**.

## 📝 Configuration
You can customize the search query in the code:
```javascript
const threads = GmailApp.search('is:unread older_than:6m category:promotions');

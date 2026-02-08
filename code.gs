function smartUnsubscribeWithLogging() {
  // 1. Setup the Google Sheet Log
  const ssName = "Gmail Unsubscribe Log";
  let ss;
  const files = DriveApp.getFilesByName(ssName);
  
  if (files.hasNext()) {
    ss = SpreadsheetApp.open(files.next());
  } else {
    // Create the sheet if it's the first time running
    ss = SpreadsheetApp.create(ssName);
    ss.getSheets()[0].appendRow(["Date", "Sender Email", "Status", "Method/Link"]);
    ss.getSheets()[0].setFrozenRows(1);
  }
  const sheet = ss.getSheets()[0];

  // 2. Search for unread emails older than 6 months
  // You can adjust 'category:promotions' to include 'category:social' or any other filter logic if needed
  const threads = GmailApp.search('is:unread older_than:6m category:promotions');
  
  for (let i = 0; i < threads.length; i++) {
    const message = threads[i].getMessages()[0];
    let senderEmail = "";
    
    try {
      // Extract email address from the "From" header
      const fromHeader = message.getFrom();
      const match = fromHeader.match(/<([^>]+)>/);
      senderEmail = match ? match[1] : fromHeader;
    } catch(e) {
      senderEmail = "Unknown Sender";
    }

    // 3. Safety Check: Ensure no emails from this sender were read in the last 30 days
    const recentInteractions = GmailApp.search('from:' + senderEmail + ' is:read newer_than:30d');

    if (recentInteractions.length === 0) {
      const rawContent = message.getRawContent();
      const unsubHeader = rawContent.match(/^List-Unsubscribe: <(mailto:[^>]+|https?:[^>]+)>/m);

      if (unsubHeader) {
        const link = unsubHeader[1];
        try {
          if (link.startsWith('http')) {
            // Attempt to trigger the web-based unsubscribe
            UrlFetchApp.fetch(link, {muteHttpExceptions: true});
          } else if (link.startsWith('mailto')) {
            // Send the required unsubscribe email
            GmailApp.sendEmail(link.replace('mailto:', ''), "Unsubscribe", "Please unsubscribe me from this list.");
          }
          
          // Log Success and move thread to trash
          sheet.appendRow([new Date(), senderEmail, "Unsubscribed", link]);
          threads[i].moveToTrash(); 
          
        } catch (e) {
          // Log Errors (e.g., if a URL is broken)
          sheet.appendRow([new Date(), senderEmail, "Error: " + e.message, link]);
        }
      }
    }
  }
}

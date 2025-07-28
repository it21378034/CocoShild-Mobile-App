import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

admin.initializeApp();

// Email configuration
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: functions.config().email?.user || 'your-email@gmail.com',
    pass: functions.config().email?.password || 'your-app-password'
  }
});

// Cloud Function to send email notifications
export const sendEmailNotification = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message) {
      res.status(400).json({ error: 'Missing required fields: to, subject, message' });
      return;
    }

    const mailOptions = {
      from: functions.config().email?.user || 'your-email@gmail.com',
      to: to,
      subject: subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #698863; color: white; padding: 20px; text-align: center;">
            <h1>CocoShield Report Update</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2>${subject}</h2>
            <p style="line-height: 1.6; color: #333;">${message.replace(/\n/g, '<br>')}</p>
            <div style="margin-top: 30px; padding: 15px; background-color: #e8f5e8; border-left: 4px solid #698863;">
              <p style="margin: 0; color: #2d5016;">
                <strong>Please log in to the CocoShield app to view the full response and any additional details.</strong>
              </p>
            </div>
          </div>
          <div style="background-color: #f0f0f0; padding: 15px; text-align: center; color: #666; font-size: 12px;">
            <p>This is an automated message from CocoShield. Please do not reply to this email.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Cloud Function triggered when a new report is created
export const onReportCreated = functions.firestore
  .document('reportCases/{reportId}')
  .onCreate(async (snap, context) => {
    try {
      const reportData = snap.data();
      
      // Send notification to admin (you can customize this)
      const adminEmail = functions.config().admin?.email || 'admin@cocoshield.com';
      
      const mailOptions = {
        from: functions.config().email?.user || 'your-email@gmail.com',
        to: adminEmail,
        subject: `New Report: ${reportData.title}`,
        text: `A new report has been submitted:\n\nTitle: ${reportData.title}\nCategory: ${reportData.category}\nPriority: ${reportData.priority}\nUser: ${reportData.userEmail}\n\nDescription: ${reportData.description}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #ff9800; color: white; padding: 20px; text-align: center;">
              <h1>New Report Alert</h1>
            </div>
            <div style="padding: 20px; background-color: #f9f9f9;">
              <h2>${reportData.title}</h2>
              <div style="margin: 20px 0;">
                <p><strong>Category:</strong> ${reportData.category}</p>
                <p><strong>Priority:</strong> ${reportData.priority}</p>
                <p><strong>User:</strong> ${reportData.userEmail}</p>
                <p><strong>Location:</strong> ${reportData.location || 'Not specified'}</p>
              </div>
              <div style="background-color: #fff; padding: 15px; border-left: 4px solid #ff9800;">
                <h3>Description:</h3>
                <p style="line-height: 1.6;">${reportData.description}</p>
              </div>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      
      console.log('Admin notification sent for new report:', context.params.reportId);
    } catch (error) {
      console.error('Error sending admin notification:', error);
    }
  });

// Cloud Function triggered when a report is updated with admin reply
export const onReportUpdated = functions.firestore
  .document('reportCases/{reportId}')
  .onUpdate(async (change, context) => {
    try {
      const beforeData = change.before.data();
      const afterData = change.after.data();
      
      // Check if admin replies were added
      if (afterData.adminReplies && afterData.adminReplies.length > beforeData.adminReplies?.length) {
        const newReplies = afterData.adminReplies.slice(beforeData.adminReplies?.length || 0);
        
        for (const reply of newReplies) {
          // Send email notification to user
          const mailOptions = {
            from: functions.config().email?.user || 'your-email@gmail.com',
            to: afterData.userEmail,
            subject: `Reply to your report: ${afterData.title}`,
            text: `An admin has replied to your report "${afterData.title}":\n\n${reply.message}\n\nPlease log in to the app to view the full response.`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
                  <h1>Admin Reply Received</h1>
                </div>
                <div style="padding: 20px; background-color: #f9f9f9;">
                  <h2>Reply to: ${afterData.title}</h2>
                  <div style="margin: 20px 0;">
                    <p><strong>Admin:</strong> ${reply.adminName}</p>
                    <p><strong>Date:</strong> ${new Date(reply.timestamp).toLocaleString()}</p>
                  </div>
                  <div style="background-color: #fff; padding: 15px; border-left: 4px solid #4CAF50;">
                    <h3>Message:</h3>
                    <p style="line-height: 1.6;">${reply.message}</p>
                  </div>
                  <div style="margin-top: 30px; padding: 15px; background-color: #e8f5e8; border-left: 4px solid #4CAF50;">
                    <p style="margin: 0; color: #2d5016;">
                      <strong>Please log in to the CocoShield app to view the full response and any additional details.</strong>
                    </p>
                  </div>
                </div>
                <div style="background-color: #f0f0f0; padding: 15px; text-align: center; color: #666; font-size: 12px;">
                  <p>This is an automated message from CocoShield. Please do not reply to this email.</p>
                </div>
              </div>
            `
          };

          await transporter.sendMail(mailOptions);
        }
        
        console.log('User notification sent for admin reply:', context.params.reportId);
      }
    } catch (error) {
      console.error('Error sending user notification:', error);
    }
  }); 
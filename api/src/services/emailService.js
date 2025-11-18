import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('⚠️  SENDGRID_API_KEY not set. Email functionality will be disabled.');
}

/**
 * Send adoption application confirmation email to applicant
 */
export const sendApplicationConfirmationEmail = async (applicationData) => {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('📧 Email not sent (SendGrid not configured):', applicationData.email);
    return { success: false, message: 'SendGrid not configured' };
  }

  const { 
    email, 
    full_name, 
    animal_id,
    animal_name,
    application_id 
  } = applicationData;

  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@sfp-portal.com', // Your verified sender email
    subject: `Application Received - ${animal_name} (${animal_id})`,
    text: `
Dear ${full_name},

Thank you for your interest in adopting ${animal_name} (ID: ${animal_id})!

We have received your adoption application (Application ID: ${application_id}) and our team will review it shortly.

What happens next:
1. Our team will review your application (typically within 3-5 business days)
2. If approved, we'll schedule an interview with you
3. After a successful interview, we'll arrange a meet-and-greet with ${animal_name}
4. If everything goes well, we'll finalize the adoption!

You can track the status of your application by logging into your account on our website.

If you have any questions, please don't hesitate to contact us.

Thank you for choosing to adopt and giving ${animal_name} a loving home!

Best regards,
The SFP Portal Team

---
This is an automated email. Please do not reply to this email.
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 30px; background-color: #4C51A4; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                Application Received! 🎉
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Dear <strong>${full_name}</strong>,
              </p>
              
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Thank you for your interest in adopting <strong>${animal_name}</strong> (ID: ${animal_id})!
              </p>
              
              <div style="background-color: #f8f9fa; border-left: 4px solid #4C51A4; padding: 20px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; color: #4C51A4; font-weight: bold;">
                  Application ID: ${application_id}
                </p>
                <p style="margin: 0; color: #666666; font-size: 14px;">
                  Please save this ID for your records
                </p>
              </div>
              
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                We have received your adoption application and our team will review it shortly.
              </p>
              
              <h2 style="margin: 30px 0 20px 0; color: #4C51A4; font-size: 20px;">
                What happens next?
              </h2>
              
              <ol style="margin: 0 0 20px 0; padding-left: 20px; color: #333333; font-size: 16px; line-height: 1.8;">
                <li style="margin-bottom: 10px;">
                  Our team will review your application (typically within 3-5 business days)
                </li>
                <li style="margin-bottom: 10px;">
                  If approved, we'll schedule an interview with you
                </li>
                <li style="margin-bottom: 10px;">
                  After a successful interview, we'll arrange a meet-and-greet with ${animal_name}
                </li>
                <li style="margin-bottom: 10px;">
                  If everything goes well, we'll finalize the adoption!
                </li>
              </ol>
              
              <p style="margin: 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                You can track the status of your application by logging into your account on our website.
              </p>
              
              <p style="margin: 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                If you have any questions, please don't hesitate to contact us.
              </p>
              
              <p style="margin: 30px 0 0 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Thank you for choosing to adopt and giving ${animal_name} a loving home! ❤️
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                <strong>The SFP Portal Team</strong>
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                This is an automated email. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Confirmation email sent to ${email} for application ${application_id}`);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    if (error.response) {
      console.error('SendGrid error response:', error.response.body);
    }
    return { success: false, message: error.message };
  }
};

/**
 * Send application status update email
 */
export const sendApplicationStatusUpdateEmail = async (applicationData, newStatus) => {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('📧 Email not sent (SendGrid not configured):', applicationData.email);
    return { success: false, message: 'SendGrid not configured' };
  }

  const { 
    email, 
    full_name, 
    animal_id,
    animal_name,
    application_id 
  } = applicationData;

  let statusMessage = '';
  let statusColor = '#4C51A4';
  
  switch (newStatus) {
    case 'approved':
      statusMessage = 'Your application has been approved! We will contact you soon to schedule an interview.';
      statusColor = '#10b981';
      break;
    case 'rejected':
      statusMessage = 'Unfortunately, your application was not approved at this time. Thank you for your interest.';
      statusColor = '#ef4444';
      break;
    case 'interviewing':
      statusMessage = 'Your application has moved to the interview stage. We will contact you to schedule a time.';
      statusColor = '#f59e0b';
      break;
    case 'approved by interviewer':
      statusMessage = 'Great news! Your interview was successful. We will contact you with next steps.';
      statusColor = '#10b981';
      break;
    default:
      statusMessage = `Your application status has been updated to: ${newStatus}`;
  }

  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@sfp-portal.com',
    subject: `Application Update - ${animal_name} (${animal_id})`,
    text: `
Dear ${full_name},

Your adoption application for ${animal_name} (ID: ${animal_id}) has been updated.

Application ID: ${application_id}
New Status: ${newStatus}

${statusMessage}

You can view your application details by logging into your account on our website.

If you have any questions, please contact us.

Best regards,
The SFP Portal Team

---
This is an automated email. Please do not reply to this email.
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px 30px; background-color: ${statusColor}; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                Application Update
              </h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Dear <strong>${full_name}</strong>,
              </p>
              
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Your adoption application for <strong>${animal_name}</strong> (ID: ${animal_id}) has been updated.
              </p>
              
              <div style="background-color: #f8f9fa; border-left: 4px solid ${statusColor}; padding: 20px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                  Application ID: ${application_id}
                </p>
                <p style="margin: 0; color: ${statusColor}; font-weight: bold; font-size: 18px;">
                  New Status: ${newStatus.toUpperCase()}
                </p>
              </div>
              
              <p style="margin: 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                ${statusMessage}
              </p>
              
              <p style="margin: 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                You can view your application details by logging into your account on our website.
              </p>
              
              <p style="margin: 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                If you have any questions, please contact us.
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                <strong>The SFP Portal Team</strong>
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                This is an automated email. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Status update email sent to ${email} for application ${application_id}`);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    if (error.response) {
      console.error('SendGrid error response:', error.response.body);
    }
    return { success: false, message: error.message };
  }
};

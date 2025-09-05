export const getPasswordResetTemplate = (resetCode: string): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding: 20px 0;
          background-color: #dc3545;
          color: #ffffff;
          border-radius: 8px 8px 0 0;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 20px;
          text-align: center;
        }
        .content p {
          font-size: 16px;
          line-height: 1.5;
          margin: 0 0 20px;
        }
        .code {
          display: inline-block;
          padding: 10px 20px;
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 5px;
          font-size: 18px;
          font-weight: bold;
          color: #333;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #777;
        }
        @media only screen and (max-width: 600px) {
          .container {
            margin: 10px;
            padding: 10px;
          }
          .header h1 {
            font-size: 20px;
          }
          .content p {
            font-size: 14px;
          }
          .code {
            font-size: 16px;
            padding: 8px 16px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset Your Password</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>You requested to reset your password. Please use the following code to reset it:</p>
          <div class="code">${resetCode}</div>
          <p>This code is valid for the next 1 hour. If you did not request a password reset, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>This email was sent by Your App Name. If you did not request a password reset, please contact our support team.</p>
          <p>&copy; ${new Date().getFullYear()} Your App Name. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
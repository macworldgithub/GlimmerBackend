export const common_template = (name: string, content: HTMLElement | string) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OTP Verification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f7f7f7;
      margin: 0;
      padding: 0;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #fff;
      padding: 20px;
      box-shadow: 0 10px 10px rgba(0, 0, 0, 0.4);
      text-align: center;
    }
    .header {
      background-color: #4CAF50;
      padding: 10px 0;
      color: #fff;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }
    .header img {
      width: 100px;
    }
    .content {
      padding: 20px;
    }
    h1 {
      color: #333;
    }
    .otp {
      font-size: 24px;
      font-weight: bold;
      background-color: #f0f0f0;
      padding: 10px;
      border-radius: 8px;
      margin: 20px 0;
      display: inline-block;
    }
    .footer {
      margin-top: 20px;
      font-size: 12px;
      color: #999;
    }
    a {
      text-decoration: none;
      color: #4CAF50;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://www.glimmer.com.pk/_next/static/media/logo.44e52574.png" alt="Logo"> <!-- Replace with your logo URL -->
    </div>
    <div class="content">
      <h1>OTP Verification</h1>
      <p>Dear ${name},</p>
      <div>${content}</div>
    </div>
    <div class="footer">
      <p>&copy; 2025 Your Company. All rights reserved.</p>
      <p><a href="www.glimmer.com.pk">Visit our website</a></p>
    </div>
  </div>
</body>
</html>
    `
}

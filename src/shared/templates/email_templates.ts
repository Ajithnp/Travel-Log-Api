export const ACCOUNT_VERIFICATION = (otpCode: string, matter: string) => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
        🎉 Welcome to TravelLog!
      </h1>
      <p style="color: #e8f0fe; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
        Just one more step to get started
      </p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px; background-color: #ffffff; border: 1px solid #e1e8ed; border-top: none; border-radius: 0 0 12px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
          🔐
        </div>
      </div>

      <h2 style="color: #1a202c; font-size: 24px; font-weight: 600; text-align: center; margin: 0 0 20px 0;">
        ${matter}
      </h2>
            
      <p style="font-size: 16px; color: #4a5568; text-align: center; margin: 0 0 30px 0; line-height: 1.7;">
        Thank you for joining TravelLog! To complete your registration and start organizing your projects, please enter the verification code below in your application.
      </p>

      <!-- OTP Code Display -->
      <div style="text-align: center; margin: 40px 0;">
        <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border: 2px solid #667eea; border-radius: 12px; padding: 30px 20px; display: inline-block; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #4a5568; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
            Your Verification Code
          </p>
          <div style="font-size: 36px; font-weight: 700; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace; margin: 10px 0;">
            ${otpCode}
          </div>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #718096;">
            This code expires in 10 minutes
          </p>
        </div>
      </div>

      <!-- Instructions -->
      <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #4a5568; font-weight: 600;">
          How to use this code:
        </p>
        <ol style="margin: 0; padding-left: 20px; font-size: 14px; color: #718096;">
          <li style="margin-bottom: 5px;">Return to the TravelLog application</li>
          <li style="margin-bottom: 5px;">Enter the 6-digit code above</li>
          <li style="margin-bottom: 5px;">Click "Verify" to complete your registration</li>
        </ol>
      </div>

      <!-- Security Notice -->
      <div style="background-color: #fef5e7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f6ad55;">
        <p style="margin: 0; font-size: 13px; color: #744210;">
          <strong>Security tip:</strong> Never share this code with anyone. TravelLog will never ask for your verification code via email or phone.
        </p>
      </div>

      <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 14px; color: #718096; margin: 0 0 5px 0;">
          If you didn't create an account with TravelLog, you can safely ignore this email.
        </p>
        <p style="font-size: 16px; color: #2d3748; margin: 20px 0 5px 0; font-weight: 600;">
          Best regards,
        </p>
        <p style="font-size: 16px; color: #667eea; margin: 0; font-weight: 700;">
          The TravelLog Team 🚀
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px; color: #a0aec0; font-size: 12px;">
      <p style="margin: 0;">
        © 2024 TravelLog. All rights reserved.
      </p>
    </div>
  </div>
`;

export const WELCOME = (name: string) => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
        🎊 Welcome to Kanbanly!
      </h1>
      <p style="color: #e6fffa; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
        You're all set to boost your productivity
      </p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px; background-color: #ffffff; border: 1px solid #e1e8ed; border-top: none; border-radius: 0 0 12px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
          👋
        </div>
      </div>

      <h2 style="color: #1a202c; font-size: 24px; font-weight: 600; text-align: center; margin: 0 0 20px 0;">
        Hello ${name}!
      </h2>
      
      <p style="font-size: 16px; color: #4a5568; text-align: center; margin: 0 0 30px 0; line-height: 1.7;">
        We're thrilled to have you join the Kanbanly community! Your account is now active and ready to help you organize your tasks and projects with ease.
      </p>

      <!-- Features -->
      <div style="background-color: #f0fff4; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #48bb78;">
        <h3 style="color: #2f855a; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
          🚀 What's next?
        </h3>
        <ul style="margin: 0; padding-left: 20px; color: #2d3748;">
          <li style="margin-bottom: 8px;">Create your first project board</li>
          <li style="margin-bottom: 8px;">Invite team members to collaborate</li>
          <li style="margin-bottom: 8px;">Start organizing your tasks efficiently</li>
        </ul>
      </div>

      <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 16px; color: #2d3748; margin: 20px 0 5px 0; font-weight: 600;">
          Happy organizing!
        </p>
        <p style="font-size: 16px; color: #48bb78; margin: 0; font-weight: 700;">
          The Kanbanly Team 💚
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px; color: #a0aec0; font-size: 12px;">
      <p style="margin: 0;">
        © 2024 Kanbanly. All rights reserved.
      </p>
    </div>
  </div>
`;

export const PASSWORD_RESET = (name: string, resetLink: string) => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #fc8181 0%, #e53e3e 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
        🔐 Password Reset
      </h1>
      <p style="color: #fed7d7; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
        Let's get you back into your account
      </p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px; background-color: #ffffff; border: 1px solid #e1e8ed; border-top: none; border-radius: 0 0 12px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #fc8181 0%, #e53e3e 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
          🔑
        </div>
      </div>

      <h2 style="color: #1a202c; font-size: 24px; font-weight: 600; text-align: center; margin: 0 0 20px 0;">
        Hi ${name}!
      </h2>
      
      <p style="font-size: 16px; color: #4a5568; text-align: center; margin: 0 0 30px 0; line-height: 1.7;">
        We received a request to reset your password for your Kanbanly account. Click the button below to create a new password.
      </p>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="${resetLink}" style="
          background: linear-gradient(135deg, #fc8181 0%, #e53e3e 100%); 
          color: #ffffff; 
          padding: 16px 32px; 
          text-decoration: none; 
          font-size: 16px; 
          font-weight: 600;
          border-radius: 8px; 
          display: inline-block;
          box-shadow: 0 4px 12px rgba(252, 129, 129, 0.4);
          transition: all 0.3s ease;
          letter-spacing: 0.5px;
        ">
          🔄 Reset My Password
        </a>
      </div>

      <!-- Security Notice -->
      <div style="background-color: #fffaf0; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #ed8936;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #744210; font-weight: 600;">
          ⚠️ Security Notice
        </p>
        <p style="margin: 0; font-size: 14px; color: #744210; line-height: 1.6;">
          This password reset link will expire in 1 hour for security reasons. If you didn't request this reset, please ignore this email or contact our support team.
        </p>
      </div>

      <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 16px; color: #2d3748; margin: 20px 0 5px 0; font-weight: 600;">
          Best regards,
        </p>
        <p style="font-size: 16px; color: #fc8181; margin: 0; font-weight: 700;">
          The Kanbanly Team 🛡️
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px; color: #a0aec0; font-size: 12px;">
      <p style="margin: 0;">
        © 2024 Kanbanly. All rights reserved.
      </p>
    </div>
  </div>
`;

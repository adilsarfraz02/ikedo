// emails/VerifyEmail.js
import React from "react";
import { Html, Button } from "@react-email/components";

const VerifyEmail = ({ username, verificationUrl }) => {
  return (
    <Html>
      <h1>Hello {username},</h1>
      <p>
        Thank you for signing up! Please verify your email by clicking the
        button below:
      </p>
      <Button
        href={verificationUrl}
        style={{
          backgroundColor: "#007bff",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: "5px",
        }}>
        Verify Account
      </Button>
      <p>
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <a href={verificationUrl}>{verificationUrl}</a>
    </Html>
  );
};

export default VerifyEmail;

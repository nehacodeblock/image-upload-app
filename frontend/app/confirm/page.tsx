"use client";

import { useEffect, useState } from "react";
import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { useRouter, useSearchParams } from "next/navigation";

const client = new CognitoIdentityProviderClient({
  region: process.env.NEXT_PUBLIC_COGNITO_REGION,
});

export default function ConfirmSignupPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const emailFromUrl = searchParams.get("email");
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [searchParams]);
  const confirmSignup = async () => {
    try {
      const command = new ConfirmSignUpCommand({
        ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
        Username: email,
        ConfirmationCode: code,
      });

      await client.send(command);
      setMessage("Account verified successfully!");
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Confirm Signup</h1>

      <input
        className="border p-2 w-full mb-2"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="border p-2 w-full mb-2"
        placeholder="OTP Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <button
        className="bg-blue-600 text-white p-2 w-full"
        onClick={confirmSignup}
      >
        Verify
      </button>

      <p className="mt-3">{message}</p>
    </div>
  );
}

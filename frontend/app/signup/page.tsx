"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({
  region: process.env.NEXT_PUBLIC_COGNITO_REGION!,
});

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const router = useRouter();

  const signup = async () => {
    try {
      const command = new SignUpCommand({
        ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
        Username: email,
        Password: password,
        UserAttributes: [{ Name: "email", Value: email }],
      });

      await client.send(command);

      setMessage("Signup successful. Redirecting to confirmation...");

      // ✅ Navigate to confirm page with email
      setTimeout(() => {
        router.push(`/confirm?email=${encodeURIComponent(email)}`);
      }, 1000);
    } catch (err: any) {
      setMessage(` ${err.message}`);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Signup</h1>

      <input
        className="border p-2 w-full mb-2"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="border p-2 w-full mb-2"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="bg-blue-600 text-white p-2 w-full" onClick={signup}>
        Signup
      </button>

      <p className="mt-3">{message}</p>
    </div>
  );
}

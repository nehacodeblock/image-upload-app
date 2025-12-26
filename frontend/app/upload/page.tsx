"use client";

import { useEffect, useState } from "react";
import { getLoggedInUser } from "../utils/auth";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [username, setUserName] = useState("");

  useEffect(() => {
    const user = getLoggedInUser();
    if (user) {
      setUserName(user.username);
    }
  }, []);

  const uploadImage = async () => {
    if (!file) {
      setMessage("Please select a file");
      return;
    }

    try {
      // 1️⃣ Get access token from login
      const idToken = localStorage.getItem("idToken");

      if (!idToken) {
        setMessage("User not logged in");
        return;
      }

      console.log("file name", file.name);
      const uploadUrlApi =
        "https://gs5hgnyqm5.execute-api.ap-south-1.amazonaws.com/upload-url" +
        `?fileName=${encodeURIComponent(file.name)}`;

      // 2️⃣ Call backend to get presigned URL
      const res = await fetch(uploadUrlApi, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadUrl, key } = await res.json();

      console.log("upload url", uploadUrl);

      // 3️⃣ Upload file directly to S3
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Upload to S3 failed");
      }

      setMessage(`Image uploaded successfully for user, ${username}`);
      console.log("Uploaded S3 key:", key);
    } catch (err: any) {
      console.error(err);
      setMessage(`${err.message}`);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Upload Image</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />

      <button
        className="bg-purple-600 text-white p-2 w-full"
        onClick={uploadImage}
      >
        Upload
      </button>

      <p className="mt-3">{message}</p>
    </div>
  );
}

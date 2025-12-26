import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

const s3 = new S3Client({ region: process.env.AWS_REGION });

export const handler = async (event) => {
  // 🔐 User info from Cognito JWT
  const claims = event.requestContext.authorizer.jwt.claims;
  const userId = claims.sub;
  const username = claims.email;
  const fileName = event.queryStringParameters.fileName;

  console.log("username", username, userId, claims.email);

  // 🆔 Unique file name
  //const fileId = crypto.randomUUID();
  const key = `uploads/${userId}/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.UPLOAD_BUCKET,
    Key: key,
    Metadata: {
      userid: userId,
      username: username,
    },
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: 60, // seconds
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadUrl,
      key,
    }),
  };
};

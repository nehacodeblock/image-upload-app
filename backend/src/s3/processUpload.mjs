import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: "ap-south-1" });
const dynamodb = new DynamoDBClient({ region: "ap-south-1" });

export const handler = async (event) => {
  try {
    console.log("S3 Event:", JSON.stringify(event, null, 2));

    const record = event.Records[0];

    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
    const imageUrl = `https://${bucket}.s3.amazonaws.com/${key}`;

    const tableName = process.env.TABLE_NAME;

    console.log("Table:", tableName);
    console.log("Key:", key);
    console.log("Image URL:", imageUrl);

    const head = await s3.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    console.log(head.Metadata, "head---");

    const userId = head.Metadata?.userid ?? "unknown";
    const username = head.Metadata?.username ?? "unknown";
    console.log("metadata info", "userid", userId, "username", username);
    const command = new PutItemCommand({
      TableName: tableName,
      Item: {
        imageId: { S: key },
        imageUrl: { S: imageUrl },
        userId: { S: userId },
        username: { S: username },
        uploadedAt: { S: new Date().toISOString() },
      },
    });

    await dynamodb.send(command);

    console.log("Item inserted into DynamoDB");

    return { statusCode: 200 };
  } catch (error) {
    console.error("Error processing upload:", error);
    throw error;
  }
};

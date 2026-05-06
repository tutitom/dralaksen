import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: "https://s3.eu-central-003.backblazeb2.com",
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APP_KEY,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { fileName, contentType, body } = req.body;

  const buffer = Buffer.from(body, 'base64');

  try {
    await s3.send(new PutObjectCommand({
      Bucket: 'dralaksen',
      Key: fileName,
      Body: buffer,
      ContentType: contentType,
    }));

    res.json({ url: `https://f003.backblazeb2.com/file/dralaksen/${fileName}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
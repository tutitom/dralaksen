import { S3Client, DeleteObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";

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
  const { keys } = req.body;
  if (!Array.isArray(keys) || !keys.length) return res.status(400).json({ error: 'Mangler keys' });

  try {
    if (keys.length === 1) {
      await s3.send(new DeleteObjectCommand({ Bucket: 'dralaksen', Key: keys[0] }));
    } else {
      await s3.send(new DeleteObjectsCommand({
        Bucket: 'dralaksen',
        Delete: { Objects: keys.map(Key => ({ Key })) },
      }));
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

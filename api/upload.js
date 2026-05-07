import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

  const { fileName, contentType } = req.body;
  if (!fileName || !contentType) return res.status(400).json({ error: 'Mangler fileName eller contentType' });

  try {
    const command = new PutObjectCommand({
      Bucket: 'dralaksen',
      Key: fileName,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    res.json({
      presignedUrl,
      publicUrl: `https://f003.backblazeb2.com/file/dralaksen/${fileName}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

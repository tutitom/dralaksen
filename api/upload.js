export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { fileName, contentType, body } = req.body;

  const B2_KEY_ID = process.env.B2_KEY_ID;
  const B2_APP_KEY = process.env.B2_APP_KEY;
  const B2_BUCKET = 'dralaksen';
  const B2_ENDPOINT = 'https://s3.eu-central-003.backblazeb2.com';

  const credentials = Buffer.from(`${B2_KEY_ID}:${B2_APP_KEY}`).toString('base64');

  const b2Res = await fetch(`${B2_ENDPOINT}/${B2_BUCKET}/${fileName}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': contentType,
    },
    body: Buffer.from(body, 'base64'),
  });

  if (!b2Res.ok) return res.status(500).json({ error: 'Upload feilet' });

  res.json({ url: `https://f003.backblazeb2.com/file/${B2_BUCKET}/${fileName}` });
}
const keyId = process.env.B2_KEY_ID;
const appKey = process.env.B2_APP_KEY;

// 1. Autentiser
const authRes = await fetch("https://api.backblazeb2.com/b2api/v3/b2_authorize_account", {
  headers: {
    Authorization: "Basic " + Buffer.from(`${keyId}:${appKey}`).toString("base64"),
  },
});
const auth = await authRes.json();
if (!authRes.ok) { console.error("Auth feil:", auth); process.exit(1); }

const { authorizationToken, accountId } = auth;
const apiUrl = auth.apiInfo?.storageApi?.apiUrl ?? auth.apiUrl;

// 2. Finn bucket-ID
const bucketsRes = await fetch(`${apiUrl}/b2api/v3/b2_list_buckets?accountId=${accountId}&bucketName=dralaksen`, {
  headers: { Authorization: authorizationToken },
});
const buckets = await bucketsRes.json();
const bucket = buckets.buckets?.[0];
if (!bucket) { console.error("Fant ikke bucketen"); process.exit(1); }

// 3. Sett CORS-regler
const updateRes = await fetch(`${apiUrl}/b2api/v3/b2_update_bucket`, {
  method: "POST",
  headers: { Authorization: authorizationToken, "Content-Type": "application/json" },
  body: JSON.stringify({
    accountId,
    bucketId: bucket.bucketId,
    corsRules: [
      {
        corsRuleName: "allowUpload",
        allowedOrigins: ["https://dralaksen.sigurdberg.com", "http://localhost:3000"],
        allowedHeaders: ["*"],
        allowedOperations: ["s3_put", "s3_head", "s3_get"],
        exposeHeaders: [],
        maxAgeSeconds: 3600,
      },
    ],
  }),
});
const result = await updateRes.json();
if (!updateRes.ok) { console.error("Feil:", result); process.exit(1); }
console.log("CORS satt OK!");

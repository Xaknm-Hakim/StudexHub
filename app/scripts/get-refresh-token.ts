import { google } from "googleapis";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const CLIENT_ID = "1042533433552-nompp83ia3u7adq5ppruptnt6ksvvr9v.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "http://localhost";

async function main() {
  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/gmail.send"],
  });

  console.log("Open this URL in your browser:\n");
  console.log(authUrl);
  console.log("\nAfter approving, paste the full redirected URL here.\n");

  const rl = readline.createInterface({ input, output });
  const redirectedUrl = await rl.question("Redirected URL: ");
  rl.close();

  const url = new URL(redirectedUrl);
  const code = url.searchParams.get("code");

  if (!code) {
    throw new Error("No authorization code found in redirected URL.");
  }

  const { tokens } = await oauth2Client.getToken(code);

  console.log("\nAccess token:\n", tokens.access_token ?? "(none)");
  console.log("\nRefresh token:\n", tokens.refresh_token ?? "(none)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

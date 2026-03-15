import { google } from "googleapis";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

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

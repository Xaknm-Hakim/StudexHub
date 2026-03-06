import { google } from "googleapis";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export function getGoogleOAuthClient() {
  const clientId = required("GOOGLE_CLIENT_ID");
  const clientSecret = required("GOOGLE_CLIENT_SECRET");
  const redirectUri = required("GOOGLE_REDIRECT_URI");
  const refreshToken = required("GOOGLE_REFRESH_TOKEN");

  const oAuth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  oAuth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return oAuth2Client;
}

export function getGmailClient() {
  const auth = getGoogleOAuthClient();

  return google.gmail({
    version: "v1",
    auth,
  });
}

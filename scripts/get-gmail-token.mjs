/**
 * Google OAuth 2.0 Helper Script for Gmail API
 * Usage: node scripts/get-gmail-token.mjs
 * 
 * Generates an authorization URL, exchanges the authorization code for a Refresh Token,
 * and automatically updates .env with GMAIL_REFRESH_TOKEN.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env');

// Parse .env file
function loadEnv() {
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      env[key] = val;
    }
  }
  return env;
}

const env = loadEnv();
const clientId = env.Gmail_api_client_id || env.GMAIL_CLIENT_ID;
const clientSecret = env.Gmail_api_client_secret || env.GMAIL_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error('\n❌ Missing Google OAuth credentials in .env!');
  console.error('Please make sure Gmail_api_client_id and Gmail_api_client_secret are set in .env.\n');
  process.exit(1);
}

const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;
const SCOPE = 'https://www.googleapis.com/auth/gmail.send';

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(SCOPE)}&access_type=offline&prompt=consent`;

console.log('\n========================================================');
console.log('  🌸 Mayflower Restaurant — Gmail API OAuth 2.0 Setup');
console.log('========================================================\n');
console.log('Please open the following authorization URL in your browser:\n');
console.log(authUrl);
console.log('\nWaiting for Google authentication callback on port ' + PORT + '...\n');

// Update .env with refresh token
function saveRefreshToken(refreshToken) {
  let content = fs.readFileSync(envPath, 'utf8');
  if (content.includes('GMAIL_REFRESH_TOKEN=')) {
    content = content.replace(/GMAIL_REFRESH_TOKEN=.*/, `GMAIL_REFRESH_TOKEN=${refreshToken}`);
  } else {
    content += `\nGMAIL_REFRESH_TOKEN=${refreshToken}\n`;
  }
  fs.writeFileSync(envPath, content, 'utf8');
  console.log('✅ Successfully saved GMAIL_REFRESH_TOKEN to .env!');
}

async function exchangeCodeForTokens(code) {
  try {
    const params = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('❌ Token exchange failed:', data);
      return false;
    }

    if (data.refresh_token) {
      console.log('\n🎉 Successfully obtained Google OAuth 2.0 Refresh Token!');
      saveRefreshToken(data.refresh_token);
      return true;
    } else {
      console.warn('⚠️ No refresh token returned. If you already authorized previously, revoke access in Google Account Settings or pass prompt=consent.');
      return false;
    }
  } catch (err) {
    console.error('❌ Error exchanging code for tokens:', err);
    return false;
  }
}

// Temporary server to handle redirect
let hasHandled = false;

const server = http.createServer(async (req, res) => {
  if (req.url?.startsWith('/oauth2callback')) {
    if (hasHandled) {
      // Browser duplicate request / prefetch — already authorized
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<h1>Already authorized! You may close this tab.</h1>');
      return;
    }
    hasHandled = true;

    const url = new URL(req.url, `http://localhost:${PORT}`);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`<h1>Authentication Failed</h1><p>${error}</p>`);
      server.close();
      process.exit(1);
    }

    if (code) {
      const success = await exchangeCodeForTokens(code);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      if (success) {
        res.end(`
          <div style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #1B5E20;">🌸 Google OAuth 2.0 Authorized!</h1>
            <p>Your Gmail API Refresh Token has been saved to <code>.env</code>.</p>
            <p>You may now close this browser window.</p>
          </div>
        `);
      } else {
        res.end(`
          <div style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #B71C1C;">Authentication Warning</h1>
            <p>Could not capture refresh token. Please check terminal logs.</p>
          </div>
        `);
      }
      setTimeout(() => {
        server.close();
        process.exit(success ? 0 : 1);
      }, 1000);
    }
  }
});

server.listen(PORT).on('error', () => {
  console.log(`Port ${PORT} is busy. Manual code input available:`);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Paste the authorization code from URL after redirect: ', async (code) => {
    await exchangeCodeForTokens(code.trim());
    rl.close();
  });
});

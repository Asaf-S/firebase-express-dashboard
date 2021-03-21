import express from 'express';
import cors from 'cors';
import path from 'path';
import json_stringify_safe from 'json-stringify-safe';
import FB_admin from 'firebase-admin';

import fbdash from './index';

const PORT = process.env.PORT || 5000;

function convertToString(value: any) {
  const isError = (obj: any) => {
    return Object.prototype.toString.call(obj) === '[object Error]';
    // return obj && obj.stack && obj.message && typeof obj.stack === 'string'
    //        && typeof obj.message === 'string';
  };

  try {
    switch (typeof value) {
      case 'string':
      case 'boolean':
      case 'number':
      case 'undefined':
      default:
        return '' + value;
      case 'object':
        if (isError(value)) {
          return value.stack;
        } else {
          return json_stringify_safe(value, null, 2);
        }
    }
  } catch (e) {
    return '' + value;
  }
}

process.on('unhandledRejection', (reason, promise) => {
  console.error(`ERROR: Promise: ${promise}\nReason: ${convertToString(reason)}`);
});

process.on('uncaughtException', err => {
  console.error('---------\nUncaught Exception at: ' + err.stack + '\n---------');
});

console.log('WEB SERVER - STARTED!');

var fb_secrets = {
  project_id: '',
  private_key_id: '',
  private_key: '',
  client_email: '',
  client_id: '',
  client_x509_cert_url: '',
  databaseURL: '',
};

if (process.env.FB_SECRETS) {
  fb_secrets = JSON.parse(process.env.FB_SECRETS);
} else {
  fb_secrets.project_id = process.env.PROJECT_ID || '';
  fb_secrets.private_key_id = process.env.PRIVATE_KEY_ID || '';
  fb_secrets.private_key = process.env.PRIVATE_KEY || '';
  fb_secrets.client_email = process.env.CLIENT_EMAIL || '';
  fb_secrets.client_id = process.env.CLIENT_ID || '';
  fb_secrets.client_x509_cert_url = process.env.CLIENT_X509_CERT_URL || '';
  fb_secrets.databaseURL = process.env.DATABASEURL || '';
}

if (!fb_secrets.project_id) {
  throw new Error('Environment variable is missing!');
}

const serviceAccount: object = {
  type: 'service_account',
  project_id: fb_secrets.project_id,
  private_key_id: fb_secrets.private_key_id,
  private_key: fb_secrets.private_key,
  client_email: fb_secrets.client_email,
  client_id: fb_secrets.client_id,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: fb_secrets.client_x509_cert_url,
};

const firebaseInstance = FB_admin.initializeApp({
  credential: FB_admin.credential.cert(serviceAccount),
  databaseURL: fb_secrets.databaseURL,
});

const app = express()
  // Middlewares
  .use(cors())
  .use(express.json())
  .use(
    express.urlencoded({
      extended: true,
    })
  )

  // API routes
  .use('/fbdash', fbdash(firebaseInstance))

  // Wildcard
  .all('*', (req, res) => {
    const msg = 'Express - Wildcard was caught!';
    console.error(msg);
    res.sendStatus(404);
  });

app.listen(PORT, () => console.log(`Express - Listening on ${PORT}\nhttp://localhost:${PORT}`));

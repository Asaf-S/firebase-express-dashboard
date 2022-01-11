import express from 'express';
import cors from 'cors';
import json_stringify_safe from 'json-stringify-safe';
import FB_admin from 'firebase-admin';

import { FirebaseDashboardRoutes } from './index';
import { IOptions } from './lib/FirebaseAPIs';

const PORT = process.env.PORT || 5050;
const ROUTE_PATH = '/firebaseDashboard';

function convertToString(value: unknown) {
  const isError = (obj: unknown) => {
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
          const error1: Error = value as Error;
          return error1.stack || error1.message;
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

let fb_secrets = {
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
  fb_secrets.databaseURL = process.env.DATABASE_URL || '';
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

function manuallyCheckPermissions(req: express.Request, res: express.Response, next: express.NextFunction): unknown {
  if (process.env.NODE_ENV !== 'production' || req.header('Authorization') === 'Bearer ExpectedTokenOfAdmin') {
    return next();
  } else {
    return res.sendStatus(403);
  }
}

const FB_options: IOptions = {
  werePermissionsTakenCareOf: true, // This should be set to 'true' only when the permissions are actually taken care of and are tested
  webAPI: process.env.FIREBASE_WEB_API || '', // This allows making some more actions like Reset password, etc.
  isOwner: (userRecord: FB_admin.auth.UserRecord) => userRecord.customClaims?.isOwner,
};

const app = express()
  // Middleware
  .use(cors())
  .use(express.json())
  .use(
    express.urlencoded({
      extended: true,
    })
  )

  // API routes
  .use(ROUTE_PATH, manuallyCheckPermissions, FirebaseDashboardRoutes(firebaseInstance, FB_options))

  // Wildcard
  .all('*', (req: express.Request, res: express.Response) => {
    const msg = 'Express - Wildcard was caught!';
    console.error(msg + ' ' + req.path);
    return res.sendStatus(404);
  });

app.listen(PORT, () => console.log(`Express - Listening on ${PORT}\nhttp://localhost:${PORT}${ROUTE_PATH}`));

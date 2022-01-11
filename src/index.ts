'use strict';

import express from 'express';
import * as FirebaseAdmin from 'firebase-admin';

import { FirebaseAPIs, IOptions } from './lib/FirebaseAPIs';
export { FirebaseAPIs, IOptions } from './lib/FirebaseAPIs';
import { createRoutes } from './lib/middleware/express';

export function FirebaseDashboardRoutes(firebase: FirebaseAdmin.app.App, options?: IOptions): express.Router {
  const firebaseAPIs = new FirebaseAPIs(firebase, options);

  return createRoutes(firebaseAPIs);
}

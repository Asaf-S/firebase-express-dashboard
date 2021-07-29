'use strict';

import express from 'express';
import * as FirebaseAdmin from 'firebase-admin';
import FirebaseDashboard, { IOptions } from './lib/FirebaseDashboard';
import createRoutes from './lib/middleware/express';

export default function (firebase: FirebaseAdmin.app.App, options?: IOptions): express.Router {
  const firebaseDashboard = new FirebaseDashboard(firebase, options);

  return createRoutes(firebaseDashboard);
}

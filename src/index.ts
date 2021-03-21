'use strict';
import express from 'express';
import * as FirebaseAdmin from 'firebase-admin';
import FirebaseDashboard from './lib/FirebaseDashboard';
import createRoutes from './lib/middlewares/express';

export default function (firebase: FirebaseAdmin.app.App, options?: { middleware?: any }): express.Router {
  options = options || {};
  if (!options.middleware) {
    options.middleware = 'express';
  }

  const firebaseDashboard = new FirebaseDashboard(firebase, options);

  try {
    return createRoutes(firebaseDashboard);
  } catch (err) {
    throw new Error('No middleware available for ' + options.middleware);
  }
}

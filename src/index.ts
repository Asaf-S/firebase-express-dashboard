'use strict';
import path from 'path';
import * as FirebaseAdmin from 'firebase-admin';
import FirebaseDashboard from './lib/FirebaseDashboard';

export default function (firebase: FirebaseAdmin.app.App, options: { middleware?: any; }) {
  options = options || {};
  if (!options.middleware) {
    options.middleware = 'express';
  }

  const firebaseDashboard = new FirebaseDashboard(firebase, options);

  try {
    const middlewarePath = path.join(__dirname, 'lib/middlewares', options.middleware);
    return require(middlewarePath)(firebaseDashboard);
  } catch (err) {
    throw new Error('No middleware available for ' + options.middleware);
  }
};

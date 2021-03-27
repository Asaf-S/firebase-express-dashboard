'use strict';
import express from 'express';
import * as FirebaseAdmin from 'firebase-admin';
import FirebaseDashboard from './lib/FirebaseDashboard';
import createRoutes from './lib/middlewares/express';

export interface IOptions {
  middleware?: string;
  werePermissionsTakenCareOf?: boolean;
  recordsPerPageInUserList?: number;
}

function parseOptions(options: IOptions): IOptions {
  if (!options.middleware) {
    options.middleware = 'express';
  }

  if (!options.werePermissionsTakenCareOf) {
    console.warn(
      'WARNING! UNSECURED! ACTION REQUIRED!\n' +
        "The dashboard and APIs exposed by the 'firebase-express-dashboard' module allow any user to " +
        'receive all data and perform any action and therefore must be protected or must be used in development environments ' +
        'only (and not production)! Please refer to the documentation and demo for further information:\n' +
        'https://www.npmjs.com/package/firebase-express-dashboard\n' +
        'Once the permissions are taken care of, please pass { werePermissionsTakenCareOf: true } as the input options to ' +
        'surpress this message.'
    );
  }

  if (!options.recordsPerPageInUserList) {
    options.recordsPerPageInUserList = 100;
  }

  return options;
}

export default function (firebase: FirebaseAdmin.app.App, options?: IOptions): express.Router {
  const parsedOptions: IOptions = parseOptions(options || {});
  const firebaseDashboard = new FirebaseDashboard(firebase, parsedOptions);

  try {
    return createRoutes(firebaseDashboard);
  } catch (err) {
    throw new Error('No middleware available for ' + parsedOptions.middleware + `\nError: ${err.stack}`);
  }
}

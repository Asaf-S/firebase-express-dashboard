'use strict';

import * as FirebaseAdmin from 'firebase-admin';
import superagent from 'superagent';

// Docs:
// https://firebase.google.com/docs/auth/admin/manage-users#create_a_user
// https://firebase.google.com/docs/reference/rest/auth/

export interface IOptions {
  middleware?: string;
  werePermissionsTakenCareOf?: boolean;
  recordsPerPageInUserList?: number;
  webAPI?: string;
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

export default class FirebaseDashboard {
  private firebase: FirebaseAdmin.app.App;
  private options: IOptions;

  constructor(firebase: FirebaseAdmin.app.App, options?: IOptions) {
    this.options = parseOptions(options || {});
    if (firebase) {
      this.firebase = firebase;
      if (!this.options.webAPI) {
        console.warn(
          `The options that were provided to the 'firebase-express-dashboard' lacked the 'webAPI' field that is ` +
            `necessary for some Firebase APIs (e.g.reset - password).\nThe value of the 'webAPI' field should be retrieved from: ` +
            `Firebase project settings screen -> 'General' tab -> 'Your project' section -> 'Web API Key' field.`
        );
      }
    } else {
      throw new Error('Error: Input missing! Please provide a firebase app instance...');
    }
  }

  getProjectDetails() {
    const projectId =
      this.firebase.options.projectId ||
      ((this.firebase.options.credential as unknown) as { projectId: string })?.projectId ||
      '';

    return {
      shouldResetButtonBeDisabled: !this.options.webAPI,
      projectId,
    };
  }

  async listUsers(): Promise<object[]> {
    const userList: object[] = [];
    let nextPageToken: string | undefined;

    // TODO: support paging
    do {
      await this.firebase
        .auth()
        .listUsers(this.options.recordsPerPageInUserList, nextPageToken)
        .then(listUsersResult => {
          listUsersResult.users.forEach((userRecord: FirebaseAdmin.auth.UserRecord) => {
            userList.push(userRecord.toJSON());
          });

          nextPageToken = listUsersResult.pageToken;
        });
    } while (nextPageToken);

    return userList;
  }

  async createUser(
    email: string,
    password: string = '',
    displayName: string = '',
    photoURL: string = ''
  ): Promise<FirebaseAdmin.auth.UserRecord> {
    const details: { [key: string]: string } = {
      //   email: 'user@example.com',
      //   emailVerified: false,
      //   phoneNumber: '+11234567890',
      //   password: 'secretPassword',
      //   displayName: 'John Doe',
      //   photoURL: 'http://www.example.com/12345678/photo.png',
      //   disabled: false,
    };
    let shouldResetPasswordEmailBeSent: boolean = false;

    details.email = email;
    if (password) {
      details.password = password;
    } else {
      shouldResetPasswordEmailBeSent = true;
    }
    if (displayName) {
      details.displayName = displayName;
    }
    if (photoURL) {
      details.photoURL = photoURL; // E.g. 'http://www.example.com/12345678/photo.png'
    }

    const userRecord = await this.firebase.auth().createUser(details);
    console.log(`Successfully created new user: ${userRecord.uid}`);

    if (shouldResetPasswordEmailBeSent) {
      console.log('Sending a reset-password email to the new user');
      try {
        await this.resetPassword(email);
      } catch (err4) {
        console.error('Failed sending a reset-password email to the new user');
        // Do nothing.
      }
    }

    // TODO: Send verification email if password was received?

    return userRecord;
  }

  async resetPassword(email: string): Promise<boolean> {
    if (!this.options.webAPI) {
      throw new Error(`This action "Reset Password" requires the "options.webAPI" parameter which wasn't provided.`);
    }

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode`;
    const headers = {
      'Content-Type': 'application/json',
    };

    const queryParams = {
      key: `${this.options.webAPI}`,
    };

    const body = {
      email: `${email}`,
      requestType: 'PASSWORD_RESET',
    };

    return superagent
      .post(url)
      .set(headers)
      .query(queryParams)
      .send(JSON.stringify(body))
      .then(res => {
        return !!res.ok;
      })
      .catch(err => {
        throw new Error(`Error: ${err.stack}`);
      });
  }

  async deleteUser(uid: string): Promise<void> {
    await this.firebase.auth().deleteUser(uid);
    console.log(`Successfully deleted user: ${uid}`);
  }

  async getClaims(uid: string): Promise<{ [key: string]: any } | undefined | null> {
    const user = await this.firebase.auth().getUser(uid);
    return user.customClaims;
  }

  async updateCustomClaims(uid: string, claims: object): Promise<void> {
    // The new custom claims will propagate to the user's ID token the
    // next time a new one is issued.
    await this.firebase.auth().setCustomUserClaims(uid, claims); // claims example: { admin: true }
    console.log(
      `Successfully updated the following custom claims to user ${uid}:\n${claims && JSON.stringify(claims, null, 2)}`
    );
  }
}

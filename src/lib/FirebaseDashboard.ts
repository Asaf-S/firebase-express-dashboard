'use strict';
import * as FirebaseAdmin from 'firebase-admin';

// Docs: https://firebase.google.com/docs/auth/admin/manage-users#create_a_user

const PAGING_RESULTS_IN_ONE_PAGE = 1000;

export default class FirebaseDashboard {
  firebase: FirebaseAdmin.app.App;

  constructor(firebase: FirebaseAdmin.app.App, options: {}) {
    options = options || {};
    if (firebase) {
      this.firebase = firebase;
    } else {
      throw new Error('Error: Input missing! Please provide a firebase app instance...');
    }
  }

  async listUsers(): Promise<object[]> {
    const userList: object[] = [];
    let nextPageToken: string | undefined;

    do {
      await this.firebase
        .auth()
        .listUsers(PAGING_RESULTS_IN_ONE_PAGE, nextPageToken)
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
    password: string,
    displayName: string = '',
    photoURL: string = ''
  ): Promise<FirebaseAdmin.auth.UserRecord> {
    const details: { [key: string]: string } = {};
    details.email = email;
    details.password = password;
    if (displayName) {
      details.displayName = displayName;
    }
    if (photoURL) {
      details.photoURL = 'http://www.example.com/12345678/photo.png';
    }

    const userRecord = await this.firebase.auth().createUser(details);
    // TODO: Send verification email?
    // TODO: #1 Send reset password email?
    console.log('Successfully created new user:', userRecord.uid);
    return userRecord;
  }

  async deleteUser(uid: string): Promise<void> {
    await this.firebase.auth().deleteUser(uid);
    console.log('Successfully deleted user');
  }

  async updateCustomClaims(uid: string, claims: object): Promise<void> {
    // The new custom claims will propagate to the user's ID token the
    // next time a new one is issued.
    await this.firebase.auth().setCustomUserClaims(uid, claims); // claims example: { admin: true }
    console.log('Successfully updated the custom claims to user');
  }
}

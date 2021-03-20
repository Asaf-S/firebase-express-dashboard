'use strict';
import * as FirebaseAdmin from 'firebase-admin';

const PAGING_RESULTS_IN_ONE_PAGE = 1000;

export default class FirebaseDashboard {
  firebase: FirebaseAdmin.app.App;

  constructor(firebase: FirebaseAdmin.app.App, options: {}) {
    options = options || {};
    if (firebase) {
      this.firebase = firebase;
    } else {
      throw new Error('Wrong param!');
    }
  }

  async listUsers(): Promise<object[]> {
    const userList: object[] = [];
    let nextPageToken: string = '';

    do {
      await this.firebase.auth().listUsers(PAGING_RESULTS_IN_ONE_PAGE, nextPageToken).then((listUsersResult) => {

        listUsersResult.users.forEach((userRecord) => {
          userList.push(userRecord.toJSON());
        });

        nextPageToken = listUsersResult.pageToken;
      });
    } while (nextPageToken);

    return userList;
  }
};

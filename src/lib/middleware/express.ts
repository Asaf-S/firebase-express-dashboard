'use strict';
import path from 'path';
import express from 'express';
import { FirebaseAPIs } from '../FirebaseAPIs';
import fs from 'fs';
import { makeSureTrailingSlashInURL } from '../../utils';

const html: string = fs.readFileSync(__dirname + '/../../public/index.html', 'utf-8');

function handleFailure(res: express.Response, err: unknown) {
  if (err && err instanceof Error) {
    const errStr = `Error: ${err.stack}`;
    console.error(errStr);
    return res.json({
      isSuccessful: false,
      reason: errStr,
    });
  } else {
    throw err;
  }
}
export function createRoutes(firebaseApis: FirebaseAPIs): express.Router {
  const router = express.Router({ mergeParams: true });

  router.use(express.json());
  router.use(express.urlencoded({ extended: false }));

  router.get('/projectDetails', (req, res) => {
    const projectDetails = firebaseApis.getProjectDetails();
    return res.json({
      isSuccessful: Boolean(projectDetails),
      projectDetails,
    });
  });

  router.get('/users', (req, res) => {
    firebaseApis
      .listUsers()
      .then(userList => {
        return res.json({
          users: userList,
          hasIsOwnerField: firebaseApis.getProjectDetails().hasIsOwnerField,
          specialColumns: firebaseApis.getProjectDetails().specialColumns,
        });
      })
      .catch(err => {
        return res.status(500).json(err);
      });
  });

  router.get('/users/:userID/claims', async (req, res) => {
    const userID: string = req.params?.userID;

    try {
      const claims = await firebaseApis.getClaims(userID);
      console.log(`User with UID '${userID}' has the following claims: ${JSON.stringify(claims, null, 2)}`);

      return res.json({
        isSuccessful: true,
        userID,
        claims,
      });
    } catch (err) {
      return handleFailure(res, err);
    }
  });

  router.delete('/users/:userID', async (req, res) => {
    const userID: string = req.params?.userID;

    if (userID) {
      try {
        await firebaseApis.deleteUser(userID);
        console.log(`User ${userID} was successfully deleted!`);

        return res.json({
          isSuccessful: true,
          userID,
        });
      } catch (err) {
        return handleFailure(res, err);
      }
    } else {
      return res.json({
        isSuccessful: false,
        reason: 'User ID is missing!',
      });
    }
  });

  router.put('/users/:userID', async (req, res) => {
    const userID: string = req.params?.userID;

    if (userID) {
      try {
        if (req.body.newClaims) {
          // const claims: { [key: string]: string } = req.body.newClaims;
          // Object.keys(claims).forEach()
          await firebaseApis.updateCustomClaims(userID, req.body.newClaims);
          console.log(`The claims of user ${userID} was successfully updated!`);
        } else {
          const errMsg1 = `No claims were found on the request for user  ${userID}`;
          console.error(errMsg1);
          return res.json({
            isSuccessful: false,
            reason: errMsg1,
          });
        }

        return res.json({
          isSuccessful: true,
          userID,
          claims: req.body.newClaims,
        });
      } catch (err) {
        return handleFailure(res, err);
      }
    } else {
      return res.json({
        isSuccessful: false,
        reason: 'User ID is missing!',
      });
    }
  });

  router.post('/users/new', async (req, res) => {
    try {
      if (req.body) {
        if (!req.body.email) {
          return res.json({
            isSuccessful: false,
            reason: 'Email parameter is missing!',
          });
        }

        const newUser = await firebaseApis.createUser(
          req.body.email,
          req.body.password,
          req.body.displayName,
          req.body.photoURL
        );

        return res.json({
          isSuccessful: true,
          userID: newUser.uid,
        });
      } else {
        return res.json({
          isSuccessful: false,
          reason: "Request's body is empty!",
        });
      }
    } catch (err) {
      return handleFailure(res, err);
    }
  });

  router.post('/resetPassword', (req, res) => {
    return firebaseApis
      .resetPassword(req.body.email)
      .then(isSuccessful => {
        return res.json({
          isSuccessful,
        });
      })
      .catch(err => {
        console.error(`Error! ${err.stack}`);
        return res.json({
          isSuccessful: false,
          reason: err.stack,
        });
      });
  });

  router.post('/users/:userID/disabled', async (req, res) => {
    try {
      const userID: string = req.params?.userID;

      // Validations
      if (!userID) {
        return res.json({
          isSuccessful: false,
          reason: 'User ID is missing in the path!',
        });
      }

      if (!req.body) {
        return res.json({
          isSuccessful: false,
          reason: "Request's body is empty!",
        });
      }

      if (!('shouldBeDisabled' in req.body)) {
        return res.json({
          isSuccessful: false,
          reason: `'shouldBeDisabled' parameter (boolean) is missing in request!`,
        });
      }

      await firebaseApis.changeUserDisableEnableStatus(userID, req.body.shouldBeDisabled);

      return res.json({
        isSuccessful: true,
        userID,
      });
    } catch (err) {
      return handleFailure(res, err);
    }
  });

  router.post('/users/:userID/verified', async (req, res) => {
    try {
      const userID: string = req.params?.userID;

      // Validations
      if (!userID) {
        return res.json({
          isSuccessful: false,
          reason: 'User ID is missing in the path!',
        });
      }

      if (!req.body) {
        return res.json({
          isSuccessful: false,
          reason: "Request's body is empty!",
        });
      }

      if (!('shouldBeVerified' in req.body)) {
        return res.json({
          isSuccessful: false,
          reason: `'shouldBeVerified' parameter (boolean) is missing in request!`,
        });
      }

      await firebaseApis.changeUserEmailVerificationStatus(userID, req.body.shouldBeVerified);

      return res.json({
        isSuccessful: true,
        userID,
      });
    } catch (err) {
      return handleFailure(res, err);
    }
  });

  router.post('/users/:userID/displayName', async (req, res) => {
    try {
      const userID: string = req.params?.userID;

      // Validations
      if (!userID) {
        return res.json({
          isSuccessful: false,
          reason: 'User ID is missing in the path!',
        });
      }

      if (!req.body) {
        return res.json({
          isSuccessful: false,
          reason: "Request's body is empty!",
        });
      }

      if (!('displayName' in req.body)) {
        return res.json({
          isSuccessful: false,
          reason: `'displayName' parameter (boolean) is missing in request!`,
        });
      }

      if (typeof req.body.displayName !== 'string') {
        return res.json({
          isSuccessful: false,
          reason: `'displayName' parameter (boolean) is not a string!`,
        });
      }

      await firebaseApis.updateProfile(userID, { displayName: req.body.displayName });

      return res.json({
        isSuccessful: true,
        userID,
      });
    } catch (err) {
      return handleFailure(res, err);
    }
  });

  router.get('/', (req, res) => {
    let token: string = '';
    let authType: string = '';
    const requestHost = req.get('host');
    const isSecure: boolean =
      req.secure ||
      (!requestHost?.toLowerCase().includes('localhost') && !requestHost?.toLowerCase().includes('127.0.0.1'));
    const requestProtocol = req.protocol + (isSecure ? 's' : '');
    const requestURL = makeSureTrailingSlashInURL(`${requestProtocol}://${requestHost}${req.originalUrl}`);

    /* Bearer token */
    const bearer = 'bearer ';
    if (req.headers.authorization?.toLowerCase().startsWith(bearer)) {
      token = req.headers.authorization.substring(bearer.length);
      authType = 'bearer';
    }
    return res.send(
      html
        .replace('TOKEN_TOKEN_TOKEN', token)
        .replace('AUTH_TYPE__AUTH_TYPE__AUTH_TYPE', authType)
        .replace('BASE_URL__BASE_URL__BASE_URL', requestURL)
    );
  });

  router.use(express.static(path.join(__dirname, '../../public')));

  return router;
}

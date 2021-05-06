'use strict';
import path from 'path';
import express from 'express';
import FirebaseDashboard from '../FirebaseDashboard';

export default function createRoutes(firebaseDashboard: FirebaseDashboard): express.Router {
  const router = express.Router({ mergeParams: true });

  router.use(express.json());
  router.use(express.urlencoded({ extended: false }));

  router.get('/projectDetails', (req, res) => {
    const projectDetails = firebaseDashboard.getProjectDetails();
    return res.json({
      isSuccessful: Boolean(projectDetails),
      projectDetails,
    });
  });

  router.get('/users', (req, res) => {
    firebaseDashboard
      .listUsers()
      .then(userList => {
        return res.json(userList);
      })
      .catch(err => {
        return res.status(500).json(err);
      });
  });

  router.delete('/users/:userID', async (req, res) => {
    const userID: string = req.params?.userID;

    if (userID) {
      try {
        await firebaseDashboard.deleteUser(userID);
        console.log(`User ${userID} was successfully deleted!`);

        return res.json({
          isSuccessful: true,
          userID,
        });
      } catch (err) {
        console.error(`Error: ${err.stack}`);
        return res.json({
          isSuccessful: false,
          reason: err.message,
        });
      }
    } else {
      return res.json({
        isSuccessful: false,
        reason: 'User ID is missing!',
      });
    }
  });

  router.post('/users/:userID', async (req, res) => {
    const userID: string = req.params?.userID;

    if (userID) {
      try {
        if (req.body.newClaims) {
          // const claims: { [key: string]: string } = req.body.newClaims;
          // Object.keys(claims).forEach()
          await firebaseDashboard.updateCustomClaims(userID, req.body.claims);
          console.log(`The claims of user ${userID} was successfully updated!`);
        }

        return res.json({
          isSuccessful: true,
          userID,
        });
      } catch (err) {
        console.error(`Error: ${err.stack}`);
        return res.json({
          isSuccessful: false,
          reason: err.message,
        });
      }
    } else {
      return res.json({
        isSuccessful: false,
        reason: 'User ID is missing!',
      });
    }
  });

  router.post('/users/new', async (req, res) => {
    if (req.body) {
      if (!req.body.email) {
        return res.json({
          isSuccessful: false,
          reason: 'Email paramter is missing!',
        });
      }

      const newUser = await firebaseDashboard.createUser(
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
  });

  router.post('/resetpassword', (req: express.Request, res) => {
    return firebaseDashboard
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

  router.use(express.static(path.join(__dirname, '../../public')));

  return router;
}

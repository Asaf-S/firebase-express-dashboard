'use strict';
import path from 'path';
import express from 'express';
import FirebaseDashboard from '../FirebaseDashboard';

export default function createRoutes(firebaseDashboard: FirebaseDashboard): express.Router {
  const router = express.Router({ mergeParams: true });

  router.use(express.json());
  router.use(express.urlencoded({ extended: false }));

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
  router.delete('/users/:userUID', (req, res) => {
    // firebaseDashboard.listUsers().then(userList => {
    //   return res.json(userList);
    // }).catch((err) => {
    //   return res.status(500).json(err);
    // });
  });
  router.post('users/new', (req, res) => {
    // admin
    // .auth()
    // .createUser({
    //   email: 'user@example.com',
    //   emailVerified: false,
    //   phoneNumber: '+11234567890',
    //   password: 'secretPassword',
    //   displayName: 'John Doe',
    //   photoURL: 'http://www.example.com/12345678/photo.png',
    //   disabled: false,
    // })
    // .then((userRecord) => {
    //   // See the UserRecord reference doc for the contents of userRecord.
    //   console.log('Successfully created new user:', userRecord.uid);
    // })
    // .catch((error) => {
    //   console.log('Error creating new user:', error);
    // });
  });
  router.use(express.static(path.join(__dirname, '../../public')));

  return router;
}

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
  router.delete('/users/:userId', (req, res) => {
    // firebaseDashboard.listUsers().then(userList => {
    //   return res.json(userList);
    // }).catch((err) => {
    //   return res.status(500).json(err);
    // });
  });
  router.use('/', express.static(path.join(__dirname, '../../public')));

  return router;
}

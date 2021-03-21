# firebase-express-dashboard

Add CRUD routes that manage Firebase Auth to Expess.js.

Also, it exposes a dashboard to manage it all.

![Dashboard](./screenshot.png)

```typescript
import firebaseDashboard from 'firebase-express-dashboard';

const serviceAccount: object = {
  type: 'service_account',
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY,
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
};

const firebaseInstance = FB_admin.initializeApp({
  credential: FB_admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASEURL,
});

const app = express()
  // Middlewares
  .use(express.json())
  .use(
    express.urlencoded({
      extended: true,
    })
  )

  // API routes
  .use('/firebaseDashboard', firebaseDashboard(firebaseInstance))

  // Wildcard
  .all('*', (req, res) => {
    const msg = 'Express - Wildcard was caught!';
    console.error(msg);
    res.sendStatus(404);
  });

app.listen(PORT, () => console.log(`Express - Listening on ${PORT}`));
```

Then navigate to either of the following to see the dashboard's UI:

- http://localhost:5000/firebaseDashboard (if the port for development is 5000)
- [https://your_domain.com/firebaseDashboard](https://your_domain.com/firebaseDashboard)

The dashboard's UI can be also be embedded in other websites using an iframe.

# Need help with the development of:

- Better UI (React.js cannot be placed in a sub-folder without knowing the sub-folder's name during the build time, if someone can solve this somehow it can help the UI a lot).
- Create new user.
- Update custom claims.
- Add custom claims to users' table.
- Delete user.
- Reset password.
- Send verification email.
- Disable user.

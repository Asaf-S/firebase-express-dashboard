import * as FirebaseAdmin from 'firebase-admin';
export interface IEnhancedUserRecord extends FirebaseAdmin.auth.UserRecord {
  isOwner?: boolean;
}

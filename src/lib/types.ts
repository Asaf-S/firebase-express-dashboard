import * as FirebaseAdmin from 'firebase-admin';
import { ICustomColumn } from './FirebaseAPIs';
export interface IEnhancedUserRecord extends FirebaseAdmin.auth.UserRecord {
  isOwner?: boolean;
  specialValues?: Record<string, string>;
}

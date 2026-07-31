import { MongoClient, Db } from 'mongodb';
import crypto from 'crypto';

// Vercel functions are stateless and can be reused between invocations while
// warm — cache the connected client on the global object (not module scope)
// so hot-reload in dev and warm serverless instances in production both
// reuse the same connection instead of opening a new one per request.
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var _mongoIndexesReady: Promise<void> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri).connect();
  }
  return global._mongoClientPromise;
}

async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  const db = client.db(process.env.MONGODB_DB_NAME || 'sdkplayground');

  // Ensure indexes exist once per warm instance — cheapest place to do this
  // without a separate init step every route has to remember to call.
  // createIndex is idempotent, so this is safe to race across concurrent
  // cold-start requests.
  if (!global._mongoIndexesReady) {
    global._mongoIndexesReady = (async () => {
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('users').createIndex({ api_key: 1 });
    })();
  }
  await global._mongoIndexesReady;

  return db;
}

// User operations

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  api_key: string | null;
  sdk_access_granted: number;
  created_at: string;
}

interface UserDoc {
  _id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  api_key: string | null;
  sdk_access_granted: boolean;
  created_at: string;
  updated_at: string;
}

function toUser(doc: UserDoc): User {
  return {
    id: doc._id,
    email: doc.email,
    first_name: doc.first_name,
    last_name: doc.last_name,
    api_key: doc.api_key,
    sdk_access_granted: doc.sdk_access_granted ? 1 : 0,
    created_at: doc.created_at,
  };
}

async function users() {
  const db = await getDb();
  return db.collection<UserDoc>('users');
}

/** Ensures the indexes this module relies on exist. Safe to call repeatedly —
 * getDb() already does this lazily on first use, so this is only needed if
 * something wants to force a connection + index check eagerly (e.g. a
 * health-check route). */
export async function initDatabase(): Promise<void> {
  await getDb();
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function createUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<User> {
  const now = new Date().toISOString();
  const doc: UserDoc = {
    _id: crypto.randomUUID(),
    email,
    password_hash: hashPassword(password),
    first_name: firstName,
    last_name: lastName,
    api_key: null,
    sdk_access_granted: false,
    created_at: now,
    updated_at: now,
  };
  const col = await users();
  await col.insertOne(doc);
  return toUser(doc);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const col = await users();
  const doc = await col.findOne({ email });
  return doc ? toUser(doc) : null;
}

export async function getUserById(id: string): Promise<User | null> {
  const col = await users();
  const doc = await col.findOne({ _id: id });
  return doc ? toUser(doc) : null;
}

export async function verifyPassword(email: string, password: string): Promise<User | null> {
  const col = await users();
  const doc = await col.findOne({ email, password_hash: hashPassword(password) });
  return doc ? toUser(doc) : null;
}

export async function updateUserApiKey(userId: string, apiKey: string): Promise<void> {
  const col = await users();
  await col.updateOne(
    { _id: userId },
    { $set: { api_key: apiKey, updated_at: new Date().toISOString() } }
  );
}

export async function grantSdkAccess(userId: string): Promise<User | null> {
  const col = await users();
  const doc = await col.findOneAndUpdate(
    { _id: userId },
    { $set: { sdk_access_granted: true, updated_at: new Date().toISOString() } },
    { returnDocument: 'after' }
  );
  return doc ? toUser(doc) : null;
}

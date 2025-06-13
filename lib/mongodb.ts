import { MongoClient, ServerApiVersion } from "mongodb";

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient>;

export async function connectToDatabase(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables.");
  }
  if (!dbName) {
    throw new Error("MONGODB_DB is not defined in environment variables.");
  }

  if (client) {
    return client;
  }

  if (!clientPromise) {
    clientPromise = MongoClient.connect(uri, {
      serverApi: ServerApiVersion.v1,
      tls: true,
      retryWrites: true,
    });
  }

  client = await clientPromise;
  return client;
}

export const dbName = process.env.MONGODB_DB;

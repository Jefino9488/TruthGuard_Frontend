import { MongoClient, ServerApiVersion } from "mongodb";

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient>;

export async function connectToDatabase(): Promise<MongoClient> {
  const uri = process.env.NEXT_PUBLIC_MONGODB_URI;
  const dbName = process.env.NEXT_PUBLIC_MONGODB_DB;

  if (!uri) {
    throw new Error("NEXT_PUBLIC_MONGODB_URI is not defined in environment variables.");
  }
  if (!dbName) {
    throw new Error("NEXT_PUBLIC_MONGODB_DB is not defined in environment variables.");
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

export const dbName = process.env.NEXT_PUBLIC_MONGODB_DB;

import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI as string;
const dbName = process.env.MONGODB_DB as string;

if (!uri) {
  throw new Error("MONGODB_URI is not defined in environment variables.");
}
if (!dbName) {
  throw new Error("MONGODB_DB is not defined in environment variables.");
}

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient>;

export async function connectToDatabase(): Promise<MongoClient> {
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

export { dbName };


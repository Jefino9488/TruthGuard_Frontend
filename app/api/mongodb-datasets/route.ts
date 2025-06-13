// app/api/mongodb-datasets/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, dbName } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
    try {
        const client = await connectToDatabase();
        const db = client.db(dbName);

        // Your dataset fetching logic here
        const datasets = await db.collection("datasets").find({}).toArray();

        return NextResponse.json({ success: true, datasets });
    } catch (error) {
        console.error("Error fetching datasets:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch datasets" },
            { status: 500 }
        );
    }
}
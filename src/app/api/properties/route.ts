import { NextResponse } from "next/server";
import { connectDB } from "../lib/dbconnection";

export async function GET(req, res) {
  try {
    // Connect to MongoDB
    const db = await connectDB(req);

    const properties = await db.collection("properties").find({}).toArray();

    return NextResponse.json(
      {
        properties,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

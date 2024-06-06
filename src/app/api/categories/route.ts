import { NextResponse } from "next/server";
import { connectDB } from "../lib/dbconnection";

export async function POST(req, res) {
  try {
    // Connect to MongoDB
    const db = await connectDB(req);
    const { name, imagePath } = await req.json(); // Extract imagePath from request body

    // Insert new category into the database
    const result = await db.collection("categories").insertOne({
      name,
      imagePath, // Add imagePath to the inserted document
    });

    return NextResponse.json(
      {
        message: "Category added successfully",
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

export async function GET(req, res) {
  try {
    // Connect to MongoDB
    const db = await connectDB(req);

    // Fetch categories from the database
    const categories = await db.collection("categories").find().toArray();

    return NextResponse.json(
      {
        categories,
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

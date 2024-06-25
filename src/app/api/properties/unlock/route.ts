import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { connectDB } from "../../lib/dbconnection";

export async function POST(req) {
  try {
    const { userId, propertyId } = await req.json();
    if (!userId || !propertyId) {
      return NextResponse.json(
        { error: "userId and propertyId are required" },
        { status: 400 }
      );
    }
    // Connect to MongoDB
    const db = await connectDB(req); // Ensure your connection function is properly implemented

    // Check if the property is already unlocked by the user
    const existingUnlockLog = await db
      .collection("unlocked_properties")
      .findOne({
        userId: userId,
        propertyId: new ObjectId(propertyId),
      });

    if (existingUnlockLog) {
      return NextResponse.json(
        { message: "Property already unlocked by the user" },
        { status: 200 }
      );
    }

    // Create a new unlock log document
    const unlockLog = {
      userId: userId,
      propertyId: new ObjectId(propertyId),
      unlockTimestamp: new Date(),
    };

    // Insert the unlock log document into user_unlock_logs collection
    const insertResult = await db
      .collection("unlocked_properties")
      .insertOne(unlockLog);

    return NextResponse.json(
      {
        message: "Property added successfully",
        propertyId: insertResult.insertedId, // Return the ID of the newly inserted product
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

export async function GET(req) {
  try {
    const userId = new URL(req.url)?.searchParams?.get("userId");
    if (!userId) {
      return NextResponse.json({ message: "Missing userId" }, { status: 405 });
    }

    if (!userId) {
      return NextResponse.json(
        { error: "userId parameter is required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const db = await connectDB(req); // Ensure your connection function is properly implemented

    // Fetch unlocked properties for the specified userId
    const unlockedProperties = await db
      .collection("unlocked_properties")
      .find({ userId: userId })
      .toArray();

    return NextResponse.json({ unlockedProperties }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

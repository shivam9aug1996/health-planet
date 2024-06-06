// Import required libraries
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { connectDB } from "../lib/dbconnection";

// Function to handle wishlist operations for a specific user
export async function POST(req, res) {
  try {
    const { action, productId, userId } = await req.json();
    // Connect to MongoDB
    const db = await connectDB(req);
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Perform action based on the provided parameters
    switch (action) {
      case "add":
        // Check if productId is provided
        if (!productId) {
          return NextResponse.json(
            { error: "ProductId is required for 'add' action" },
            { status: 400 }
          );
        }

        // Fetch the product from the database using productId
        const product = await db
          .collection("products")
          .findOne({ _id: new ObjectId(productId) });

        if (!product) {
          return NextResponse.json(
            { error: "Product not found" },
            { status: 404 }
          );
        }

        // Add the product to the user's wishlist
        await db.collection("wishlist").updateOne(
          { userId, productId },
          {
            $set: {
              userId,
              productId,
            },
          },
          { upsert: true } // Upsert to insert if not exists, update if exists
        );

        return NextResponse.json(
          { message: "Product added to wishlist successfully" },
          { status: 200 }
        );
      case "remove":
        // Check if productId is provided
        if (!productId) {
          return NextResponse.json(
            { error: "ProductId is required for 'remove' action" },
            { status: 400 }
          );
        }

        // Remove the product from the user's wishlist
        await db.collection("wishlist").deleteOne({ userId, productId });

        return NextResponse.json(
          { message: "Product removed from wishlist successfully" },
          { status: 200 }
        );
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.log("iu7y6tredfghj", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// Function to handle fetching the wishlist for a specific user
export async function GET(req, res) {
  try {
    const userId = new URL(req.url)?.searchParams?.get("userId");
    if (!userId) {
      return NextResponse.json({ message: "Missing userId" }, { status: 405 });
    }

    // Connect to MongoDB
    const db = await connectDB(req);

    // Fetch the user's wishlist from the database
    const wishlistItems = await db
      .collection("wishlist")
      .find({ userId })
      .toArray();

    // Fetch product data for each item in the wishlist
    const wishlistWithProductData = await Promise.all(
      wishlistItems.map(async (wishlistItem) => {
        const product = await db
          .collection("products")
          .findOne({ _id: new ObjectId(wishlistItem.productId) });
        if (product) {
          return {
            ...wishlistItem,
            product,
          };
        } else {
          return wishlistItem; // If product is not found, return the wishlist item without product data
        }
      })
    );

    return NextResponse.json(
      { wishlistItems: wishlistWithProductData },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

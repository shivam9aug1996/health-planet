import { NextResponse } from "next/server";
import { connectDB } from "../lib/dbconnection";

// POST route to add a product to a category
export async function POST(req, res) {
  try {
    const { categoryId, name, price, discountedPrice, imagePath } =
      await req.json();

    // Connect to MongoDB
    const db = await connectDB(req);

    // Insert the product into the database
    const result = await db.collection("products").insertOne({
      categoryId,
      name,
      price,
      discountedPrice,
      imagePath,
    });

    return NextResponse.json(
      {
        message: "Product added successfully",
        productId: result.insertedId, // Return the ID of the newly inserted product
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

// GET route to fetch products by category
export async function GET(req, res) {
  try {
    const categoryId = new URL(req.url)?.searchParams?.get("categoryId");
    if (!categoryId) {
      return NextResponse.json(
        { message: "Missing categoryId" },
        { status: 405 }
      );
    }

    // Connect to MongoDB
    const db = await connectDB(req);

    // Fetch products by category from the database
    const products = await db
      .collection("products")
      .find({ categoryId })
      .toArray();

    return NextResponse.json(
      {
        products,
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

import { NextResponse } from "next/server";
import { connectDB } from "../lib/dbconnection";

// GET route to fetch products by category and implement search functionality
export async function GET(req, res) {
  try {
    // Parse the search query parameter
    const search = new URL(req.url)?.searchParams?.get("search");
    // Connect to MongoDB
    const db = await connectDB(req);

    // Define the search criteria
    const searchCriteria = search
      ? {
          name: { $regex: search, $options: "i" }, // Case-insensitive search on the product name
        }
      : {};

    // Fetch products based on the search criteria
    const products = await db
      .collection("products")
      .find(searchCriteria)
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

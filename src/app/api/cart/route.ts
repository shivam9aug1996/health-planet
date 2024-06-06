// Import required libraries
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { connectDB } from "../lib/dbconnection";

// Function to handle cart operations for a specific user
export async function POST(req, res) {
  try {
    const { action, productId, quantity, userId } = await req.json();
    // Connect to MongoDB
    const db = await connectDB(req);
    console.log("9876tg");
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Perform action based on the provided parameters
    switch (action) {
      case "add":
        // Check if productId and quantity are provided
        if (!productId || !quantity) {
          return NextResponse.json(
            { error: "ProductId and quantity are required for 'add' action" },
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
        // Add the product to the user's cart or update the quantity if it already exists
        await db.collection("cart").updateOne(
          { userId, productId },
          {
            $set: {
              userId,
              productId,
              quantity,
            },
          },
          { upsert: true } // Upsert to insert if not exists, update if exists
        );

        return NextResponse.json(
          { message: "Product added to cart successfully" },
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
        if (quantity === 0) {
          // Remove the product from the user's cart if quantity is 0
          await db.collection("cart").deleteOne({ userId, productId });

          return NextResponse.json(
            { message: "Product removed from cart successfully" },
            { status: 200 }
          );
        }

        // Remove the product from the user's cart
        await db.collection("cart").updateOne(
          { userId, productId },
          {
            $set: {
              userId,
              productId,
              quantity,
            },
          },
          { upsert: true }
        );

        return NextResponse.json(
          { message: "Product removed from cart successfully" },
          { status: 200 }
        );
      case "clear":
        // Clear all items from the user's cart
        await db.collection("cart").deleteMany({ userId });

        return NextResponse.json(
          { message: "Cart cleared successfully" },
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

// export async function GET(req, res) {
//   try {
//     const userId = new URL(req.url)?.searchParams?.get("userId");
//     if (!userId) {
//       return NextResponse.json({ message: "Missing userId" }, { status: 405 });
//     }

//     // Connect to MongoDB
//     const db = await connectDB(req);

//     // Fetch the user's cart from the database
//     const cartItems = await db.collection("cart").find({ userId }).toArray();

//     return NextResponse.json({ cartItems }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Something went wrong" },
//       { status: 500 }
//     );
//   }
// }

export async function GET(req, res) {
  try {
    const userId = new URL(req.url)?.searchParams?.get("userId");
    if (!userId) {
      return NextResponse.json({ message: "Missing userId" }, { status: 405 });
    }

    // Connect to MongoDB
    const db = await connectDB(req);

    // Fetch the user's cart from the database
    const cartItems = await db.collection("cart").find({ userId }).toArray();

    // Fetch product data for each item in the cart
    const cartWithProductData = await Promise.all(
      cartItems.map(async (cartItem) => {
        const product = await db
          .collection("products")
          .findOne({ _id: new ObjectId(cartItem.productId) });
        if (product) {
          return {
            ...cartItem,
            product,
          };
        } else {
          return cartItem; // If product is not found, return the cart item without product data
        }
      })
    );

    return NextResponse.json(
      { cartItems: cartWithProductData },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

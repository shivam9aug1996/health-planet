import { NextResponse } from "next/server";
import { connectDB } from "../lib/dbconnection";

// export async function GET(req, res) {
//   try {
//     // Connect to MongoDB
//     const db = await connectDB(req);

//     const properties = await db.collection("properties").find({}).toArray();

//     return NextResponse.json(
//       {
//         properties,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Something went wrong" },
//       { status: 500 }
//     );
//   }
// }

export async function GET(req, res) {
  try {
    // Connect to MongoDB
    const db = await connectDB(req);
    const propertiesCollection = db.collection("properties");

    // Extract page and limit from query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Fetch paginated data
    const properties = await propertiesCollection
      .find({})
      .skip(skip)
      .limit(limit)
      .toArray();

    // Fetch total count of documents
    const totalProperties = await propertiesCollection.countDocuments();

    // Calculate total pages
    const totalPages = Math.ceil(totalProperties / limit);

    return NextResponse.json(
      {
        properties,
        totalProperties,
        totalPages,
        currentPage: page,
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

export async function POST(req, res) {
  try {
    const sampleProperty = {
      address: {
        latitude: "28.709609",
        longitude: "77.651854",
        value: "cloned 3 BHK House For Rent In Om Vihar Phase 1a, Uttam Nagar",
      },
      description:
        "This spacious three bedroom flat of 800 sq. ft on rent in Om Vihar Phase 1A, Uttam Nagar is ideal for BACHELOR_FEMALE. This fully furnished independent house is at a great price of just 25,000 rupees. As this home comes with servant room, air conditioner & gas pipeline & more such amenities, living here would make life more pleasant. If you are looking for a home with lift, this home is just right for you.",
      image:
        "https://images.nobroker.in/images/8a9fbf82824e8fc101824ec6dc3729ac/8a9fbf82824e8fc101824ec6dc3729ac_76213_233063_large.jpg",
    };

    const db = await connectDB(req);
    const propertiesCollection = db.collection("properties");

    const properties = Array.from({ length: 100 }, (_, index) => ({
      ...sampleProperty,
    }));

    await propertiesCollection.insertMany(properties);

    return NextResponse.json(
      { message: "50 properties inserted successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

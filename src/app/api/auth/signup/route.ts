// app/api/usersignup.js

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { connectDB } from "../../lib/dbconnection";
import { saltRounds, secretKey } from "../../lib/keys";

export async function POST(req, res) {
  try {
    if (req.method !== "POST") {
      return NextResponse.json(
        { message: "Method not allowed" },
        { status: 405 }
      );
    }
    // let userAgentHeader = req.headers.get("user-agent");
    // let userFingerprint = req.headers.get("user-fingerprint");

    let { mobileNumber, password, name } = await req.json();
    if (!mobileNumber || !password || !name) {
      return NextResponse.json(
        { message: "Missing required field" },
        { status: 400 }
      );
    }
    mobileNumber = mobileNumber?.toString();
    password = password?.toString();
    name = name?.toString();

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log("hiii");
    // Connect to MongoDB
    const db = await connectDB(req);

    const existingUser = await db.collection("users").findOne({ mobileNumber });
    if (existingUser) {
      return NextResponse.json(
        { message: "Mobile number already exists" },
        { status: 403 }
      );
    }

    // Insert new member into database
    const result = await db.collection("users").insertOne({
      mobileNumber,
      password: hashedPassword,
      name,
    });

    const token = jwt.sign({ id: result.insertedId }, secretKey);

    let now = new Date();
    let expirationDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    cookies().set("gym_app_user_token", token, {
      expires: expirationDate,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    cookies().set(
      "gym_app_user_data",
      JSON.stringify({
        mobileNumber,
        userId: result.insertedId,
        name,
        // primaryGymData: null,
        // numOfPlansOfPrimaryGym: 0,
      }),
      {
        expires: expirationDate,
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      }
    );
    return NextResponse.json(
      {
        token,
        userData: {
          mobileNumber,
          userId: result.insertedId,
          name,
          // primaryGymData: null,
          // numOfPlansOfPrimaryGym: 0,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("jhgfdsdfghj", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

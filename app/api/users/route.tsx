import { auth } from "@clerk/nextjs/server";
import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch Clerk user details
    const res = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    });
    const user = await res.json();

    const email = user.email_addresses?.[0]?.email_address;
    const name = `${user.first_name || ""} ${user.last_name || ""}`.trim();

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));

    if (existing.length === 0) {
      await db.insert(usersTable).values({
        name,
        email,
        credits: 10,
      });
      console.log("✅ New user inserted");
    } else {
      console.log("⚡ User already exists");
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Error in /api/users:", error.message || error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

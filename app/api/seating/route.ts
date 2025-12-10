import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET - List all seating spots
export async function GET() {
  try {
    const seats = await prisma.seatingSpot.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json(seats);
  } catch (error) {
    console.error("Error fetching seating spots:", error);
    return NextResponse.json(
      { error: "Failed to fetch seating spots" },
      { status: 500 }
    );
  }
}

// POST - Create new seating spot
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, image, capacity, isActive } = body;

    const seat = await prisma.seatingSpot.create({
      data: {
        name,
        description: description || null,
        image: image || null,
        capacity,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(seat, { status: 201 });
  } catch (error) {
    console.error("Error creating seating spot:", error);
    return NextResponse.json(
      { error: "Failed to create seating spot" },
      { status: 500 }
    );
  }
}

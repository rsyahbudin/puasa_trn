import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET - Get single seating spot
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const seat = await prisma.seatingSpot.findUnique({
      where: { id: parseInt(id) },
    });

    if (!seat) {
      return NextResponse.json(
        { error: "Seating spot not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(seat);
  } catch (error) {
    console.error("Error fetching seating spot:", error);
    return NextResponse.json(
      { error: "Failed to fetch seating spot" },
      { status: 500 }
    );
  }
}

// PUT - Update seating spot
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, image, capacity, isActive } = body;

    const seat = await prisma.seatingSpot.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description: description || null,
        image: image || null,
        capacity,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(seat);
  } catch (error) {
    console.error("Error updating seating spot:", error);
    return NextResponse.json(
      { error: "Failed to update seating spot" },
      { status: 500 }
    );
  }
}

// DELETE - Delete seating spot
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.seatingSpot.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Seating spot deleted successfully" });
  } catch (error) {
    console.error("Error deleting seating spot:", error);
    return NextResponse.json(
      { error: "Failed to delete seating spot" },
      { status: 500 }
    );
  }
}

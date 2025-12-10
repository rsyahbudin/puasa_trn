import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET - Get single menu
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const menu = await prisma.menu.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        variants: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    return NextResponse.json(menu);
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}

// PUT - Update menu
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, price, description, image, categoryId } = body;

    const menu = await prisma.menu.update({
      where: { id: parseInt(id) },
      data: {
        name,
        price: parseInt(price),
        description,
        image,
        categoryId: parseInt(categoryId),
      },
      include: {
        category: true,
        variants: {
          include: {
            options: true,
          },
        },
      },
    });

    return NextResponse.json(menu);
  } catch (error) {
    console.error("Error updating menu:", error);
    return NextResponse.json(
      { error: "Failed to update menu" },
      { status: 500 }
    );
  }
}

// DELETE - Delete menu
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.menu.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Menu deleted successfully" });
  } catch (error) {
    console.error("Error deleting menu:", error);
    return NextResponse.json(
      { error: "Failed to delete menu" },
      { status: 500 }
    );
  }
}

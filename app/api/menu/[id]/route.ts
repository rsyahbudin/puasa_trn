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

// PUT - Update menu with variants
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const menuId = parseInt(id);
    const body = await request.json();
    const { name, price, description, image, categoryId, variants } = body;

    // Update basic menu info
    await prisma.menu.update({
      where: { id: menuId },
      data: {
        name,
        price: parseInt(price),
        description,
        image,
        categoryId: parseInt(categoryId),
      },
    });

    // If variants are provided, update them
    if (variants !== undefined) {
      // Delete existing variants and options
      await prisma.variantOption.deleteMany({
        where: {
          variant: {
            menuId: menuId,
          },
        },
      });
      await prisma.menuVariant.deleteMany({
        where: { menuId: menuId },
      });

      // Create new variants and options
      for (const variant of variants) {
        await prisma.menuVariant.create({
          data: {
            name: variant.name,
            menuId: menuId,
            options: {
              create: variant.options.map(
                (opt: { name: string; price: number }) => ({
                  name: opt.name,
                  price: opt.price || 0,
                })
              ),
            },
          },
        });
      }
    }

    // Fetch updated menu with all relations
    const updatedMenu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        category: true,
        variants: {
          include: {
            options: true,
          },
        },
      },
    });

    return NextResponse.json(updatedMenu);
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

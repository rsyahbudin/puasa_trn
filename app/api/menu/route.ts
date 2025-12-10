import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET - List all menus with categories and variants
export async function GET() {
  try {
    const menus = await prisma.menu.findMany({
      include: {
        category: true,
        variants: {
          include: {
            options: true,
          },
        },
      },
      orderBy: {
        categoryId: "asc",
      },
    });

    const categories = await prisma.category.findMany({
      orderBy: { id: "asc" },
    });

    return NextResponse.json({ menus, categories });
  } catch (error) {
    console.error("Error fetching menus:", error);
    return NextResponse.json(
      { error: "Failed to fetch menus" },
      { status: 500 }
    );
  }
}

// POST - Create new menu with variants (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, price, description, image, categoryId, variants } = body;

    // First create the menu without variants
    const menu = await prisma.menu.create({
      data: {
        name,
        price: parseInt(price),
        description: description || null,
        image: image || null,
        categoryId: parseInt(categoryId),
      },
      include: {
        category: true,
      },
    });

    // Then create variants if provided
    if (variants && variants.length > 0) {
      for (const variant of variants) {
        if (variant.name && variant.options && variant.options.length > 0) {
          await prisma.menuVariant.create({
            data: {
              name: variant.name,
              menuId: menu.id,
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
    }

    // Fetch the complete menu with variants
    const completeMenu = await prisma.menu.findUnique({
      where: { id: menu.id },
      include: {
        category: true,
        variants: {
          include: {
            options: true,
          },
        },
      },
    });

    return NextResponse.json(completeMenu, { status: 201 });
  } catch (error) {
    console.error("Error creating menu:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create menu", details: message },
      { status: 500 }
    );
  }
}

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

// POST - Create new menu (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, price, description, image, categoryId, variants } = body;

    const menu = await prisma.menu.create({
      data: {
        name,
        price: parseInt(price),
        description,
        image,
        categoryId: parseInt(categoryId),
        variants: variants
          ? {
              create: variants.map(
                (v: { name: string; options: string[] }) => ({
                  name: v.name,
                  options: {
                    create: v.options.map((opt: string) => ({ name: opt })),
                  },
                })
              ),
            }
          : undefined,
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

    return NextResponse.json(menu, { status: 201 });
  } catch (error) {
    console.error("Error creating menu:", error);
    return NextResponse.json(
      { error: "Failed to create menu" },
      { status: 500 }
    );
  }
}

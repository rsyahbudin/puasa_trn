import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET - List all bookings (admin)
export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        orderItems: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST - Create new booking (user)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      phone,
      instagram,
      bookingDate,
      pax,
      seating,
      orderItems,
      totalAmount,
      dpAmount,
      paymentProof,
    } = body;

    const booking = await prisma.booking.create({
      data: {
        customerName,
        phone,
        instagram,
        bookingDate: new Date(bookingDate),
        pax: parseInt(pax),
        seating,
        totalAmount: parseInt(totalAmount),
        dpAmount: parseInt(dpAmount),
        paymentProof,
        status: "pending",
        orderItems: {
          create: orderItems.map(
            (item: {
              menuId: number;
              menuName: string;
              quantity: number;
              selectedOptions?: string;
              subtotal: number;
            }) => ({
              menuId: item.menuId,
              menuName: item.menuName,
              quantity: item.quantity,
              selectedOptions: item.selectedOptions,
              subtotal: item.subtotal,
            })
          ),
        },
      },
      include: {
        orderItems: true,
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

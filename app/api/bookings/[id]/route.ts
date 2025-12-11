import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET - Get single booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      include: {
        orderItems: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

// PUT - Update booking (status, customer data, or order items)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      status,
      customerName,
      phone,
      instagram,
      bookingDate,
      pax,
      seating,
      orderItems, // array of { menuName, quantity, selectedOptions, subtotal }
    } = body;

    // Build update data object with only provided fields
    const updateData: Record<string, unknown> = {};

    if (status !== undefined) updateData.status = status;
    if (customerName !== undefined) updateData.customerName = customerName;
    if (phone !== undefined) updateData.phone = phone;
    if (instagram !== undefined) updateData.instagram = instagram || null;
    if (bookingDate !== undefined)
      updateData.bookingDate = new Date(bookingDate);
    if (pax !== undefined) updateData.pax = pax;
    if (seating !== undefined) updateData.seating = seating;

    // If orderItems provided, calculate new total and update items
    if (orderItems && Array.isArray(orderItems)) {
      const newTotal = orderItems.reduce(
        (sum: number, item: { subtotal: number }) => sum + item.subtotal,
        0
      );
      updateData.totalAmount = newTotal;

      // Delete existing order items
      await prisma.orderItem.deleteMany({
        where: { bookingId: parseInt(id) },
      });

      // Create new order items
      await prisma.orderItem.createMany({
        data: orderItems.map(
          (item: {
            menuId: number;
            menuName: string;
            quantity: number;
            selectedOptions?: string;
            subtotal: number;
          }) => ({
            bookingId: parseInt(id),
            menuId: item.menuId,
            menuName: item.menuName,
            quantity: item.quantity,
            selectedOptions: item.selectedOptions || null,
            subtotal: item.subtotal,
          })
        ),
      });
    }

    const booking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        orderItems: true,
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

// DELETE - Delete booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.booking.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}

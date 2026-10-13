
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
      orderBy: { createdAt: "desc" },
      include: { resource: true },
    });

    return Response.json(reservations);
  } catch (error) {
    console.error("Failed to fetch reservations:", error);

    return Response.json(
      { error: "Unable to fetch reservations." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      title,
      reservedBy,
      email,
      startTime,
      endTime,
      resourceId,
      notes,
    } = body;

    // Validate required fields and email format
    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof reservedBy !== "string" ||
      !reservedBy.trim() ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof startTime !== "string" ||
      typeof endTime !== "string" ||
      typeof resourceId !== "string" ||
      !resourceId.trim()
    ) {
      return Response.json(
        {
          error:
            "Please provide a valid email and all required reservation details.",
        },
        { status: 400 }
      );
    }

    // Validate reservation dates
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end <= start
    ) {
      return Response.json(
        { error: "Please provide a valid start and end time." },
        { status: 400 }
      );
    }

    // Check that the resource exists
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      return Response.json(
        { error: "Resource not found." },
        { status: 404 }
      );
    }

    // Prevent overlapping confirmed reservations
    const conflict = await prisma.reservation.findFirst({
      where: {
        resourceId,
        status: "CONFIRMED",
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });

    if (conflict) {
      return Response.json(
        {
          error:
            "This resource is already reserved during the selected time. Please choose another time.",
        },
        { status: 409 }
      );
    }

    // Create the reservation
    const reservation = await prisma.reservation.create({
      data: {
        title: title.trim(),
        reservedBy: reservedBy.trim(),
        email: email.trim(),
        startTime: start,
        endTime: end,
        resourceId,
        notes:
          typeof notes === "string" && notes.trim()
            ? notes.trim()
            : null,
      },
      include: { resource: true },
    });

    return Response.json(reservation, { status: 201 });
  } catch (error) {
    console.error("Failed to create reservation:", error);

    return Response.json(
      { error: "Unable to create reservation." },
      { status: 500 }
    );
  }
}

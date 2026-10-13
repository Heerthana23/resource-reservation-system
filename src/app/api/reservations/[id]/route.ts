
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const text = await request.text();

    // Empty request means cancel the reservation.
    if (!text.trim()) {
      const existing = await prisma.reservation.findUnique({
        where: { id },
      });

      if (!existing) {
        return Response.json(
          { error: "Reservation not found." },
          { status: 404 }
        );
      }

      if (existing.status === "CANCELLED") {
        return Response.json(existing);
      }

      const cancelled = await prisma.reservation.update({
        where: { id },
        data: { status: "CANCELLED" },
      });

      return Response.json(cancelled);
    }

    const body = JSON.parse(text);

    const {
      title,
      reservedBy,
      email,
      resourceId,
      startTime,
      endTime,
      notes,
    } = body;

    // Validate required fields and email format.
    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof reservedBy !== "string" ||
      !reservedBy.trim() ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof resourceId !== "string" ||
      !resourceId.trim() ||
      typeof startTime !== "string" ||
      typeof endTime !== "string"
    ) {
      return Response.json(
        {
          error:
            "Please complete all required fields with valid details.",
        },
        { status: 400 }
      );
    }

    // Validate reservation dates.
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end <= start
    ) {
      return Response.json(
        {
          error: "The end time must be later than the start time.",
        },
        { status: 400 }
      );
    }

    // Find the existing reservation.
    const existing = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!existing) {
      return Response.json(
        { error: "Reservation not found." },
        { status: 404 }
      );
    }

    if (existing.status !== "CONFIRMED") {
      return Response.json(
        { error: "Only confirmed reservations can be edited." },
        { status: 400 }
      );
    }

    // Check that the selected resource exists.
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      return Response.json(
        { error: "Selected resource was not found." },
        { status: 404 }
      );
    }

    // Prevent overlapping confirmed reservations.
    const conflict = await prisma.reservation.findFirst({
      where: {
        id: { not: id },
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
            "This resource is already reserved during that time. Choose another time.",
        },
        { status: 409 }
      );
    }

    // Update the reservation.
    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        title: title.trim(),
        reservedBy: reservedBy.trim(),
        email: email.trim(),
        resourceId,
        startTime: start,
        endTime: end,
        notes:
          typeof notes === "string" && notes.trim()
            ? notes.trim()
            : null,
      },
      include: { resource: true },
    });

    return Response.json(updated);
  } catch (error) {
    console.error("Failed to update reservation:", error);

    return Response.json(
      { error: "Unable to update reservation." },
      { status: 500 }
    );
  }
}

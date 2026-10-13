
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: { createdAt: "desc" },
    });

    return Response.json(resources);
  } catch (error) {
    console.error("Failed to fetch resources:", error);

    return Response.json(
      { error: "Unable to fetch resources." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type, location, description } = body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof type !== "string" ||
      !type.trim()
    ) {
      return Response.json(
        { error: "Resource name and type are required." },
        { status: 400 }
      );
    }

    const resource = await prisma.resource.create({
      data: {
        name: name.trim(),
        type: type.trim(),
        location:
          typeof location === "string" && location.trim()
            ? location.trim()
            : null,
        description:
          typeof description === "string" && description.trim()
            ? description.trim()
            : null,
      },
    });

    return Response.json(resource, { status: 201 });
  } catch (error) {
    console.error("Failed to create resource:", error);

    return Response.json(
      { error: "Unable to create resource." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !id.trim()) {
      return Response.json(
        { error: "Resource ID is required." },
        { status: 400 }
      );
    }

    const resource = await prisma.resource.findUnique({
      where: { id },
    });

    if (!resource) {
      return Response.json(
        { error: "Resource not found." },
        { status: 404 }
      );
    }

    const reservationCount = await prisma.reservation.count({
      where: { resourceId: id },
    });

    if (reservationCount > 0) {
      return Response.json(
        {
          error:
            "This resource has reservation history and cannot be deleted. Keep it to preserve reservation records.",
        },
        { status: 409 }
      );
    }

    await prisma.resource.delete({
      where: { id },
    });

    return Response.json({
      message: "Resource deleted successfully.",
    });
  } catch (error) {
    console.error("Failed to delete resource:", error);

    return Response.json(
      { error: "Unable to delete resource." },
      { status: 500 }
    );
  }
}

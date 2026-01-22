import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { requireAuth } from "@/app/lib/api-helpers";

// UC-16: GET /api/user-notifications - inbox lista (zadnje prvo)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(Number(limitParam) || 50, 200) : 50;

    const notifications = await prisma.userNotification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { readAt: null } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "Morate biti prijavljeni") {
      return NextResponse.json({ message }, { status: 401 });
    }
    return NextResponse.json({ message: "Greška pri dohvaćanju notifikacija" }, { status: 500 });
  }
}

// UC-16: PATCH /api/user-notifications - označi kao pročitano (id ili all)
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();
    const { id, markAllRead } = body as { id?: string; markAllRead?: boolean };

    if (markAllRead) {
      await prisma.userNotification.updateMany({
        where: { userId, readAt: null },
        data: { readAt: new Date() },
      });
      return NextResponse.json({ ok: true });
    }

    if (!id) {
      return NextResponse.json({ message: "id ili markAllRead je obavezan" }, { status: 400 });
    }

    const updated = await prisma.userNotification.updateMany({
      where: { id, userId },
      data: { readAt: new Date() },
    });

    if (updated.count === 0) {
      return NextResponse.json({ message: "Notifikacija nije pronađena" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error updating user notifications:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "Morate biti prijavljeni") {
      return NextResponse.json({ message }, { status: 401 });
    }
    return NextResponse.json({ message: "Greška pri ažuriranju notifikacija" }, { status: 500 });
  }
}

// UC-16: DELETE /api/user-notifications - obriši (id ili all)
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const all = searchParams.get("all") === "true";

    if (all) {
      await prisma.userNotification.deleteMany({ where: { userId } });
      return NextResponse.json({ ok: true });
    }

    if (!id) {
      return NextResponse.json({ message: "id ili all=true je obavezan" }, { status: 400 });
    }

    const deleted = await prisma.userNotification.deleteMany({ where: { id, userId } });
    if (deleted.count === 0) {
      return NextResponse.json({ message: "Notifikacija nije pronađena" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting user notifications:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "Morate biti prijavljeni") {
      return NextResponse.json({ message }, { status: 401 });
    }
    return NextResponse.json({ message: "Greška pri brisanju notifikacija" }, { status: 500 });
  }
}


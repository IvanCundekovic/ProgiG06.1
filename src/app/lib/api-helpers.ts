// Helper funkcije za konverziju između frontend tipova i Prisma modela

import {Role, WorkshopNotificationType, WorkshopStatus} from "@prisma/client";
import {auth} from "@/app/auth";

// Konverzija WorkshopStatus enum-a
export function frontendToPrismaWorkshopStatus(
  status: "upcoming" | "in_progress" | "completed" | "cancelled"
): WorkshopStatus {
  switch (status) {
    case "upcoming":
      return "UPCOMING";
    case "in_progress":
      return "IN_PROGRESS";
    case "completed":
      return "COMPLETED";
    case "cancelled":
      return "CANCELLED";
    default:
      return "UPCOMING";
  }
}

export function prismaToFrontendWorkshopStatus(
  status: WorkshopStatus
): "upcoming" | "in_progress" | "completed" | "cancelled" {
  switch (status) {
    case "UPCOMING":
      return "upcoming";
    case "IN_PROGRESS":
      return "in_progress";
    case "COMPLETED":
      return "completed";
    case "CANCELLED":
      return "cancelled";
    default:
      return "upcoming";
  }
}

// Konverzija WorkshopNotificationType enum-a
export function frontendToPrismaNotificationType(
  type: "schedule_change" | "reconnection" | "general"
): WorkshopNotificationType {
  switch (type) {
    case "schedule_change":
      return "SCHEDULE_CHANGE";
    case "reconnection":
      return "RECONNECTION";
    case "general":
      return "GENERAL";
    default:
      return "GENERAL";
  }
}

export function prismaToFrontendNotificationType(
  type: WorkshopNotificationType
): "schedule_change" | "reconnection" | "general" {
  switch (type) {
    case "SCHEDULE_CHANGE":
      return "schedule_change";
    case "RECONNECTION":
      return "reconnection";
    case "GENERAL":
      return "general";
    default:
      return "general";
  }
}

// Provjera autorizacije
export function requireRole(
  userRole: Role | undefined,
  allowedRoles: Role[]
): void {
  if (!userRole || !allowedRoles.includes(userRole)) {
    throw new Error("Nemate dozvolu za ovu akciju");
  }
}

export async function requireAuth(): Promise<{ userId: string; userRole: Role }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Morate biti prijavljeni");
  }
  return {
    userId: session.user.id,
    userRole: (session.user as { role?: Role }).role as Role,
  };
}


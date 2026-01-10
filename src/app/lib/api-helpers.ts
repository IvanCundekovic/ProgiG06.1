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

/**
 * Konvertira Prisma workshop status u frontend format
 * @param status - Prisma WorkshopStatus enum
 * @returns Frontend status string
 */
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
/**
 * Konvertira frontend notification type u Prisma enum
 * @param type - Frontend notification type string
 * @returns Prisma WorkshopNotificationType enum vrijednost
 */
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

/**
 * Konvertira Prisma notification type u frontend format
 * @param type - Prisma WorkshopNotificationType enum
 * @returns Frontend notification type string
 */
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
/**
 * Provjerava da li korisnik ima potrebnu ulogu
 * @param userRole - Trenutna uloga korisnika
 * @param allowedRoles - Array dozvoljenih uloga
 * @throws Error ako korisnik nema potrebnu ulogu
 */
export function requireRole(
  userRole: Role | undefined,
  allowedRoles: Role[]
): void {
  if (!userRole || !allowedRoles.includes(userRole)) {
    throw new Error("Nemate dozvolu za ovu akciju");
  }
}

/**
 * Provjerava da li je korisnik autenticiran i vraća korisničke podatke
 * @returns Object sa userId i userRole
 * @throws Error ako korisnik nije autenticiran
 */
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


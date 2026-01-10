import { google } from "googleapis";
import { prisma } from "@/prisma";

/**
 * OAuth2 klijent za Google Calendar API
 */
function getOAuth2Client(userId: string) {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CALENDAR_CLIENT_ID,
        process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
        process.env.GOOGLE_CALENDAR_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
    );

    return oauth2Client;
}

/**
 * Dohvaća Google Calendar postavke za korisnika
 */
async function getCalendarSettings(userId: string) {
    const settings = await prisma.googleCalendarSettings.findUnique({
        where: { userId },
    });

    if (!settings) {
        return null;
    }

    const oauth2Client = getOAuth2Client(userId);
    oauth2Client.setCredentials({
        access_token: settings.accessToken,
        refresh_token: settings.refreshToken,
        expiry_date: settings.tokenExpiresAt.getTime(),
    });

    return { settings, oauth2Client };
}

/**
 * Sinkronizira live radionicu s Google Calendarom
 */
export async function syncWorkshopToCalendar(
    userId: string,
    workshop: {
        id: string;
        title: string;
        description: string | null;
        startTime: Date;
        duration: number; // u minutama
        meetingUrl: string | null;
    }
): Promise<{ success: boolean; eventId?: string; error?: string }> {
    try {
        const calendarData = await getCalendarSettings(userId);
        if (!calendarData) {
            return { success: false, error: "Google Calendar nije povezan" };
        }

        const { settings, oauth2Client } = calendarData;

        // Provjeri je li sync omogućen
        if (!settings.syncEnabled) {
            return { success: false, error: "Google Calendar sync je onemogućen" };
        }

        // Provjeri i refreshaj token ako je potrebno
        if (settings.tokenExpiresAt < new Date()) {
            const { credentials } = await oauth2Client.refreshAccessToken();
            await prisma.googleCalendarSettings.update({
                where: { userId },
                data: {
                    accessToken: credentials.access_token || settings.accessToken,
                    refreshToken: credentials.refresh_token || settings.refreshToken,
                    tokenExpiresAt: credentials.expiry_date
                        ? new Date(credentials.expiry_date)
                        : settings.tokenExpiresAt,
                },
            });
            oauth2Client.setCredentials(credentials);
        }

        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        const endTime = new Date(workshop.startTime);
        endTime.setMinutes(endTime.getMinutes() + workshop.duration);

        const event = {
            summary: workshop.title,
            description: workshop.description || undefined,
            start: {
                dateTime: workshop.startTime.toISOString(),
                timeZone: settings.timeZone || "Europe/Zagreb",
            },
            end: {
                dateTime: endTime.toISOString(),
                timeZone: settings.timeZone || "Europe/Zagreb",
            },
            location: workshop.meetingUrl || undefined,
            reminders: {
                useDefault: false,
                overrides: [
                    { method: "email", minutes: 24 * 60 }, // 1 dan prije
                    { method: "popup", minutes: 60 }, // 1 sat prije
                ],
            },
        };

        const response = await calendar.events.insert({
            calendarId: settings.calendarId || "primary",
            requestBody: event,
        });

        // Ažuriraj workshop s calendar event ID-om
        await prisma.liveWorkshop.update({
            where: { id: workshop.id },
            data: {
                calendarSyncedAt: new Date(),
                googleCalendarEventId: response.data.id || undefined,
            },
        });

        return { success: true, eventId: response.data.id || undefined };
    } catch (error) {
        console.error("Error syncing workshop to Google Calendar:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Nepoznata greška",
        };
    }
}

/**
 * Briše event iz Google Calendara
 */
export async function deleteWorkshopFromCalendar(
    userId: string,
    calendarEventId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const calendarData = await getCalendarSettings(userId);
        if (!calendarData) {
            return { success: false, error: "Google Calendar nije povezan" };
        }

        const { oauth2Client } = calendarData;
        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        await calendar.events.delete({
            calendarId: calendarData.settings.calendarId || "primary",
            eventId: calendarEventId,
        });

        return { success: true };
    } catch (error) {
        console.error("Error deleting workshop from Google Calendar:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Nepoznata greška",
        };
    }
}

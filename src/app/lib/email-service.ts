import {Resend} from 'resend';
import {User} from 'next-auth';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const EMAIL_FROM = process.env.EMAIL_FROM || 'Onboarding <onboarding@resend.dev>';

// Helper funkcija za slanje emaila
async function sendEmail(to: string, subject: string, html: string) {
    if (!resend) {
        console.warn("Resend API ključ nije postavljen. E-mail neće biti poslan.");
        return false;
    }

    try {
        const response = await resend.emails.send({
            from: EMAIL_FROM,
            to: [to],
            subject,
            html,
        });

        if (response && response.data && response.data.id) {
            console.log(`[EMAIL] E-mail poslan korisniku: ${to}. ID poruke: ${response.data.id}`);
            return true;
        } else {
            console.error(`[EMAIL ERROR] Neuspjelo slanje e-maila korisniku ${to}. Odgovor Resenda:`, response.error);
            return false;
        }
    } catch (error) {
        console.error(`[EMAIL ERROR] Greška pri slanju e-maila korisniku ${to}:`, error);
        return false;
    }
}

export async function sendWelcomeEmail(user: User) {
    if (!user.email) {
        console.error("Korisnik nema e-mail adresu za slanje dobrodošlice.");
        return;
    }

    const userName = user.name || user.email.split('@')[0];

    await sendEmail(
        user.email,
        `Dobrodošli u Kuhaonu, ${userName}!`,
        `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #333;">Pozdrav, ${userName}! 👋</h1>
          <p>Želimo vam dobrodošlicu u našu aplikaciju. Drago nam je što ste se pridružili!</p>
          <p>Vaš račun je uspješno kreiran i spreman za korištenje.</p>
          <p style="margin-top: 30px;">
            Sretno,<br>
            Kuhaona Tim
          </p>
        </div>
      `
    );
}

// F-017: Obavijest o novoj lekciji
export async function sendNewLessonNotification(
    userEmail: string,
    userName: string,
    lessonTitle: string,
    courseTitle: string,
    lessonUrl: string
) {
    await sendEmail(
        userEmail,
        `Nova lekcija: ${lessonTitle}`,
        `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #333;">Nova lekcija dostupna! 📚</h1>
          <p>Pozdrav, ${userName}!</p>
          <p>Nova lekcija je dodana u tečaj <strong>${courseTitle}</strong>:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #df0000; margin: 0 0 10px 0;">${lessonTitle}</h2>
            <p style="margin: 0;"><a href="${lessonUrl}" style="color: #df0000; text-decoration: none; font-weight: bold;">Pogledaj lekciju →</a></p>
          </div>
          <p style="margin-top: 30px;">
            Sretno s učenjem!<br>
            Kuhaona Tim
          </p>
        </div>
      `
    );
}

// F-017: Podsjetnik za live radionicu
export async function sendWorkshopReminder(
    userEmail: string,
    userName: string,
    workshopTitle: string,
    startTime: Date,
    meetingUrl: string
) {
    const formattedDate = startTime.toLocaleString("hr-HR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    await sendEmail(
        userEmail,
        `Podsjetnik: ${workshopTitle} počinje uskoro`,
        `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #333;">Podsjetnik za live radionicu 🔴</h1>
          <p>Pozdrav, ${userName}!</p>
          <p>Live radionica <strong>${workshopTitle}</strong> počinje:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-size: 18px; font-weight: bold;">${formattedDate}</p>
            <p style="margin: 10px 0 0 0;"><a href="${meetingUrl}" style="color: #df0000; text-decoration: none; font-weight: bold;">Pridruži se radionici →</a></p>
          </div>
          <p style="margin-top: 30px;">
            Vidimo se tamo!<br>
            Kuhaona Tim
          </p>
        </div>
      `
    );
}

// F-017: Tjedni sažetak napretka
export async function sendWeeklyProgressSummary(
    userEmail: string,
    userName: string,
    progressData: {
        lessonsCompleted: number;
        quizzesCompleted: number;
        coursesInProgress: number;
        totalTimeSpent: number; // u minutama
    }
) {
    await sendEmail(
        userEmail,
        `Tjedni sažetak vašeg napretka`,
        `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #333;">Tjedni sažetak napretka 📊</h1>
          <p>Pozdrav, ${userName}!</p>
          <p>Evo sažetka vašeg napretka ovaj tjedan:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <div style="margin-bottom: 15px;">
              <strong>Dovršene lekcije:</strong> ${progressData.lessonsCompleted}
            </div>
            <div style="margin-bottom: 15px;">
              <strong>Riješeni kvizovi:</strong> ${progressData.quizzesCompleted}
            </div>
            <div style="margin-bottom: 15px;">
              <strong>Tečajevi u tijeku:</strong> ${progressData.coursesInProgress}
            </div>
            <div>
              <strong>Ukupno vremena:</strong> ${progressData.totalTimeSpent} minuta
            </div>
          </div>
          <p style="margin-top: 30px;">
            Nastavite s odličnim radom!<br>
            Kuhaona Tim
          </p>
        </div>
      `
    );
}

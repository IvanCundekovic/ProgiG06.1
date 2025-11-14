import {Resend} from 'resend';
import {User} from 'next-auth';

const resend = new Resend();

const EMAIL_FROM = process.env.EMAIL_FROM || 'Onboarding <onboarding@resend.dev>';

export async function sendWelcomeEmail(user: User) {
    if (!user.email) {
        console.error("Korisnik nema e-mail adresu za slanje dobrodošlice.");
        return;
    }

    const userName = user.name || user.email.split('@')[0];

    try {
        const response = await resend.emails.send({
            from: EMAIL_FROM,
            to: [user.email],
            subject: `Dobrodošli u Kuhaonu, ${userName}!`,
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #333;">Pozdrav, ${userName}! 👋</h1>
          <p>Želimo vam dobrodošlicu u našu aplikaciju. Drago nam je što ste se pridružili!</p>
          <p>Vaš račun je uspješno kreiran i spreman za korištenje.</p>
          <p style="margin-top: 30px;">
            Sretno,<br>
            Kuhaona Tim
          </p>
        </div>
      `,
        });

        if (response && response.data && response.data.id) {
            console.log(`[AUTH] E-mail dobrodošlice poslan korisniku: ${user.email}. ID poruke: ${response.data.id}`);
        } else {
            console.error(`[AUTH ERROR] Neuspjelo slanje e-maila korisniku ${user.email}. Odgovor Resenda:`, response.error);
        }

    } catch (error) {
        console.error(`[AUTH ERROR] Greška pri slanju e-maila dobrodošlice korisniku ${user.email}:`, error);
    }
}

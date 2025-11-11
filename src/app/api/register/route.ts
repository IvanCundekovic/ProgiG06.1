import {NextResponse} from 'next/server';
import {createUser, findUserByEmail, hashPassword} from '@/app/lib/auth-utils';

export async function POST(request: Request) {
    try {
        const { username, email, password } = await request.json();

        if (!username || !email || !password) {
            return NextResponse.json(
                { message: 'Nedostaju korisnički podaci (ime, email ili lozinka).' },
                { status: 400 }
            );
        }

        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return NextResponse.json(
                { message: 'Korisnik s ovim e-mailom već postoji.' },
                { status: 409 }
            );
        }

        const passwordHash = await hashPassword(password);

        await createUser(username, email, passwordHash);

        return NextResponse.json(
            { message: 'Korisnik uspješno registriran.' },
            { status: 201 }
        );

    } catch (error) {
        console.error('SERVER ERROR DURING REGISTRATION:', error);
        return NextResponse.json(
            { message: 'Došlo je do pogreške na serveru prilikom registracije.' },
            { status: 500 }
        );
    }
}
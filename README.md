# Kuhaona - Platforma za kuhanje

# Opis projekta
Ovaj projekt je rezultat timskog rada u sklopu projektnog zadatka kolegija [Programsko inženjerstvo](https://www.fer.unizg.hr/predmet/proinz) na Fakultetu elektrotehnike i računarstva Sveučilišta u Zagrebu. 

**Cilj projekta** je razviti sveobuhvatnu online platformu za kuhanje, nazvanu **Kuhaona**, koja povezuje instruktore kuhanja s polaznicima kroz strukturirane video-lekcije na zahtjev i interaktivne live radionice.

Platforma je dizajnirana da omogući:
* **Strukturirano učenje:** Organizacija sadržaja u tečajeve, module i lekcije.
* **Personalizaciju:** Preporuke sadržaja temeljene na razini znanja, prehrambenim preferencijama i povijesti aktivnosti.
* **Interaktivnost:** Kvizovi, zadaci, sustav ocjena i recenzija, te live radionice sa sinkronizacijom kalendara.

**Motivacija i Naučeno:** Kroz projekt primjenjujemo principe programskog inženjerstva u razvoju složenog sustava s više korisničkih uloga. Trenutno je naglasak stavljen na implementaciju modernog full-stack rješenja (Next.js), napredne autentikacije (OAuth 2.0), CI/CD procesa (Vercel) i rada s bazama podataka u oblaku (Supabase/Prisma).

# Funkcijski zahtjevi
Funkcijski zahjevi sustava "Kuhaona" obuhvaćaju:

1.  **Uloge u sustavu:** Polaznik, Instruktor i Administrator sustava.
2.  **Autentikacija i Autorizacija:** Registracija/prijava putem **OAuth 2.0** (Google/Github) ili e-pošte i lozinke. Sustav koristi granularne uloge i audit log.
3.  **Upravljanje profilima:** Detaljni profili za polaznike (preferencije, alergeni) i instruktore (biografija, specijalizacije), uz verifikaciju instruktora.
4.  **Struktura Sadržaja:** Organizacija po principu **Tečaj → Modul → Lekcija**. Lekcije uključuju video, pisane korake, mjere, kupovnu listu, kvizove/zadatke i Q&A dio.
5.  **Live radionice:** Instruktori definiraju rasporede. Platforma nudi sinkronizaciju s vanjskim kalendarima i integraciju streaming servisa.
6.  **Pretraga i Filtriranje:** Napredna pretraga po sastojcima, alergenima, kuhinji, razini težine, trajanju i tipu. Podrška za prehrambene planove (vegan, keto, bez glutena).
7.  **Ocjene i Recenzije:** Polaznici ocjenjuju lekcije, tečajeve i instruktore. Administrator moderira sporni sadržaj.
8.  **Praćenje Napretka i Certifikati:** Praćenje napretka u tečaju (% dovršenosti), provjera znanja kroz kvizove, te izdavanje digitalnog certifikata (PDF) nakon završetka tečaja.
9.  **Notifikacije:** Transakcijske e-poruke, podsjetnici za live radionice i obavijesti o novim lekcijama (e-mail i push obavijesti).


# Tehnologije
| Komponenta | Tehnologija | Opis |
| :--- | :--- | :--- |
| **Full-Stack Framework** | **Next.js** (React) | Korišten kao jedinstveni framework za Frontend i Backend (API rute). |
| **Korisničko sučelje** | **React & Material UI (MUI)** | Biblioteka React komponenti za implementaciju modernog dizajna. |
| **Baza podataka** | **PostgreSQL** | Relacijska baza podataka. |
| **Hosting Baze** | **Supabase** | Cloud hosting i upravljanje PostgreSQL bazom. |
| **ORM** | **Prisma** | Node.js/TypeScript ORM za siguran i učinkovit pristup bazi podataka. |
| **Deployment & CI/CD** | **Vercel** | Platforma za automatsko deployanje i kontinuiranu integraciju/isporuku. |
| **Autentikacija** | **NextAuth.js** | Upravljanje OAuth 2.0 i lokalnom autentikacijom. |

# Upute za korištenje i Trenutni Status
## Aplikacija u produkciji
Aplikacija je automatski deployana putem CI/CD procesa na: **[kuhaona.vercel.app](https://kuhaona.vercel.app)**

## Završene funkcionalnosti (Trenutni Status)
> Ovaj dio će biti izmjenjen u toku razvoja projekta te potencijalno neće biti savršeno usklađen u samom trenutku razvoja

Trenutno su implementirane i stabilne sljedeće ključne funkcionalnosti:
* **Autentikacija:** Registracija i prijava putem **OAuth 2.0** servisa (Google i GitHub).
* **Lokalna Autentikacija:** Registracija i prijava putem e-pošte i lozinke.
* **Infrastruktura:** Postavljena je veza s PostgreSQL bazom na Supabase-u pomoću Prisme.

# Instalacija
Za lokalno pokretanje razvojnog okruženja slijedite ove korake:
### 1. Kloniranje repozitorija
```bash
git clone https://github.com/IvanCundekovic/ProgiG06.1.git
cd ProgiG06.1
```
### 2. Instalacija paketa
```bash
npm install
```
### 3. Postavljanje varijabli okoline
Kreirajte .env datoteku u korijenskom direktoriju i postavite sve potrebne varijable za bazu podataka i autentikaciju. Primjerice, trebat će vam DATABASE_URL (za Prisma/Supabase), NEXTAUTH_SECRET, te ključevi za OAuth 2.0 servise (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET itd.).
### 4. Pokretanje razvojnog servera
Pokrenite Next.js razvojni server:
```bash
npm run dev
```
Aplikacija će biti dostupna u vašem pregledniku na adresi http://localhost:3000

# Članovi tima 
* Tomislav Cvitanović
* Luka Šepec
* Ivan Cundeković
* Dino Islamović
* Leo Žižić
* Jakša Jurlina

# Kontribucije
>Pravila ovise o organizaciji tima i su često izdvojena u CONTRIBUTING.md


# 📝 Kodeks ponašanja [![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)
Kao studenti sigurno ste upoznati s minimumom prihvatljivog ponašanja definiran u [KODEKS PONAŠANJA STUDENATA FAKULTETA ELEKTROTEHNIKE I RAČUNARSTVA SVEUČILIŠTA U ZAGREBU](https://www.fer.hr/_download/repository/Kodeks_ponasanja_studenata_FER-a_procisceni_tekst_2016%5B1%5D.pdf), te dodatnim naputcima za timski rad na predmetu [Programsko inženjerstvo](https://wwww.fer.hr).
Očekujemo da ćete poštovati [etički kodeks IEEE-a](https://www.ieee.org/about/corporate/governance/p7-8.html) koji ima važnu obrazovnu funkciju sa svrhom postavljanja najviših standarda integriteta, odgovornog ponašanja i etičkog ponašanja u profesionalnim aktivnosti. Time profesionalna zajednica programskih inženjera definira opća načela koja definiranju  moralni karakter, donošenje važnih poslovnih odluka i uspostavljanje jasnih moralnih očekivanja za sve pripadnike zajenice.

Kodeks ponašanja skup je provedivih pravila koja služe za jasnu komunikaciju očekivanja i zahtjeva za rad zajednice/tima. Njime se jasno definiraju obaveze, prava, neprihvatljiva ponašanja te  odgovarajuće posljedice (za razliku od etičkog kodeksa). U ovom repozitoriju dan je jedan od široko prihvačenih kodeks ponašanja za rad u zajednici otvorenog koda.
>### Poboljšajte funkcioniranje tima:
>* definirajte načina na koji će rad biti podijeljen među članovima grupe
>* dogovorite kako će grupa međusobno komunicirati.
>* ne gubite vrijeme na dogovore na koji će grupa rješavati sporove primjenite standarde!
>* implicitno podrazmijevamo da će svi članovi grupe slijediti kodeks ponašanja.
 
>###  Prijava problema
>Najgore što se može dogoditi je da netko šuti kad postoje problemi. Postoji nekoliko stvari koje možete učiniti kako biste najbolje riješili sukobe i probleme:
>* Obratite mi se izravno [e-pošta](mailto:vlado.sruk@fer.hr) i  učinit ćemo sve što je u našoj moći da u punom povjerenju saznamo koje korake trebamo poduzeti kako bismo riješili problem.
>* Razgovarajte s vašim asistentom jer ima najbolji uvid u dinamiku tima. Zajedno ćete saznati kako riješiti sukob i kako izbjeći daljnje utjecanje u vašem radu.
>* Ako se osjećate ugodno neposredno razgovarajte o problemu. Manje incidente trebalo bi rješavati izravno. Odvojite vrijeme i privatno razgovarajte s pogođenim članom tima te vjerujte u iskrenost.

# 📝 Licenca
Važeča (1)
[![CC BY-NC-SA 4.0][cc-by-nc-sa-shield]][cc-by-nc-sa]

Ovaj repozitorij sadrži otvoreni obrazovni sadržaji (eng. Open Educational Resources)  i licenciran je prema pravilima Creative Commons licencije koja omogućava da preuzmete djelo, podijelite ga s drugima uz 
uvjet da navođenja autora, ne upotrebljavate ga u komercijalne svrhe te dijelite pod istim uvjetima [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License HR][cc-by-nc-sa].
>
> ### Napomena:
>
> Svi paketi distribuiraju se pod vlastitim licencama.
> Svi upotrijebleni materijali  (slike, modeli, animacije, ...) distribuiraju se pod vlastitim licencama.

[![CC BY-NC-SA 4.0][cc-by-nc-sa-image]][cc-by-nc-sa]

[cc-by-nc-sa]: https://creativecommons.org/licenses/by-nc/4.0/deed.hr 
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
[cc-by-nc-sa-shield]: https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg

Orginal [![cc0-1.0][cc0-1.0-shield]][cc0-1.0]
>
>COPYING: All the content within this repository is dedicated to the public domain under the CC0 1.0 Universal (CC0 1.0) Public Domain Dedication.
>
[![CC0-1.0][cc0-1.0-image]][cc0-1.0]

[cc0-1.0]: https://creativecommons.org/licenses/by/1.0/deed.en
[cc0-1.0-image]: https://licensebuttons.net/l/by/1.0/88x31.png
[cc0-1.0-shield]: https://img.shields.io/badge/License-CC0--1.0-lightgrey.svg

### Reference na licenciranje repozitorija

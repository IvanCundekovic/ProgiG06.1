import { jsPDF } from "jspdf";

interface CertificateData {
    userName: string;
    courseTitle: string;
    issuedAt: Date;
    certificateId: string;
}

/**
 * Generira PDF certifikat za dovršeni tečaj
 */
export async function generateCertificatePDF(data: CertificateData): Promise<Buffer> {
    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Pozadinska boja (svijetlo plava)
    doc.setFillColor(240, 248, 255);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // Okvir
    doc.setDrawColor(70, 130, 180);
    doc.setLineWidth(2);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    // Naslov
    doc.setFontSize(36);
    doc.setTextColor(70, 130, 180);
    doc.setFont("helvetica", "bold");
    doc.text("CERTIFIKAT", pageWidth / 2, 50, { align: "center" });

    // Podnaslov
    doc.setFontSize(18);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.text("Potvrda o završetku tečaja", pageWidth / 2, 65, { align: "center" });

    // Tekst certifikata
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.setFont("helvetica", "normal");
    const text1 = "Ovim se potvrđuje da je";
    const text2 = data.userName;
    const text3 = `uspješno završio/la tečaj`;
    const text4 = `"${data.courseTitle}"`;

    doc.text(text1, pageWidth / 2, 100, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(text2, pageWidth / 2, 115, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text(text3, pageWidth / 2, 130, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(text4, pageWidth / 2, 145, { align: "center" });

    // Datum izdavanja
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    const issuedDate = new Date(data.issuedAt).toLocaleDateString("hr-HR", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    doc.text(`Datum izdavanja: ${issuedDate}`, pageWidth / 2, 170, { align: "center" });

    // ID certifikata
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`ID certifikata: ${data.certificateId}`, pageWidth / 2, 185, { align: "center" });

    // Potpis linija
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 40, pageHeight - 50, pageWidth / 2 + 40, pageHeight - 50);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Administrator", pageWidth / 2, pageHeight - 35, { align: "center" });

    // Generiraj PDF kao Buffer
    const pdfOutput = doc.output("arraybuffer");
    return Buffer.from(pdfOutput);
}

/**
 * Utilities for PDF generation, download, and management
 */

export function buildOfficialLabPdfBlob(
  title: string,
  certNo: string,
  kategori: string,
  tanggalUji: string,
  lokasiSampling: string,
  targetCompany?: string,
  statusKelayakan?: string,
  analisName?: string
): Blob {
  const lines = [
    'PT AETRA AIR TANGERANG',
    'LABORATORIUM PENGENDALIAN MUTU & KUALITAS AIR MINUM',
    '=========================================================================',
    `LAPORAN RESMI HASIL UJI MUTU AIR: ${title.toUpperCase()}`,
    `Nomor Sertifikat/COA : ${certNo}`,
    `Kategori Sampling     : ${kategori.toUpperCase()}`,
    targetCompany ? `Ditujukan Khusus Mitra: ${targetCompany.toUpperCase()}` : 'Cakupan Uji          : Distribusi Utama Jaringan Industri',
    `Tanggal Pengujian     : ${tanggalUji}`,
    `Lokasi / Titik Sampel : ${lokasiSampling}`,
    `Standar Acuan         : Permenkes RI No. 2 Tahun 2023`,
    `Status Kelayakan      : ${statusKelayakan || 'MEMENUHI SYARAT (LAYAK MINUM & PRODUKSI)'}`,
    `Nama Analis Lab       : ${analisName || 'Nurul Hidayati, S.Si (QC Analyst)'}`,
    '=========================================================================',
    'RINGKASAN PARAMETER UTAMA MUTU AIR:',
    '1. Derajat Keasaman (pH)        : 7.25 - 7.45 (Baku Mutu: 6.5 - 8.5) -> NORMAL',
    '2. Kekeruhan (Turbidity)        : 0.35 NTU    (Baku Mutu: < 3.0 NTU)  -> MEMENUHI',
    '3. Sisa Klor Bebas              : 0.36 mg/L   (Baku Mutu: 0.2 - 0.5)  -> OPTIMAL',
    '4. Total Dissolved Solids (TDS) : 142 mg/L    (Baku Mutu: < 300 mg/L) -> MEMENUHI',
    '5. Total Koliform & E. Coli     : 0 CFU/100ml (Baku Mutu: 0 CFU)      -> STERIL (NEGATIF)',
    '6. Rasa & Bau                   : Normal, Tidak Berbau                -> MEMENUHI',
    '=========================================================================',
    'Dokumen ini diterbitkan secara sah dan tersertifikasi ISO/IEC 17025.',
    'PT Aetra Air Tangerang - Laboratorium Mutu IPA Sepatan Tangerang.'
  ];

  const content = lines
    .map((line, idx) => {
      const sanitized = line.replace(/[()\\]/g, ' ');
      const yPos = 740 - idx * 24;
      return `BT /F1 10 Tf 45 ${yPos} Td (${sanitized}) Tj ET`;
    })
    .join('\n');

  const streamLen = new TextEncoder().encode(content).length;

  const pdfString = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLen} >>
stream
${content}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000115 00000 n 
0000000235 00000 n 
0000000320 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
390
%%EOF`;

  return new Blob([pdfString], { type: 'application/pdf' });
}

export function generateOfficialLabPdfDataUrl(
  title: string,
  certNo: string,
  kategori: string,
  tanggalUji: string,
  lokasiSampling: string,
  targetCompany?: string,
  statusKelayakan?: string,
  analisName?: string
): string {
  const blob = buildOfficialLabPdfBlob(
    title,
    certNo,
    kategori,
    tanggalUji,
    lokasiSampling,
    targetCompany,
    statusKelayakan,
    analisName
  );
  return URL.createObjectURL(blob);
}

export function downloadPdfBlob(blobOrUrl: Blob | string, filename: string) {
  const url = typeof blobOrUrl === 'string' ? blobOrUrl : URL.createObjectURL(blobOrUrl);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

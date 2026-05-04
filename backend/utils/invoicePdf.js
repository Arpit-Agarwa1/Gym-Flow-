import PDFDocument from 'pdfkit';

/**
 * Builds a minimal invoice PDF in memory (buffer).
 */
export function buildInvoicePdf({ gymName, invoiceNumber, memberName, amount, date }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text(gymName || 'GymFlow', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Invoice: ${invoiceNumber}`);
    doc.text(`Member: ${memberName}`);
    doc.text(`Date: ${new Date(date).toLocaleString()}`);
    doc.moveDown();
    doc.fontSize(16).text(`Amount: ₹${amount}`, { underline: true });
    doc.end();
  });
}

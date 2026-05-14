import PDFDocument from 'pdfkit';

/**
 * Builds a minimal invoice PDF in memory (buffer).
 * @param {{
 *   gymName?: string;
 *   invoiceNumber: string;
 *   memberName: string;
 *   amount: number;
 *   date: Date | string;
 *   category?: string;
 *   notes?: string;
 *   trainerName?: string;
 *   dueDate?: Date | string | null;
 * }} opts
 */
export function buildInvoicePdf({
  gymName,
  invoiceNumber,
  memberName,
  amount,
  date,
  category,
  notes,
  trainerName,
  dueDate,
}) {
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
    if (category) doc.text(`Category: ${category.replace(/_/g, ' ')}`);
    if (trainerName) doc.text(`Trainer (PT): ${trainerName}`);
    if (dueDate) doc.text(`Due: ${new Date(dueDate).toLocaleDateString()}`);
    doc.text(`Date: ${new Date(date).toLocaleString()}`);
    if (notes) {
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor('#444444').text(`Notes: ${notes}`, {
        width: 500,
      });
      doc.fillColor('#000000');
    }
    doc.moveDown();
    doc.fontSize(16).text(`Amount: ₹${amount}`, { underline: true });
    doc.end();
  });
}

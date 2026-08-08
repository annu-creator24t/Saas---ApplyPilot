/**
 * Export and Download Helper Utilities for Generated Content
 * (Cover Letters, ATS Reports, Interview Questions, Resume Tailoring)
 */

export function exportAsFile(
  content: string,
  filename: string,
  contentType: string = "text/plain;charset=utf-8"
) {
  const blob = new Blob([content], { type: contentType });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
}

export function exportAsTxt(filename: string, content: string) {
  const safeName = filename.endsWith(".txt") ? filename : `${filename}.txt`;
  exportAsFile(content, safeName, "text/plain;charset=utf-8");
}

export function exportAsDocx(filename: string, title: string, content: string) {
  const safeName = filename.endsWith(".doc") || filename.endsWith(".docx") ? filename : `${filename}.doc`;

  // Standard Microsoft Word HTML Envelope for .doc format
  const docxHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${title}</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 12pt; line-height: 1.5; color: #111827; padding: 1in; }
        h1 { font-size: 18pt; color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 6px; margin-bottom: 16px; }
        p { margin-bottom: 12px; white-space: pre-wrap; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div>${content.replace(/\n/g, "<br/>")}</div>
    </body>
    </html>
  `;

  exportAsFile(docxHtml, safeName, "application/msword;charset=utf-8");
}

export function exportAsPdf(filename: string, title: string, content: string) {
  const safeName = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  
  // Printable HTML window trigger
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    exportAsTxt(filename, content);
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; }
        h1 { font-size: 20px; color: #1e40af; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; }
        .content { font-size: 13px; white-space: pre-wrap; margin-top: 20px; }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="content">${content}</div>
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

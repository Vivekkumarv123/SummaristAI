const fs = require('fs');
const path = require('path'); 
const PDFDocument = require('pdfkit');

// Generate .txt file
const generateTextFile = (summary, insights, filename) => {
    const content = `
    Summary:
    ${summary}

    Insights:
    - Positive Words: ${insights.positive}
    - Negative Words: ${insights.negative}
    - Neutral Words: ${insights.neutral}
    `;

    fs.writeFileSync(filename, content);
};

// Generate .pdf file
const generatePDF = (summary, insights, filename) => {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filename));

    doc.fontSize(16).text('Summary:', { underline: true });
    doc.fontSize(12).text(summary).moveDown();

    doc.fontSize(16).text('Insights:', { underline: true });
    doc.fontSize(12)
        .text(`- Positive Words: ${insights.positive}`)
        .text(`- Negative Words: ${insights.negative}`)
        .text(`- Neutral Words: ${insights.neutral}`);

    doc.end();
};

module.exports = { generateTextFile, generatePDF };

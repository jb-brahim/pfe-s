const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

async function convertAndTest() {
    try {
        const jpgImageBytes = fs.readFileSync('invoice_100 (3)_page1.jpg');
        const pdfDoc = await PDFDocument.create();
        const jpgImage = await pdfDoc.embedJpg(jpgImageBytes);
        const page = pdfDoc.addPage([jpgImage.width, jpgImage.height]);
        page.drawImage(jpgImage, {
            x: 0,
            y: 0,
            width: jpgImage.width,
            height: jpgImage.height,
        });
        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync('invoice_100_page1_test.pdf', pdfBytes);

        console.log('🚀 Sending image to your Layout-Aware AI API...');
        const form = new FormData();
        form.append('file', fs.createReadStream('invoice_100_page1_test.pdf'));

        const response = await axios.post('https://worrier-universal-phony.ngrok-free.dev/api/extract', form, {
            headers: {
                ...form.getHeaders()
            }
        });

        console.log('\n✅ --- PERFECTED JSON RESULT ---');
        console.log(JSON.stringify(response.data, null, 2));

        // Cleanup
        fs.unlinkSync('invoice_100_page1_test.pdf');

    } catch (error) {
        console.error('❌ Error:', error.response ? error.response.data : error.message);
    }
}

convertAndTest();

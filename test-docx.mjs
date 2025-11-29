
import { Packer, Document, Paragraph, TextRun } from 'docx';

async function testDocx() {
    try {
        console.log('Importing docx...');
        const docxModule = await import('docx');

        const { Packer: PackerFromModule } = docxModule;

        if (PackerFromModule) {
            console.log('Packer found');
            console.log('Packer.toBlob exists:', typeof PackerFromModule.toBlob === 'function');
            console.log('Packer.toBuffer exists:', typeof PackerFromModule.toBuffer === 'function');
        } else {
            console.error('Packer not found in docx module');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

testDocx();

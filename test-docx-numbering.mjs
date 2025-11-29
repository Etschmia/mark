
import { Document, Packer, AlignmentType } from 'docx';

async function testDocxNumbering() {
    try {
        console.log('Testing Document creation with old numbering structure...');
        // This matches the current failing code
        const doc = new Document({
            numbering: {
                numberingDefinitions: [
                    {
                        id: 0,
                        levels: [
                            {
                                level: 0,
                                format: 'decimal',
                                text: '%1.',
                                alignment: AlignmentType.LEFT,
                            },
                        ],
                    },
                ],
            },
            sections: [],
        });
        console.log('Document created successfully (unexpected).');
    } catch (error) {
        console.log('Caught expected error with old structure:', error.message);
    }

    try {
        console.log('Testing Document creation with new numbering structure (config)...');
        // This matches the proposed fix
        const doc = new Document({
            numbering: {
                config: [
                    {
                        reference: 'default-numbering',
                        levels: [
                            {
                                level: 0,
                                format: 'decimal',
                                text: '%1.',
                                alignment: AlignmentType.LEFT,
                            },
                        ],
                    },
                ],
            },
            sections: [],
        });
        console.log('Document created successfully with new structure.');
    } catch (error) {
        console.error('Error with new structure:', error);
    }
}

testDocxNumbering();

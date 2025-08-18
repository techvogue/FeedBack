const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function checkSchema() {
    try {
        console.log('Checking current form schema...');

        // Get all feedback forms
        const feedbackForms = await prisma.feedbackForm.findMany();
        console.log(`Found ${feedbackForms.length} feedback forms`);

        for (const form of feedbackForms) {
            console.log(`\nForm for event: ${form.eventId}`);
            console.log('Current schema:', JSON.stringify(form.schema, null, 2));
        }

        console.log('\nSchema check completed!');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkSchema();

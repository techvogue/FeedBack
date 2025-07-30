const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function migrateFeedbackForms() {
  try {
    console.log('Starting feedback form migration...');

    // Get all existing feedback forms
    const feedbackForms = await prisma.feedbackForm.findMany();

    console.log(`Found ${feedbackForms.length} feedback forms to migrate`);

    for (const form of feedbackForms) {
      const schema = form.schema;

      if (schema && schema.questions) {
        console.log(`Migrating form ${form.id} for event ${form.eventId}`);

        // Update each question to have matching name and title
        const updatedQuestions = schema.questions.map((question, index) => {
          // Create a clean name from the title
          let cleanName = question.title || `question_${index + 1}`;

          // Convert to lowercase and replace spaces with underscores
          cleanName = cleanName.trim()
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '') // Remove special characters
            .replace(/\s+/g, '_') // Replace spaces with underscores
            .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores

          // Ensure name is not empty
          if (!cleanName) {
            cleanName = `question_${index + 1}`;
          }

          // Update the question object
          const updatedQuestion = {
            ...question,
            name: cleanName
          };

          // Handle specific question types for consistency
          if (question.type === 'radio') {
            updatedQuestion.type = 'radiogroup';
          } else if (question.type === 'text' && question.inputType === 'number') {
            updatedQuestion.type = 'number';
            updatedQuestion.inputType = 'number';
          } else if (question.type === 'rating') {
            updatedQuestion.rateMax = question.rateMax || 5;
            updatedQuestion.rateMin = question.rateMin || 1;
            updatedQuestion.rateStep = question.rateStep || 1;
          } else if (question.type === 'boolean') {
            updatedQuestion.type = 'boolean';
          } else if (question.type === 'checkbox') {
            updatedQuestion.type = 'checkbox';
          }

          return updatedQuestion;
        });

        // Update the schema
        const updatedSchema = {
          ...schema,
          questions: updatedQuestions
        };

        // Save the updated form
        await prisma.feedbackForm.update({
          where: { id: form.id },
          data: { schema: updatedSchema }
        });

        console.log(`✓ Migrated form ${form.id}`);
      } else {
        console.log(`⚠ Form ${form.id} has no questions, skipping`);
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateFeedbackForms(); 
const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function updateFormSchema() {
  try {
    console.log('Updating form schema...');

    // Get all feedback forms
    const feedbackForms = await prisma.feedbackForm.findMany();
    console.log(`Found ${feedbackForms.length} feedback forms`);

    for (const form of feedbackForms) {
      console.log(`\nChecking form for event: ${form.eventId}`);
      
      let schema = form.schema;
      let needsUpdate = false;

      // Check if schema has pages array
      if (schema.pages && Array.isArray(schema.pages)) {
        const firstPage = schema.pages[0];
        if (firstPage.elements && Array.isArray(firstPage.elements)) {
          const updatedElements = firstPage.elements.map(question => {
            console.log(`Question: ${question.title}, Type: ${question.type}, InputType: ${question.inputType}`);
            
            let updatedQuestion = { ...question };

            // Ensure number questions have correct properties
            if (question.inputType === 'number' || question.type === 'number') {
              console.log(`Updating number question: ${question.title}`);
              updatedQuestion.type = 'text'; // SurveyJS uses 'text' with inputType 'number'
              updatedQuestion.inputType = 'number';
              updatedQuestion.chartType = 'number'; // For chart detection
              needsUpdate = true;
            }

            return updatedQuestion;
          });

          if (needsUpdate) {
            schema.pages[0].elements = updatedElements;
            
            // Update the form
            await prisma.feedbackForm.update({
              where: { id: form.id },
              data: { schema }
            });
            console.log(`Updated form for event: ${form.eventId}`);
          } else {
            console.log(`Form for event: ${form.eventId} is already correct`);
          }
        }
      }
    }

    console.log('\nForm schema update completed!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateFormSchema();

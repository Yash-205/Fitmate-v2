/**
 * FitMate End-to-End (E2E) Comprehensive Flow
 * 
 * This is the primary "happy path" test that simulates a real user journey from 
 * landing on the site to receiving a fully generated AI training plan.
 * It covers: Authentication -> Personal Assessment -> Plan Generation -> AI Chat interaction.
 */
describe('FitMate End-to-End Comprehensive Flow', () => {
  // Generate a unique email for each run to avoid collisions with existing data
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  // Global setup: Reset the entire database before running this large flow
  // to ensure a perfectly clean slate.
  before(() => {
    cy.resetDatabase();
  });

  /**
   * Main Test Case: Full User Lifecycle
   * Verifies that all disparate systems (Auth, Profiles, AI Generation, Chat)
   * connect together seamlessly.
   */
  it('should complete the full user journey: Signup -> Assessment -> Workout -> AI Chat', () => {
    
    // --- 1. SIGNUP PHASE ---
    cy.visit('/');
    // Trigger the signup modal
    cy.contains('button', /get started/i).click();
    
    // Fill the signup form fields
    // Placeholder and type selectors are used for readability
    cy.get('input[placeholder="John Doe"]').type('Test User');
    cy.get('input[type="email"]').type(testEmail);
    // .last() is used because there might be multiple password inputs in the DOM (e.g., hidden login form)
    cy.get('input[type="password"]').last().type(testPassword); 
    
    // Submit the form. {force: true} is used as a safety measure if overlapping UI elements exist.
    cy.get('button[type="submit"]').contains(/sign up/i).click({ force: true });

    // --- 2. ASSESSMENT PHASE (3-Step Wizard) ---
    // Upon successful signup, the app should automatically trigger the onboarding modal.
    cy.get('div[role="dialog"]').should('be.visible');
    cy.contains(/final assessment/i).should('be.visible');
    
    // Step 1: Basic Physical Metrics
    cy.get('input[placeholder="Years"]').type('25');
    cy.get('select').eq(0).select('Male'); // eq(0) targets the first dropdown
    cy.get('input[placeholder="Kgs"]').type('75');
    cy.get('input[placeholder="Cms"]').type('180');
    // Detailed goals help the AI provide more specific strategy descriptions
    cy.get('textarea').type('I want to build lean muscle and improve my bench press to 100kg.');
    cy.contains('button', /next/i).click();

    // Step 2: Training Environment & Experience
    cy.contains('Step 2 of 3').should('be.visible');
    cy.get('select').eq(0).select('Intermediate (1-3 years)');
    cy.get('select').eq(1).select('4'); // 4 days per week
    cy.get('select').eq(2).select('60'); // 60 minutes per session
    cy.get('select').eq(3).select('Good'); // Sleep quality
    cy.get('select').eq(4).select('Low'); // Stress level
    cy.contains('button', /next/i).click();

    // Step 3: Nutrition Preferences
    cy.contains('Step 3 of 3').should('be.visible');
    cy.get('select').eq(0).select('High Protein');
    // "Create My Program" triggers the backend Profile Upsert and initial AI Strategy generation
    cy.contains('button', /create my program/i).click();

    // --- 3. WORKOUT GENERATION PHASE ---
    // The user is redirected to the /workout dashboard after assessment
    cy.url({ timeout: 30000 }).should('include', '/workout');
    
    // Trigger the tactical workout generation (Full schedule)
    cy.contains('button', /generate workout plan/i).should('be.visible').click();
    
    // Wait for the AI "Brain" to finish thinking. 
    // We use a longer timeout (30s) as LLM calls can be slow.
    cy.contains('AI In Progress...', { timeout: 30000 }).should('be.visible');
    
    // Once done, the UI should render the Periodization Phase descriptions
    // Timeout extended to 60s for the entire chain of strategic + tactical generation.
    cy.contains('Phase', { timeout: 60000 }).should('be.visible');
    cy.contains('Strategy').should('be.visible');

    // --- 4. AI COACH INTERACTION ---
    // Navigate to the Chatbot page using the Navbar link
    cy.contains('AI Coach').click();
    cy.url().should('include', '/chat');
    
    // Send a sample query to the AI Coach
    // {enter} simulates pressing the Enter key to submit the form
    cy.get('input[placeholder*="fitness question"]').type('How much protein should I eat daily?{enter}');
    
    // Verify that the message appears in the chat history
    cy.contains('How much protein', { timeout: 10000 }).should('be.visible');
    
    // Check for the existence of user message styling (orange background) 
    // to ensure the message was rendered correctly in the UI.
    cy.get('.bg-orange-600', { timeout: 20000 }).should('exist'); 
  });

  after(() => {
    // Optional cleanup logic can be placed here if needed for specific environments.
  });
});

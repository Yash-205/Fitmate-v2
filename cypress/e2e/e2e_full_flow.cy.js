describe('FitMate End-to-End Comprehensive Flow', () => {
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  before(() => {
    // Initial reset
    cy.resetDatabase();
  });

  it('should complete the full user journey: Signup -> Assessment -> Workout -> AI Chat', () => {
    // 1. Signup
    cy.visit('/');
    cy.contains('button', /get started/i).click();
    
    // Fill signup form
    cy.get('input[placeholder="John Doe"]').type('Test User');
    cy.get('input[type="email"]').type(testEmail);
    cy.get('input[type="password"]').last().type(testPassword); // Target the password field in signup view
    cy.get('button[type="submit"]').contains(/sign up/i).click({ force: true });

    // 2. Assessment Step 1
    cy.get('div[role="dialog"]').should('be.visible');
    cy.contains(/final assessment/i).should('be.visible');
    
    cy.get('input[placeholder="Years"]').type('25');
    cy.get('select').eq(0).select('Male');
    cy.get('input[placeholder="Kgs"]').type('75');
    cy.get('input[placeholder="Cms"]').type('180');
    cy.get('textarea').type('I want to build lean muscle and improve my bench press to 100kg.');
    cy.contains('button', /next/i).click();

    // Assessment Step 2
    cy.contains('Step 2 of 3').should('be.visible');
    cy.get('select').eq(0).select('Intermediate (1-3 years)');
    cy.get('select').eq(1).select('4');
    cy.get('select').eq(2).select('60');
    cy.get('select').eq(3).select('Good');
    cy.get('select').eq(4).select('Low');
    cy.contains('button', /next/i).click();

    // Assessment Step 3
    cy.contains('Step 3 of 3').should('be.visible');
    cy.get('select').eq(0).select('High Protein');
    cy.contains('button', /create my program/i).click();

    // 3. Workout Page
    cy.url({ timeout: 30000 }).should('include', '/workout');
    cy.contains('button', /generate workout plan/i).should('be.visible').click();
    
    // Wait for AI generation (might take a bit)
    cy.contains('AI In Progress...', { timeout: 30000 }).should('be.visible');
    
    // Verify plan elements appear (indicating generation is done)
    cy.contains('Phase', { timeout: 60000 }).should('be.visible');
    cy.contains('Strategy').should('be.visible');

    // 4. AI Coach Chat
    cy.contains('AI Coach').click();
    cy.url().should('include', '/chat');
    cy.get('input[placeholder*="fitness question"]').type('How much protein should I eat daily?{enter}');
    
    // Verify chat
    cy.contains('How much protein', { timeout: 10000 }).should('be.visible');
    cy.get('.bg-orange-600', { timeout: 20000 }).should('exist'); // Verify user message bubble color
  });

  after(() => {
    // Optional cleanup after all tests
    // cy.resetDatabase();
  });
});

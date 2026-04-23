describe('Persona Switching Flow', () => {
  const userEmail = `persona_${Date.now()}@test.com`;
  const testPassword = 'Password123!';

  beforeEach(() => {
    cy.resetDatabase();
  });

  it('should allow a user to register, become a trainer, and switch personas', () => {
    // 1. Register as a new user
    cy.visit('/');
    cy.contains('button', /get started/i).click();
    
    cy.get('input[placeholder="John Doe"]').type('Switch User');
    cy.get('input[type="email"]').type(userEmail);
    cy.get('input[type="password"]').last().type(testPassword);
    cy.get('button[type="submit"]').contains(/sign up/i).click({ force: true });

    // 2. Complete Assessment (Become a Learner)
    cy.get('div[role="dialog"]').should('be.visible');
    cy.contains(/final assessment/i).should('be.visible');
    
    cy.get('input[placeholder="Years"]').type('25');
    cy.get('select').eq(0).select('Male');
    cy.get('input[placeholder="Kgs"]').type('75');
    cy.get('input[placeholder="Cms"]').type('180');
    cy.get('textarea').type('Testing persona switching.');
    cy.contains('button', /next/i).click();
    cy.contains('button', /next/i).click();
    cy.contains('button', /create my program/i).click();

    // Verify Learner mode (Workout Plan visible)
    cy.url({ timeout: 30000 }).should('include', '/workout');
    cy.get('nav').should('contain', 'Workout Plan');

    // 3. Become a Coach
    cy.get('nav').contains('Trainers').click();
    cy.contains('Start Coaching with FitMate', { timeout: 10000 }).click();

    cy.get('input[placeholder="How clients should address you"]').type('Coach Switch');
    cy.get('input[placeholder="Strength, HIIT, Yoga"]').type('Switching');
    cy.get('textarea[placeholder="Tell potential clients about your coaching philosophy..."]')
      .type('I am an expert at switching modes.');
    
    cy.contains('button', /launch coaching profile/i).click();
 
    // Verify Coach mode (Dashboard visible)
    cy.url({ timeout: 10000 }).should('include', '/trainer/dashboard');
    cy.get('nav').should('contain', 'Dashboard');
    
    // Verify Dashboard Content
    cy.contains('Assigned Clients').should('be.visible');
    cy.contains('No clients assigned yet.').should('be.visible');

    // 4. Switch to Athlete Mode using Navbar dropdown
    cy.get('nav select').select('learner');
    
    // Verify redirected to workout plan
    cy.url({ timeout: 10000 }).should('include', '/workout');
    cy.get('nav').should('contain', 'Workout Plan');
    cy.get('nav').should('not.contain', 'Dashboard');

    // 5. Switch back to Coach Mode using Navbar dropdown
    cy.get('nav select').select('trainer');

    // Verify redirected back to trainer dashboard
    cy.url({ timeout: 10000 }).should('include', '/trainer/dashboard');
    cy.get('nav').should('contain', 'Dashboard');
    cy.get('nav').should('not.contain', 'Workout Plan');
    
    // 6. Verify same options exist on Profile page
    // The Navbar shows the capitalized email prefix as the display name
    const username = userEmail.split('@')[0];
    const capitalizedName = username.charAt(0).toUpperCase() + username.slice(1);
    cy.get('nav').contains(capitalizedName).click();
    cy.url().should('include', '/profile');
    cy.get('select').should('have.value', 'trainer');
    cy.get('select').select('learner');
    
    // Should redirect to workout plan
    cy.url({ timeout: 10000 }).should('include', '/workout');
  });
});

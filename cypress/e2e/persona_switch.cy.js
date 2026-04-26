/**
 * Persona Switching Flow Tests
 * 
 * This suite verifies the complex logic required for a "dual-persona" user (Athlete + Coach).
 * It ensures that once a user becomes a trainer, they can seamlessly toggle between 
 * their personal training dashboard (Athlete mode) and their management dashboard (Coach mode).
 */
describe('Persona Switching Flow', () => {
  // Setup unique credentials for this session
  const userEmail = `persona_${Date.now()}@test.com`;
  const testPassword = 'Password123!';

  // Wipe the DB before each run to avoid data leaks between tests
  beforeEach(() => {
    cy.resetDatabase();
  });

  /**
   * Main Test: Role Lifecycle and Persona Toggling
   * Journey: Register -> Complete Athlete Assessment -> Apply to be Coach -> Toggle Modes.
   */
  it('should allow a user to register, become a trainer, and switch personas', () => {
    
    // --- 1. INITIAL REGISTRATION ---
    cy.visit('/');
    cy.contains('button', /get started/i).click();
    
    // Fill credentials
    cy.get('input[placeholder="John Doe"]').type('Switch User');
    cy.get('input[type="email"]').type(userEmail);
    cy.get('input[type="password"]').last().type(testPassword);
    cy.get('button[type="submit"]').contains(/sign up/i).click({ force: true });

    // --- 2. ATHLETE ONBOARDING ---
    // Every user starts as a "Learner" and must complete an assessment
    cy.get('div[role="dialog"]').should('be.visible');
    cy.contains(/final assessment/i).should('be.visible');
    
    // Fill minimum required data for assessment
    cy.get('input[placeholder="Years"]').type('25');
    cy.get('select').eq(0).select('Male');
    cy.get('input[placeholder="Kgs"]').type('75');
    cy.get('input[placeholder="Cms"]').type('180');
    cy.get('textarea').type('Testing persona switching.');
    
    // Skip through the multi-step wizard
    cy.contains('button', /next/i).click();
    cy.contains('button', /next/i).click();
    cy.contains('button', /create my program/i).click();

    // Verify initial "Learner" state
    // The "Workout Plan" link should be the primary nav item for athletes
    cy.url({ timeout: 30000 }).should('include', '/workout');
    cy.get('nav').should('contain', 'Workout Plan');

    // --- 3. TRAINER ONBOARDING (Role Promotion) ---
    // Navigate to the public Trainers page to find the "Become a Coach" CTA
    cy.get('nav').contains('Trainers').click();
    cy.contains('Start Coaching with FitMate', { timeout: 10000 }).click();

    // Fill out the specialized Trainer profile form
    cy.get('input[placeholder="How clients should address you"]').type('Coach Switch');
    cy.get('input[placeholder="Strength, HIIT, Yoga"]').type('Switching');
    cy.get('textarea[placeholder="Tell potential clients about your coaching philosophy..."]')
      .type('I am an expert at switching modes.');
    
    // Submitting this form promotes the user from 'learner' to 'trainer' in the DB
    cy.contains('button', /launch coaching profile/i).click();
 
    // Verify immediate redirect to the Trainer Dashboard (Coach mode)
    cy.url({ timeout: 10000 }).should('include', '/trainer/dashboard');
    cy.get('nav').should('contain', 'Dashboard');
    
    // Verify core dashboard elements are visible
    cy.contains('Assigned Clients').should('be.visible');
    cy.contains('No clients assigned yet.').should('be.visible');

    // --- 4. TOGGLE: COACH -> ATHLETE ---
    // Use the specialized <select> dropdown in the Navbar to switch modes
    cy.get('nav select').select('learner');
    
    // Verify the UI context switches back to the Athlete view
    cy.url({ timeout: 10000 }).should('include', '/workout');
    cy.get('nav').should('contain', 'Workout Plan');
    // The "Dashboard" link (Coach-only) should be removed from view
    cy.get('nav').should('not.contain', 'Dashboard');

    // --- 5. TOGGLE: ATHLETE -> COACH ---
    // Switch back to Coach mode to ensure the state persistency
    cy.get('nav select').select('trainer');

    // Confirm the Dashboard is visible again
    cy.url({ timeout: 10000 }).should('include', '/trainer/dashboard');
    cy.get('nav').should('contain', 'Dashboard');
    cy.get('nav').should('not.contain', 'Workout Plan');
    
    // --- 6. PROFILE PAGE REDIRECTION ---
    // Verify that switching personas also works from the main Profile page
    const username = userEmail.split('@')[0];
    const capitalizedName = username.charAt(0).toUpperCase() + username.slice(1);
    
    // Click the User Profile link in the Nav
    cy.get('nav').contains(capitalizedName).click();
    cy.url().should('include', '/profile');
    
    // Ensure the switcher dropdown exists and is currently set to 'trainer'
    cy.get('select').should('have.value', 'trainer');
    
    // Switch to athlete mode from the Profile settings
    cy.get('select').select('learner');
    
    // Final redirect check
    cy.url({ timeout: 10000 }).should('include', '/workout');
  });
});

/**
 * Trainer Role and Connection Flow Tests
 * 
 * This is a high-complexity test that simulates the interaction between TWO users:
 * 1. User A (Trainer): Registers and sets up a professional coaching profile.
 * 2. User B (Learner): Registers and connects to the Trainer created in step 1.
 * 3. User A (Trainer): Verifies that the new client appears on their dashboard.
 */
describe('Trainer Role and Connection Flow', () => {
  // Setup unique credentials for both personas
  const trainerEmail = `coach_${Date.now()}@test.com`;
  const learnerEmail = `athlete_${Date.now()}@test.com`;
  const testPassword = 'Password123!';

  // Wipe the DB before each run to ensure no stale trainers or clients interfere
  beforeEach(() => {
    cy.resetDatabase();
  });

  /**
   * Main Test: Multi-User Collaboration
   * Verifies the full B2B2C (Business to Coach to Client) lifecycle.
   */
  it('should allow a learner to become a coach and then another learner to connect', () => {
    
    // ────────────────────────────────────────────────────────────────
    // STEP 1: CREATE THE COACH
    // ────────────────────────────────────────────────────────────────
    cy.visit('/');
    cy.contains('button', /get started/i).click();
    
    // Register the trainer as a standard user first
    cy.get('input[placeholder="John Doe"]').type('Coach Cypress');
    cy.get('input[type="email"]').type(trainerEmail);
    cy.get('input[type="password"]').last().type(testPassword);
    cy.get('button[type="submit"]').contains(/sign up/i).click({ force: true });

    // Assessment Step 1: Physical Data
    cy.get('div[role="dialog"]').should('be.visible');
    cy.get('input[placeholder="Years"]').type('30');
    cy.get('select').eq(0).select('Male');
    cy.get('input[placeholder="Kgs"]').type('85');
    cy.get('input[placeholder="Cms"]').type('180');
    cy.get('textarea').type('I am a pro coach onboarding myself.');
    cy.contains('button', /next/i).click();

    // Assessment Step 2: Training Habits
    cy.get('select').eq(0).select('Advanced (3+ years)');
    cy.get('select').eq(1).select('5'); // 5 days/week
    cy.get('select').eq(2).select('60'); // 60 mins/session
    cy.get('select').eq(3).select('Good');
    cy.get('select').eq(4).select('Low');
    cy.contains('button', /next/i).click();

    // Assessment Step 3: Nutrition
    cy.get('select').eq(0).select('Standard (No Restrictions)');
    cy.contains('button', /create my program/i).click();

    // Redirected to workout dashboard
    cy.url({ timeout: 15000 }).should('include', '/workout');

    // NAVIGATE TO TRAINER ONBOARDING
    cy.get('nav').contains('Trainers').click();
    
    // Locate the "Become a Coach" CTA section
    cy.contains('Are you a Professional Coach?', { timeout: 10000 }).should('be.visible');
    cy.contains('Start Coaching with FitMate').click();

    // Fill out the specialized Coach Profile (Professional information)
    cy.get('input[placeholder="How clients should address you"]').type('Coach Cypress');
    cy.get('input[placeholder="Strength, HIIT, Yoga"]').type('Automated Testing, Endurance');
    cy.get('textarea[placeholder="Tell potential clients about your coaching philosophy..."]')
      .type('I am a professional automated test coach. I help apps run faster.');
    cy.get('input[placeholder="NASM-CPT, Precision Nutrition..."]').type('Cypress Certified');
    
    // Promotion trigger
    cy.contains('button', /launch coaching profile/i).click();

    // Success verification: The user should now see their Trainer Dashboard
    cy.url({ timeout: 10000 }).should('include', '/trainer/dashboard');
    cy.contains('Welcome back, Coach Cypress').should('be.visible');

    // ────────────────────────────────────────────────────────────────
    // STEP 2: CREATE THE ATHLETE AND CONNECT TO THE COACH
    // ────────────────────────────────────────────────────────────────
    // Clear session to simulate a different user on a different machine
    cy.clearLocalStorage();
    cy.visit('/');
    cy.contains('button', /get started/i).click();

    // Register User B
    cy.get('input[placeholder="John Doe"]').type('Athlete Cypress');
    cy.get('input[type="email"]').type(learnerEmail);
    cy.get('input[type="password"]').last().type(testPassword);
    cy.get('button[type="submit"]').contains(/sign up/i).click({ force: true });

    // Complete health assessment for User B
    cy.get('input[placeholder="Years"]').type('22');
    cy.get('select').eq(0).select('Male');
    cy.get('input[placeholder="Kgs"]').type('65');
    cy.get('input[placeholder="Cms"]').type('170');
    cy.get('textarea').type('I need a coach.');
    cy.contains('button', /next/i).click();
    cy.contains('button', /next/i).click();
    cy.contains('button', /create my program/i).click();

    // Verification of redirect
    cy.url({ timeout: 30000 }).should('include', '/workout');
    cy.get('div[role="dialog"]').should('not.exist');

    // Generate their workout plan
    cy.contains('button', /generate workout plan/i).should('be.visible').click();
    cy.contains(/phase 1/i, { timeout: 30000 }).should('be.visible');

    // FIND AND CONNECT TO COACH
    cy.get('nav').contains('Trainers').click();

    // Search for the coach we created in Step 1
    cy.contains('Coach Cypress').should('be.visible');
    // Trigger the connection logic (Updates the learner profile with trainerId)
    cy.contains('button', /connect to trainer/i).click();

    // Confirmation that the connection was saved
    cy.contains('My Coach', { timeout: 10000 }).should('be.visible');

    // ────────────────────────────────────────────────────────────────
    // STEP 3: TRAINER VERIFICATION
    // ────────────────────────────────────────────────────────────────
    // Logout the Athlete and log back in as the Trainer
    cy.clearLocalStorage();
    cy.visit('/');
    cy.contains('button', /log in/i).click();

    // Use trainer credentials
    cy.get('input[type="email"]').type(trainerEmail);
    // Use first() because the hidden signup form also has a password field
    cy.get('input[type="password"]').first().type(testPassword);
    cy.get('button[type="submit"]').contains(/log in/i).click({ force: true });

    // Trainers should be automatically redirected to their Dashboard on login
    cy.url({ timeout: 15000 }).should('include', '/trainer/dashboard');

    // VERIFY CLIENT DATA IN DASHBOARD
    cy.contains('Assigned Clients').should('be.visible');
    // Ensure the client count has incremented to 1
    cy.contains('Total Clients: 1').should('be.visible');
    
    // Cross-verify the athlete's specific data points to ensure the correct record is displayed
    cy.contains('I need a coach.').should('be.visible'); // The goal we entered for the athlete
    cy.contains('65kg').should('be.visible'); // The weight we entered for the athlete
  });
});

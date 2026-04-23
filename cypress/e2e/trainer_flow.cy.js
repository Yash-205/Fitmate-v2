describe('Trainer Role and Connection Flow', () => {
  const trainerEmail = `coach_${Date.now()}@test.com`;
  const learnerEmail = `athlete_${Date.now()}@test.com`;
  const testPassword = 'Password123!';

  beforeEach(() => {
    // Use the custom command that is verified to work
    cy.resetDatabase();
  });

  it('should allow a learner to become a coach and then another learner to connect', () => {
    // ────────────────────────────────────────────────────────────────
    // STEP 1: USER B BECOMES A COACH VIA UI
    // ────────────────────────────────────────────────────────────────
    cy.visit('/');
    cy.contains('button', /get started/i).click();
    
    // Fill signup form (Inspired by working e2e_full_flow)
    cy.get('input[placeholder="John Doe"]').type('Coach Cypress');
    cy.get('input[type="email"]').type(trainerEmail);
    cy.get('input[type="password"]').last().type(testPassword);
    cy.get('button[type="submit"]').contains(/sign up/i).click({ force: true });

    // Assessment Step 1
    cy.get('div[role="dialog"]').should('be.visible');
    cy.get('input[placeholder="Years"]').type('30');
    cy.get('select').eq(0).select('Male');
    cy.get('input[placeholder="Kgs"]').type('85');
    cy.get('input[placeholder="Cms"]').type('180');
    cy.get('textarea').type('I am a pro coach onboarding myself.');
    cy.contains('button', /next/i).click();

    // Assessment Step 2
    cy.get('select').eq(0).select('Advanced (3+ years)');
    cy.get('select').eq(1).select('5');
    cy.get('select').eq(2).select('60');
    cy.get('select').eq(3).select('Good');
    cy.get('select').eq(4).select('Low');
    cy.contains('button', /next/i).click();

    // Assessment Step 3
    cy.get('select').eq(0).select('Standard (No Restrictions)');
    cy.contains('button', /create my program/i).click();

    // Verify redirected to workout
    cy.url({ timeout: 15000 }).should('include', '/workout');

    // Navigate to Trainers discovery page
    cy.get('nav').contains('Trainers').click();
    
    // Click the "Become a Coach" CTA at the bottom
    cy.contains('Are you a Professional Coach?', { timeout: 10000 }).should('be.visible');
    cy.contains('Start Coaching with FitMate').click();

    // Fill out the Professional Coach Profile Modal
    cy.get('input[placeholder="How clients should address you"]').type('Coach Cypress');
    cy.get('input[placeholder="Strength, HIIT, Yoga"]').type('Automated Testing, Endurance');
    cy.get('textarea[placeholder="Tell potential clients about your coaching philosophy..."]')
      .type('I am a professional automated test coach. I help apps run faster.');
    cy.get('input[placeholder="NASM-CPT, Precision Nutrition..."]').type('Cypress Certified');
    
    cy.contains('button', /launch coaching profile/i).click();

    // Should be redirected to Trainer Dashboard
    cy.url({ timeout: 10000 }).should('include', '/trainer/dashboard');
    cy.contains('Welcome back, Coach Cypress').should('be.visible');

    // ────────────────────────────────────────────────────────────────
    // STEP 2: USER A CONNECTS TO COACH CYPRESS
    // ────────────────────────────────────────────────────────────────
    cy.clearLocalStorage();
    cy.visit('/');
    cy.contains('button', /get started/i).click();

    cy.get('input[placeholder="John Doe"]').type('Athlete Cypress');
    cy.get('input[type="email"]').type(learnerEmail);
    cy.get('input[type="password"]').last().type(testPassword);
    cy.get('button[type="submit"]').contains(/sign up/i).click({ force: true });

    // Complete basic health profile
    cy.get('input[placeholder="Years"]').type('22');
    cy.get('select').eq(0).select('Male');
    cy.get('input[placeholder="Kgs"]').type('65');
    cy.get('input[placeholder="Cms"]').type('170');
    cy.get('textarea').type('I need a coach.');
    cy.contains('button', /next/i).click();
    cy.contains('button', /next/i).click();
    cy.contains('button', /create my program/i).click();

    // Wait for the modal to close and the redirect to happen
    cy.url({ timeout: 30000 }).should('include', '/workout');
    cy.get('div[role="dialog"]').should('not.exist');

    // Generate Workout Plan for the Athlete
    cy.contains('button', /generate workout plan/i).should('be.visible').click();
    
    // Wait for AI generation to complete
    cy.contains(/phase 1/i, { timeout: 30000 }).should('be.visible');

    // Go to Trainers Page
    cy.get('nav').contains('Trainers').click();

    // Connect to the newly created Coach
    cy.contains('Coach Cypress').should('be.visible');
    cy.contains('button', /connect to trainer/i).click();

    // Verify Connection State
    cy.contains('My Coach', { timeout: 10000 }).should('be.visible');

    // ────────────────────────────────────────────────────────────────
    // STEP 3: COACH LOGS BACK IN TO SEE THEIR CLIENT
    // ────────────────────────────────────────────────────────────────
    cy.clearLocalStorage();
    cy.visit('/');
    cy.contains('button', /log in/i).click();

    // Fill login form
    cy.get('input[type="email"]').type(trainerEmail);
    cy.get('input[type="password"]').first().type(testPassword);
    cy.get('button[type="submit"]').contains(/log in/i).click({ force: true });

    // Ensure we wait for successful login redirect directly to dashboard
    cy.url({ timeout: 15000 }).should('include', '/trainer/dashboard');

    // Verify the Client is on the Dashboard
    cy.contains('Assigned Clients').should('be.visible');
    // Since we removed populate, it won't show the email anymore, it shows the ID, 
    // but the card should exist and the count should be 1.
    cy.contains('Total Clients: 1').should('be.visible');
    // Check for goal or experience that we entered for the athlete
    cy.contains('I need a coach.').should('be.visible'); // The goal we entered
    cy.contains('65kg').should('be.visible'); // The weight we entered
  });
});

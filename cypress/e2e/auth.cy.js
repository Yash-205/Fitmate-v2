/**
 * Authentication Flow Tests
 * 
 * This suite verifies the basic UI behavior of the authentication system,
 * specifically ensuring that the login/signup modals open correctly and
 * that users can toggle between the two views.
 */
describe('Authentication Flow', () => {
  // Before each test, navigate to the landing page to start from a clean state
  beforeEach(() => {
    cy.visit('/');
  });

  /**
   * Test: Login Modal Visibility
   * Ensures the "Log In" button opens the correct dialog.
   */
  it('should show the login modal when clicking login button', () => {
    // Find the button with text "Log In" (case-insensitive) and click it
    cy.contains('button', /log in/i).click();
    
    // Verify that an element with the accessibility role "dialog" (the modal) appears
    cy.get('div[role="dialog"]').should('be.visible');
    
    // Check that the heading inside the modal says "Log In" to confirm we're in the right view
    cy.contains('h2', /log in/i).should('be.visible');
  });

  /**
   * Test: Signup Modal Visibility (Hero CTA)
   * Ensures the "Get Started" call-to-action opens the signup view.
   */
  it('should show the signup modal when clicking get started', () => {
    // Find and click the "Get Started" button in the hero section
    cy.contains('button', /get started/i).click();
    
    // Ensure the auth modal (dialog) becomes visible
    cy.get('div[role="dialog"]').should('be.visible');
    
    // Verify the title is "Create Account" instead of "Log In"
    cy.contains('h2', /create account/i).should('be.visible');
  });

  /**
   * Test: Signup Modal Visibility (Navbar Button)
   * Ensures the "Sign Up" button in the Navbar opens the signup view.
   */
  it('should show the signup modal when clicking sign up in navbar', () => {
    // Click the "Sign Up" button in the navbar
    cy.get('nav').contains('button', /sign up/i).click();
    
    // Ensure the auth modal (dialog) becomes visible
    cy.get('div[role="dialog"]').should('be.visible');
    
    // Verify the title is "Create Account"
    cy.contains('h2', /create account/i).should('be.visible');
  });

  /**
   * Test: Guest Redirection on Trainers Page
   * Verifies that a guest clicking "Start Coaching" is prompted to signup.
   */
  it('should prompt signup when a guest clicks "Start Coaching" on Trainers page', () => {
    // Navigate to the Trainers page
    cy.get('nav').contains('Trainers').click();
    cy.url().should('include', '/trainers');
    
    // Click the "Start Coaching" button in the CTA section
    cy.contains('button', /start coaching/i).click();
    
    // Ensure the signup modal appears
    cy.get('div[role="dialog"]').should('be.visible');
    cy.contains('h2', /create account/i).should('be.visible');
  });

  /**
   * Test: View Switching
   * Verifies that the "toggle" link inside the modal works as expected.
   */
  it('should switch between login and signup', () => {
    // Start by opening the Login view
    cy.contains('button', /log in/i).click();
    
    // Click the toggle button (e.g., "Don't have an account? Sign up")
    // data-testid is used here for reliable selection of the internal link
    cy.get('[data-testid="auth-view-toggle"]').click();
    
    // Assert that the view has successfully switched to the signup state
    cy.contains('h2', /create account/i).should('be.visible');
    
    // Click the toggle again to return to the Login view
    cy.get('[data-testid="auth-view-toggle"]').click();
    
    // Confirm the view is back to "Log In"
    cy.contains('h2', /log in/i).should('be.visible');
  });
});

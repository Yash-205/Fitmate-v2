/**
 * Navigation and Landing Page Tests
 * 
 * This suite verifies the core visibility of the marketing page and 
 * basic routing behavior (like footer links and 404 redirection).
 */
describe('Navigation and Landing Page', () => {
  // Always start at the root URL
  beforeEach(() => {
    cy.visit('/');
  });

  /**
   * Test: Hero Section Visibility
   * Ensures the brand messaging is present for first-time visitors.
   */
  it('should display the main landing page content', () => {
    // Assert the presence of the main marketing headline
    cy.contains('h1', /elevate your fitness/i).should('be.visible');
    
    // Check for the AI branding text
    cy.contains('AI-Powered Personal Training').should('be.visible');
  });

  /**
   * Test: Footer Links
   * Verifies that the footer exists and contains mandatory legal links.
   */
  it('should have working footer links', () => {
    // Scroll to the bottom to ensure visibility for screenshots and proper interaction
    cy.get('footer').scrollIntoView();
    
    // Verify that "Privacy" and "Terms" links exist and are valid <a> tags with href attributes
    cy.get('footer').contains(/privacy/i).should('have.attr', 'href');
    cy.get('footer').contains(/terms/i).should('have.attr', 'href');
  });

  /**
   * Test: Route Redirection (404 handling)
   * Verifies that the React Router fallback redirects unknown paths to home.
   */
  it('should navigate back to home if an invalid route is visited', () => {
    // Attempt to visit a non-existent URL path
    cy.visit('/invalid-page');
    
    // Assert that the app automatically redirects the user back to the landing page
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });
});

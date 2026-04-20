describe('Navigation and Landing Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the main landing page content', () => {
    cy.contains('h1', /elevate your fitness/i).should('be.visible');
    cy.contains('AI-Powered Personal Training').should('be.visible');
  });

  it('should have working footer links', () => {
    cy.get('footer').scrollIntoView();
    cy.get('footer').contains(/privacy/i).should('have.attr', 'href');
    cy.get('footer').contains(/terms/i).should('have.attr', 'href');
  });

  it('should navigate back to home if an invalid route is visited', () => {
    cy.visit('/invalid-page');
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });
});

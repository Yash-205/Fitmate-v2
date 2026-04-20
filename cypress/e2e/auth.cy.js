describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should show the login modal when clicking login button', () => {
    cy.contains('button', /log in/i).click();
    cy.get('div[role="dialog"]').should('be.visible');
    cy.contains('h2', /log in/i).should('be.visible');
  });

  it('should show the signup modal when clicking get started', () => {
    cy.contains('button', /get started/i).click();
    cy.get('div[role="dialog"]').should('be.visible');
    cy.contains('h2', /create account/i).should('be.visible');
  });

  it('should switch between login and signup', () => {
    cy.contains('button', /log in/i).click();
    cy.get('[data-testid="auth-view-toggle"]').click();
    cy.contains('h2', /create account/i).should('be.visible');
    cy.get('[data-testid="auth-view-toggle"]').click();
    cy.contains('h2', /log in/i).should('be.visible');
  });
});

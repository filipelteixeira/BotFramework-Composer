// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('Luis Deploy', () => {
  beforeEach(() => {
    cy.server();
    cy.route('POST', '/api/publish/*/publish/default', { endpointURL: 'anything', status: 202 });
    cy.route('POST', '/api/projects/*/settings', 'OK');
    cy.route('GET', '/api/publish/*/status/default', { endpointURL: 'anything', status: 404 });
    cy.visit('/home');
    cy.createBot('ToDoBotWithLuisSample');
    cy.visitPage('Design');
  });

  it('can deploy luis success', () => {
    cy.visitPage('Project Settings');
    cy.findByText('LUIS and QnA').click();
    cy.findAllByTestId('rootLUISAuthoringKey').type('12345678', { delay: 200 });
    cy.findAllByTestId('rootLUISRegion').click();
    cy.findByText('westus').click();
    cy.visitPage('User Input');
    cy.visitPage('Design');
    cy.route({
      method: 'POST',
      url: 'api/projects/*/build',
      status: 400,
      response: 'fixture:luPublish/failure',
    });
    cy.findByTitle(/^Start bot/).click();
    cy.findByTestId('runtime-logs-sidebar');

    cy.route({
      method: 'POST',
      url: 'api/projects/*/build',
      status: 200,
      response: 'fixture:luPublish/success',
    });
    cy.findByTitle(/^Start bot/).click();
    cy.findByTitle(/^Starting bot../);
  });
});

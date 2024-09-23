const fs = require('fs'); // Required to work with file system for storing data

describe('Amazon Login to Checkout Flow - Titan Watch', () => {

  Cypress.config('defaultCommandTimeout', 10000);

  // Base URL for Amazon
  beforeEach(() => {
    cy.visit('https://www.amazon.in');
  });

  // Test Case 1: Login to Amazon
  it('Login to Amazon', () => {
    // Step 1: Click on Sign In button
    cy.get('#nav-link-accountList').click();
    cy.wait(3000);
    

    // Step 2: Enter mobile number
    cy.get('input[name="email"]').type('sanyogk18@gmail.com');
    cy.screenshot('1_Enter_email');
    cy.get('input#continue').click();
    cy.wait(3000);
    cy.screenshot('2_Enter_passwd');

    // Step 3: Enter password and submit
    cy.get('input[name="password"]').type('Sanyog@123');
    cy.get('input#signInSubmit').click();
    cy.wait(5000); // Wait for login to complete
    cy.screenshot('3_Login_Success');
  });

  // Test Case 2: Search for a Product
  it('Search for Titan Watch', () => {
    // Step 4: Search for 'Titan Watch'
    cy.get('#twotabsearchtextbox').click().type('Titan watch{enter}');
    cy.wait(3000); // Wait for search results to load
    cy.screenshot('4_Search_Results');

    // Ensure that product container is visible
    cy.get('.s-main-slot').should('be.visible'); 
  });

  // Test Case 3: Store Product Data and Save to JSON File
  it('Capture Product Details and Save to JSON', () => {
    cy.get('#twotabsearchtextbox').click().type('Titan watch{enter}');
    cy.wait(3000);
    

    cy.document().then(doc => {
      const products = [];
      const productElements = doc.querySelectorAll('.s-main-slot .s-result-item');

      productElements.forEach(productElement => {
        const nameElement = productElement.querySelector('h2 a span');
        const name = nameElement ? nameElement.innerText : 'No name found';

        const priceElement = productElement.querySelector('.a-price .a-offscreen');
        const price = priceElement ? priceElement.innerText : 'No price found';

        const linkElement = productElement.querySelector('h2 a');
        const link = linkElement ? linkElement.href : 'No link found';

        if (name && price && link) {
          products.push({ name, price, link });
        }
      });

      // Save products data to JSON file
      cy.writeFile('cypress/reports/Amazon_search_productData.json', products);

      products.forEach(product => {
        console.log(`Product Name: ${product.name}`);
        console.log(`Product Price: ${product.price}`);
        console.log(`Product Link: ${product.link}`);
      });

      expect(products).to.have.length.greaterThan(0);
    });
  });

  // Test Case 4: Add Product to Cart
  it('Add Product to Cart', () => {
    cy.get('#twotabsearchtextbox').click().type('Titan watch{enter}');
    cy.wait(3000);
   

    cy.get('h2 a.a-link-normal').first().invoke('removeAttr', 'target').click();
    cy.wait(3000); // Wait for the product page to load
    cy.screenshot('5_Product_Details');
    // Add the product to the cart
    cy.get('#add-to-cart-button').click();
    cy.wait(5000);
    

    // Handle optional protection plan popup
    cy.get('#attachSiNoCoverage').click();
    cy.wait(5000);
    
  });

  // Test Case 5: Proceed to Buy Now
  it('Proceed to Buy Now', () => {
    cy.get('#twotabsearchtextbox').click().type('Titan watch{enter}');
    cy.wait(3000);
    

    cy.get('h2 a.a-link-normal').first().invoke('removeAttr', 'target').click();
    cy.wait(3000);

    cy.get('#add-to-cart-button').click();
    cy.wait(5000);

    cy.get('#attachSiNoCoverage').click();
    cy.wait(5000);
    cy.screenshot('6_GoTo_Payment_Gateway_Page');

    cy.get('#desktop-ptc-button-celWidget').click(); 
    cy.wait(5000); // Wait for the action to complete
    cy.screenshot('7_Payment_Gateway_Page');
  });

  // Test Case 6: Payment Gateway Navigation
  it('Navigate to Payment Gateway', () => {
    cy.get('#twotabsearchtextbox').click().type('Titan watch{enter}');
    cy.wait(3000);

    cy.get('h2 a.a-link-normal').first().invoke('removeAttr', 'target').click();
    cy.wait(3000);

    cy.get('#add-to-cart-button').click();
    cy.wait(5000);

    cy.get('#attachSiNoCoverage').click();
    cy.wait(5000);

    cy.get('#desktop-ptc-button-celWidget').click();
    cy.wait(5000);
    

    // Click on 'Proceed to checkout'
    cy.get('#add-new-address-popover-link').click();
    cy.wait(3000);

    // Fill in address details
    cy.get('#address-ui-widgets-enterAddressFullName').click().type('sanyog');
    cy.get('#address-ui-widgets-enterAddressPhoneNumber').click().type('9336263663');
    cy.get('#address-ui-widgets-enterAddressPostalCode').click().type('400615');
    cy.get('#address-ui-widgets-enterAddressLine1').click().type('1304, Vihang hills');
    cy.get('#address-ui-widgets-enterAddressLine2').click().type('Thane');
    cy.get('#address-ui-widgets-landmark').click().type('test');
    cy.get('#address-ui-widgets-enterAddressCity').click().type('Thane');
    cy.get('#address-ui-widgets-enterAddressStateOrRegion').click();
    cy.get('#address-ui-widgets-enterAddressStateOrRegion-dropdown-nativeId_20').click();

    // Click to save the address
    cy.get('#address-ui-widgets-form-submit-button').click();
    cy.wait(3000);
    cy.screenshot('8_proseed_to_payment');
  });
});

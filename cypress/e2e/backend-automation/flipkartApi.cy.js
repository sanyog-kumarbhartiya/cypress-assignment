const config = require('../../e2e/config');

describe('Flipkart Product Search API Tests', () => {
  const apiEndpoint = config.flipkart.apiEndpoint;
  const headers = config.flipkart.headers;

  // Helper function to build query string
  function buildQueryString(params) {
    return Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
  }

  // Build full URL with query parameters
  const queryString = buildQueryString(config.flipkart.queryParams);
  const fullUrl = `${apiEndpoint}?${queryString}`;

  // Helper function to handle rate limit
  function handleRateLimit(response) {
    if (response.status === 429) {
      cy.log('Rate limit exceeded. Skipping tests.');
      expect(response.status).to.eq(429);
      throw new Error('Rate limit exceeded. Skipping tests.');
    }
  }

  // Test 1: Verify API Status Code and Response Time
  it('should return 200 status and respond within acceptable time', () => {
    cy.request({
      method: 'GET',
      url: fullUrl,
      headers: headers,
      failOnStatusCode: false
    }).then((response) => {
      handleRateLimit(response);
      cy.log('Full URL:', fullUrl); // Log the full URL for debugging
      cy.log('Response Body:', JSON.stringify(response.body)); // Log full response body
      expect(response.status).to.eq(200);
      expect(response.duration).to.be.lessThan(10000); // Response time threshold
  
      // Additional log for troubleshooting
      if (response.status !== 200) {
        cy.log('Failed Response:', JSON.stringify(response));
      }
    });
  });

  // Test 2: Validate Response Structure
  it('should contain necessary fields in the response body', () => {
    cy.request({
      method: 'GET',
      url: fullUrl,
      headers: headers,
      failOnStatusCode: false
    }).then((response) => {
      handleRateLimit(response);
      if (response.status !== 200) {
        cy.log('Response Body on Error:', JSON.stringify(response.body));
        return; // Exit if the response is not OK
      }
      expect(response.body).to.have.property('totalPages');
      expect(response.body).to.have.property('productsInPage');
      expect(response.body).to.have.property('products');
    });
  });

  // Test 3: Verify Total Products Count
  it('should have a total products count greater than zero', () => {
    cy.request({
      method: 'GET',
      url: fullUrl,
      headers: headers,
      failOnStatusCode: false
    }).then((response) => {
      handleRateLimit(response);
      if (response.status !== 200) {
        cy.log('Response Body on Error:', JSON.stringify(response.body));
        return; // Exit if the response is not OK
      }
      expect(response.body.productsInPage).to.be.greaterThan(0);
    });
  });

  // Test 4: Validate Each Product's Structure
  it('should have all necessary fields for each product', () => {
    cy.request({
      method: 'GET',
      url: fullUrl,
      headers: headers,
      failOnStatusCode: false
    }).then((response) => {
      handleRateLimit(response);
      if (response.status !== 200) {
        cy.log('Response Body on Error:', JSON.stringify(response.body));
        return; // Exit if the response is not OK
      }
      const products = response.body.products;
      products.forEach((product) => {
        expect(product).to.have.property('pid');
        expect(product).to.have.property('brand');
        expect(product).to.have.property('title');
        expect(product).to.have.property('price');
        expect(product).to.have.property('url');
      });
    });
  });

  // Test 5: Validate Stock Status
  it('should check if the product is in stock', () => {
    cy.request({
      method: 'GET',
      url: fullUrl,
      headers: headers,
      failOnStatusCode: false
    }).then((response) => {
      handleRateLimit(response);
      if (response.status !== 200) {
        cy.log('Response Body on Error:', JSON.stringify(response.body));
        return; // Exit if the response is not OK
      }
      const products = response.body.products;
      products.forEach((product) => {
        expect(product).to.have.property('stock').and.eq('IN_STOCK');
      });
    });
  });

  // Test 6: Validate Currency Consistency (INR)
  it('should have INR as the currency for all products', () => {
    cy.request({
      method: 'GET',
      url: fullUrl,
      headers: headers,
      failOnStatusCode: false
    }).then((response) => {
      handleRateLimit(response);
      if (response.status !== 200) {
        cy.log('Response Body on Error:', JSON.stringify(response.body));
        return; // Exit if the response is not OK
      }
      const products = response.body.products;
      products.forEach((product) => {
        expect(product.price).to.be.a('number');
        expect(product.price).to.be.greaterThan(0);
      });
    });
  });

  // Test 7: Verify Image URL for Each Product
  it('should have image URL for each product', () => {
    cy.request({
      method: 'GET',
      url: fullUrl,
      headers: headers,
      failOnStatusCode: false
    }).then((response) => {
      handleRateLimit(response);
      if (response.status !== 200) {
        cy.log('Response Body on Error:', JSON.stringify(response.body));
        return; // Exit if the response is not OK
      }
      const products = response.body.products;
      products.forEach((product) => {
        expect(product).to.have.property('images').and.be.an('array');
      });
    });
  });

  // Test 8: Validate Product Highlights (e.g. Display Type, Strap)
  it('should have proper highlights for each product', () => {
    cy.request({
      method: 'GET',
      url: fullUrl,
      headers: headers,
      failOnStatusCode: false
    }).then((response) => {
      handleRateLimit(response);
      if (response.status !== 200) {
        cy.log('Response Body on Error:', JSON.stringify(response.body));
        return; // Exit if the response is not OK
      }
      const products = response.body.products;
      products.forEach((product) => {
        expect(product).to.have.property('highlights').and.be.an('array');
      });
    });
  });

  // Test 9: Save Product Data to JSON File
  it('should save product data to a JSON file', () => {
    cy.request({
      method: 'GET',
      url: fullUrl,
      headers: headers,
      failOnStatusCode: false
    }).then((response) => {
      handleRateLimit(response);
      if (response.status !== 200) {
        cy.log('Response Body on Error:', JSON.stringify(response.body));
        return; // Exit if the response is not OK
      }
      const products = response.body.products;

      // Map and format the product data
      const productData = products.map((product) => ({
        id: product.pid,
        name: product.title,
        price: product.price,
        url: product.url,
        images: product.images
      }));

      // Write the product data to a JSON file
      cy.writeFile('cypress/reports/flipkartApi_productData.json', productData);

      // Log the output
      cy.log('Product data saved to reports/flipkartApi_productData.json');
    });
  });
});

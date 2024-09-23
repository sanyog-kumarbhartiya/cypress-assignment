const config = require('../price.config');

describe('Amazon and Flipkart Selected Product Price Comparison', () => {
  let amazonProducts = [];
  let flipkartProducts = [];

  // Fetch Amazon Products
  function fetchAmazonProducts(callback) {
    const amazonQueryParams = { ...config.amazon.queryParams };

    cy.request({
      method: 'GET',
      url: `${config.amazon.apiEndpoint}?${new URLSearchParams(amazonQueryParams).toString()}`,
      headers: config.amazon.headers,
    }).then((response) => {
      // Log Amazon API response to the console
      console.log('Amazon API Response:', response.body);

      if (response.body && response.body.data && response.body.data.products) {
        amazonProducts.push(...response.body.data.products);
      }
      callback();
    });
  }

  // Fetch Flipkart Products
  function fetchFlipkartProducts(callback) {
    const flipkartQueryParams = { ...config.flipkart.queryParams };

    cy.request({
      method: 'GET',
      url: `${config.flipkart.apiEndpoint}?${new URLSearchParams(flipkartQueryParams).toString()}`,
      headers: config.flipkart.headers,
    }).then((response) => {
      // Log Flipkart API response to the console
      console.log('Flipkart API Response:', response.body);

      if (response.body && response.body.products) {
        flipkartProducts.push(...response.body.products);
      }
      callback();
    });
  }

  it('Fetch and Compare Amazon 0th Index with Flipkart 12th Index', (done) => {
    fetchAmazonProducts(() => {
      // Introduce a wait time (e.g., 2 seconds) before fetching Flipkart products
      cy.wait(2000).then(() => {
        fetchFlipkartProducts(() => {
          const amazonProduct = amazonProducts[0];
          const flipkartProduct = flipkartProducts[23]; // Assuming 12th index for Flipkart

          // Handle cases where products might not be found
          if (!amazonProduct || !flipkartProduct) {
            cy.log('One or both products were not found.').then(() => done());
            return;
          }

          const amazonPrice = parseFloat(amazonProduct.product_price.replace(/[^\d.]/g, '')) || 0;
          const flipkartPrice = parseFloat(flipkartProduct.price.toString().replace(/[^\d.]/g, '')) || 0;

          let comparisonMessage = '';

          if (amazonPrice < flipkartPrice) {
            comparisonMessage = 'Amazon has a lower price';
          } else if (flipkartPrice < amazonPrice) {
            comparisonMessage = 'Flipkart has a lower price';
          } else {
            comparisonMessage = 'Both have the same price';
          }

          const comparisonResult = {
            amazonProduct: {
              title: amazonProduct.title || 'N/A',
              price: amazonProduct.product_price || 'N/A',
              link: amazonProduct.product_url || 'N/A',
            },
            flipkartProduct: {
              title: flipkartProduct.title || 'N/A',
              price: flipkartProduct.price || 'N/A',
              link: flipkartProduct.url || 'N/A',
            },
            comparison: comparisonMessage,
          };

          // Log comparison result
          cy.log('Comparison Result:')
            .then(() => cy.log(JSON.stringify(comparisonResult, null, 2)))
            .then(() => {
              // Save the comparison result to a file
              cy.writeFile('cypress/reports/amazon_flipkart_comparison_report.json', comparisonResult)
                .then(() => cy.log('Comparison report generated successfully!'))
                .then(() => done()); // End test after file write
            });

          // Log comparison result to the console
          console.log('Comparison Result:', comparisonResult);
        });
      });
    });
  });
});

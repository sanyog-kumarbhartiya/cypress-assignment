const fs = require('fs'); // For file system access
const config = require('../config'); // Import the config file

describe('Compare Frontend and Backend Data', () => {
    it('Compare product details from frontend and API', () => {
        const reportData = {
            frontendProduct: {},
            backendProduct: {},
            comparisonResults: {}
        };

        // Step 1: Visit Amazon and search for a product
        cy.visit('https://www.amazon.in');
        cy.get('#twotabsearchtextbox').type('Titan watch{enter}');

        // Step 2: Ensure that the product list is visible
        cy.get('.s-main-slot').should('be.visible');

        // Step 3: Extract product details from the frontend
        cy.document().then(doc => {
            const products = [];
            const productElements = doc.querySelectorAll('.s-main-slot .s-result-item');

            productElements.forEach(productElement => {
                const nameElement = productElement.querySelector('h2 a span');
                const name = nameElement ? nameElement.innerText : 'No name found';

                const priceElement = productElement.querySelector('.a-price .a-offscreen');
                const price = priceElement ? priceElement.innerText : 'No price found';

                const linkElement = productElement.querySelector('h2 a');
                const fullLink = linkElement ? linkElement.href : 'No link found';
                const formattedLink = fullLink.split('/ref=')[0];
                const productId = fullLink.split('/dp/')[1]?.split('/')[0];
                const finalLink = productId ? `https://www.amazon.in/dp/${productId}` : 'No valid link found';

                const asin = productId ? productId : 'No ASIN found';

                if (name && price && finalLink) {
                    products.push({ name, price, link: finalLink, asin });
                }
            });

            products.forEach(product => {
                console.log(`Product Name: ${product.name}`);
                console.log(`Product Price: ${product.price}`);
                console.log(`Product Link: ${product.link}`);
                console.log(`Product ASIN: ${product.asin}`);
            });

            if (products.length > 6) {
                const frontendProduct = products[6];
                reportData.frontendProduct = frontendProduct;

                cy.wrap(frontendProduct.name).as('frontendProductName');
                cy.wrap(frontendProduct.price).as('frontendProductPrice');
                cy.wrap(frontendProduct.link).as('frontendProductLink');
                cy.wrap(frontendProduct.asin).as('frontendProductASIN');
            } else {
                throw new Error('No products found on the frontend');
            }
        });

        // Step 4: Make API request to fetch product details from the backend (API)
        const { apiEndpoint, queryParams, headers } = config.amazon;

        cy.request({
            method: 'GET',
            url: apiEndpoint,
            qs: queryParams,
            headers: headers
        }).then((response) => {
            expect(response.status).to.eq(200);

            const productsFromApi = response.body.data.products;

            if (productsFromApi && productsFromApi.length > 0) {
                const backendProduct = productsFromApi[0];
                reportData.backendProduct = backendProduct;

                // Step 6: Compare frontend and backend product ASINs
                cy.get('@frontendProductASIN').then((frontendProductASIN) => {
                    const backendProductASIN = backendProduct.asin;
                    const asinComparison = frontendProductASIN === backendProductASIN;

                    reportData.comparisonResults.asinMatch = asinComparison ? 'Matched' : 'Not Matched';
                    expect(frontendProductASIN).to.eq(backendProductASIN);
                });

                // Step 7: Compare frontend and backend product URLs
                cy.get('@frontendProductLink').then((frontendProductLink) => {
                    const backendProductLink = backendProduct.product_url;
                    const linkComparison = frontendProductLink === backendProductLink;

                    reportData.comparisonResults.linkMatch = linkComparison ? 'Matched' : 'Not Matched';
                    expect(frontendProductLink).to.eq(backendProductLink);
                });

                // Step 8: Compare frontend and backend product prices 
                cy.get('@frontendProductPrice').then((frontendProductPrice) => {
                    const frontendPrice = frontendProductPrice.replace(/[^0-9.]/g, '');
                    const backendPrice = backendProduct.product_price.toString().replace(/[^0-9.]/g, ''); 
                    const priceComparison = frontendPrice === backendPrice;

                    reportData.comparisonResults.priceMatch = priceComparison ? 'Matched' : 'Not Matched';
                    expect(frontendPrice).to.eq(backendPrice);
                });

                // Step 9: Save the report to a file
                cy.writeFile('cypress/reports/frontend_&backend_data_validation_report.json', reportData);
            } else {
                console.error("No products found in the API response. Full response: ", response.body);
                throw new Error("No products found in the API response");
            }
        });
    });
});

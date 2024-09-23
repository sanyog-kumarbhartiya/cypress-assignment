const config = require('../../e2e/config');

describe('Amazon Product Search API Tests', () => {
    const amazonConfig = config.amazon;

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
            url: amazonConfig.apiEndpoint,
            qs: amazonConfig.queryParams,
            headers: amazonConfig.headers
        }).should((response) => {
            expect(response.status).to.eq(200);
            expect(response.duration).to.be.lessThan(10000); // Response time threshold
        });
    });

    // Test 2: Validate Response Structure
    it('should contain necessary fields in the response body', () => {
        cy.request({
            method: 'GET',
            url: amazonConfig.apiEndpoint,
            qs: amazonConfig.queryParams,
            headers: amazonConfig.headers,
            failOnStatusCode: false
        }).then((response) => {
            handleRateLimit(response);
            expect(response.body).to.have.property('status');
            expect(response.body).to.have.property('request_id');
            expect(response.body).to.have.property('data');
            expect(response.body.data).to.have.property('products');
        });
    });

    // Test 3: Verify Total Products Count
    it('should have a total products count greater than zero', () => {
        cy.request({
            method: 'GET',
            url: amazonConfig.apiEndpoint,
            qs: amazonConfig.queryParams,
            headers: amazonConfig.headers,
            failOnStatusCode: false
        }).then((response) => {
            handleRateLimit(response);
            expect(response.body.data.total_products).to.be.greaterThan(0);
        });
    });

    // Test 4: Validate Each Product's Structure
    it('should have all necessary fields for each product', () => {
        cy.request({
            method: 'GET',
            url: amazonConfig.apiEndpoint,
            qs: amazonConfig.queryParams,
            headers: amazonConfig.headers,
            failOnStatusCode: false
        }).then((response) => {
            handleRateLimit(response);
            const products = response.body.data.products;
            products.forEach((product) => {
                expect(product).to.have.property('asin');
                expect(product).to.have.property('product_title');
                expect(product).to.have.property('product_price');
                expect(product).to.have.property('product_url');
            });
        });
    });

    // Test 5: Validate Prime and Non-Prime Products
    it('should filter products based on Prime eligibility', () => {
        cy.request({
            method: 'GET',
            url: amazonConfig.apiEndpoint,
            qs: amazonConfig.queryParams,
            headers: amazonConfig.headers,
            failOnStatusCode: false
        }).then((response) => {
            handleRateLimit(response);
            const products = response.body.data.products;
            products.forEach((product) => {
                expect(product).to.have.property('is_prime').and.be.a('boolean');
            });
        });
    });

    // Test 6: Verify Currency Consistency (INR)
    it('should have INR as the currency for all products', () => {
        cy.request({
            method: 'GET',
            url: amazonConfig.apiEndpoint,
            qs: amazonConfig.queryParams,
            headers: amazonConfig.headers,
            failOnStatusCode: false
        }).then((response) => {
            handleRateLimit(response);
            const products = response.body.data.products;
            products.forEach((product) => {
                expect(product.currency).to.eq('INR');
            });
        });
    });

    // Test 7: Validate Product Price Format
    it('should have the correct price format starting with ₹', () => {
        cy.request({
            method: 'GET',
            url: amazonConfig.apiEndpoint,
            qs: amazonConfig.queryParams,
            headers: amazonConfig.headers,
            failOnStatusCode: false
        }).then((response) => {
            handleRateLimit(response);
            const products = response.body.data.products;
            products.forEach((product) => {
                expect(product.product_price).to.match(/^₹/);
            });
        });
    });

    // Test 8: Validate Selling Price (Should Be <= MRP, Not Zero or Negative)
    it('should have selling price less than or equal to MRP and not zero or negative', () => {
        cy.request({
            method: 'GET',
            url: amazonConfig.apiEndpoint,
            qs: amazonConfig.queryParams,
            headers: amazonConfig.headers,
            failOnStatusCode: false
        }).then((response) => {
            handleRateLimit(response);
            const products = response.body.data.products;
            products.forEach((product) => {
                const sellingPrice = parseFloat(product.product_price.replace(/[₹,]/g, '')); // Convert price to number
                const originalPrice = product.product_original_price ? parseFloat(product.product_original_price.replace(/[₹,]/g, '')) : sellingPrice; // If no MRP, use selling price
                expect(sellingPrice).to.be.lte(originalPrice); // Selling price should be <= MRP
                expect(sellingPrice).to.be.gt(0); // Selling price should not be zero or negative
            });
        });
    });

    // Test 9: Verify Image URL for Each Product
    it('should have image URL for each product', () => {
        cy.request({
            method: 'GET',
            url: amazonConfig.apiEndpoint,
            qs: amazonConfig.queryParams,
            headers: amazonConfig.headers,
            failOnStatusCode: false
        }).then((response) => {
            handleRateLimit(response);
            const products = response.body.data.products;
            products.forEach((product) => {
                expect(product).to.have.property('product_photo'); // Validate product photo
            });
        });
    });

    // Test 10: Save Product Data to JSON File
    it('should save product data to a JSON file', () => {
        cy.request({
            method: 'GET',
            url: amazonConfig.apiEndpoint,
            qs: amazonConfig.queryParams,
            headers: amazonConfig.headers,
            failOnStatusCode: false
        }).then((response) => {
            handleRateLimit(response);
            const products = response.body.data.products;

            // Map and format the product data
            const productData = products.map((product) => ({
                id: product.asin,
                name: product.product_title,
                price: product.product_price,
                url: product.product_url,
                image: product.product_photo
            }));

            // Write the product data to a JSON file
            cy.writeFile('cypress/reports/amazonApi_productData.json', productData);

            // Log the output
            cy.log('Product data saved to reports/amazonApi_productData.json');
        });
    });

});

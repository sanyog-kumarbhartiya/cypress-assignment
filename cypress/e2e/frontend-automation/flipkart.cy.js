describe('Flipkart Product Scraping', () => {
    it('should fetch and print all visible product names and prices from Flipkart', () => {
        // Visit the Flipkart search results page for "Titan Watch"
        cy.visit('https://www.flipkart.com/search?q=titan+watch');

        // Wait for the page to load and render products
        cy.get('.DOjaWF').should('be.visible'); // Ensure that product elements are present and visible

        // Use Cypress to execute JavaScript in the browser
        cy.document().then(doc => {
            const products = [];
            
            // Select all product elements
            const productElements = doc.querySelectorAll('._75nlfW');
            
            productElements.forEach(productElement => {
                // Extract product name
                const nameElement = productElement.querySelector('.WKTcLC') || productElement.querySelector('.WKTcLC');
                const name = nameElement ? nameElement.innerText : 'No name found';
                
                // Extract product price
                const priceElement = productElement.querySelector('.Nx9bqj') || productElement.querySelector('.Nx9bqj');
                const price = priceElement ? priceElement.innerText : 'No price found';
                
                if (name && price) {
                    products.push({ name, price });
                }
            });

            // Print all product details
            products.forEach(product => {
                console.log(`Product Name: ${product.name}`);
                console.log(`Product Price: ${product.price}`);
                console.log('-----------------------------');
            });

            // Example assertion
            expect(products).to.have.length.greaterThan(0);
        });
    });
});

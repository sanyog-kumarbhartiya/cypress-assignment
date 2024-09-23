# Create a directory for your project:
mkdir ecommerce-automation
cd ecommerce-automation

# Initialize your project with npm:
npm init -y

# Install Cypress:
npm install cypress --save-dev

# Open Cypress:
npx cypress open

# Run cypress:
npx cypress run

# run indivisual test file in cypress
npx cypress run --spec "file path"
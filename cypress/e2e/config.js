module.exports = {
    flipkart: {
      apiEndpoint: 'https://real-time-flipkart-api.p.rapidapi.com/product-search',
      headers: {
        'x-rapidapi-host': 'real-time-flipkart-api.p.rapidapi.com',
        'x-rapidapi-key': 'df753b1d3fmsh289400426568053p1683a8jsn83826ace6125', // Your actual Flipkart API key
      },
      queryParams: {
        q: 'titan watch',
        page: 1,
        sort_by: 'popularity',
      },
    },
    amazon: {
      apiEndpoint: 'https://real-time-amazon-data.p.rapidapi.com/search',
      headers: {
        'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com',
        'x-rapidapi-key': 'fbef3eab82msh3471e68516145d0p1f6032jsn7c18726c1fb8', // Your actual Amazon API key
      },
      queryParams: {
        query: 'titan watch',
        page: 1,
        country: 'IN',
        sort_by: 'RELEVANCE',
        product_condition: 'ALL',
        is_prime: false,
      },
    },
  };
  
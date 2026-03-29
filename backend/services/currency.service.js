const axios = require('axios');

exports.getRate = async (baseCurrency, targetCurrency) => {
  if (baseCurrency.toUpperCase() === targetCurrency.toUpperCase()) {
    return 1;
  }
  try {
    const url = `https://v6.exchangerate-api.com/v6/c0acce2683978087ac3a7641/latest/${baseCurrency.toUpperCase()}`;
    const response = await axios.get(url);
    const rates = response.data.conversion_rates;
    if (!rates || !rates[targetCurrency.toUpperCase()]) {
      throw new Error('Currency rate not available');
    }
    return rates[targetCurrency.toUpperCase()];
  } catch (err) {
    console.error('Currency API Error:', err.message);
    throw new Error('Could not fetch exchange rates');
  }
};

exports.convertAmount = async (amount, fromCurrency, toCurrency) => {
  const rate = await this.getRate(fromCurrency, toCurrency);
  return parseFloat((amount * rate).toFixed(2));
};

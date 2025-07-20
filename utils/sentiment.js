// sentiment.js
const Sentiment = require('sentiment');  // Import sentiment analysis library

// Initialize sentiment analyzer
const sentiment = new Sentiment();

/**
 * Function to analyze the sentiment of a given text
 * @param {string} text - The text to analyze.
 * @returns {Object} - The sentiment analysis result.
 */
function analyzeSentiment(text) {
  // Perform sentiment analysis
  const result = sentiment.analyze(text);

  // Return the result
  return {
    score: result.score,
    positive: result.positive,
    negative: result.negative,
    overallSentiment: result.comparative > 0 ? "Positive" : result.comparative < 0 ? "Negative" : "Neutral"
  };
}

module.exports = analyzeSentiment; // Export the function for use in other files

const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  try {
    const response = await fetch(
      'https://api.github.com/repos/BiblioNexus-Foundation/codex/releases/latest'
    );
    const releaseData = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(releaseData)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch release data' })
    };
  }
};
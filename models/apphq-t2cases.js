import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

// The token endpoint.
const authEndpoint = 'https://api.helpscout.net/v2/oauth2/token';

// Preparing our POST data.
const postData = {
  grant_type: 'client_credentials',
  client_id: process.env.HELPSCOUT_APP_ID,
  client_secret: process.env.HELPSCOUT_APP_SECRET
};

// Prepare our headers for all endpoints using token.
let endpointHeaders;

async function getConversations() {
  try {
    const res = await axios.post(authEndpoint, postData);
    const token = res.data.access_token;
    endpointHeaders = {
      'Authorization': `Bearer ${token}`
    };

    let page = 1;
      // Prepare conversations endpoint with status of conversations we want and the mailbox.
      const conversationsEndpoint = `https://api.helpscout.net/v2/conversations?status=active&mailbox=258043&folder=5650311&page=${page}`;
      const response = await axios.get(conversationsEndpoint, { headers: endpointHeaders });
      const conversations = response.data;
      return JSON.stringify({
        cases: conversations._embedded.conversations.length
      });   
      /*return JSON.stringify({
        'x-ratelimit-limit-minute': response.headers['x-ratelimit-limit-minute'],
        'x-ratelimit-remaining-minute': response.headers['x-ratelimit-remaining-minute'],
        'cases': conversations._embedded.conversations.length
      });*/ 


    } catch (error) {
    console.error('Error:', error.message);
  }
}

export { getConversations }
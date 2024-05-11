import { getConversations } from '../models/apphq-t2cases.js';

export class HelpscoutController {

    refresh = async (req, res) => {
      try {
          const result = await getConversations();          
          // Send the result as a response
          res.send(result);
      } catch (error) {
          // Handle errors
          console.error(error);
          res.status(500).send('Internal Server Error');
      }
    };
  
}


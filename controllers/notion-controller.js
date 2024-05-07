//import { validatePage, validatePartialPage } from '../schemas/notion-schema.js'
import { notion } from '../index.js'

// Insert data into a Notion database
async function addToDatabase(databaseId, username, name, status, date) {
  try {
      const response = await notion.pages.create({
          parent: {
              database_id: databaseId,
          },
          properties: {
              'ID': {
                  type: 'title',
                  title: [
                  {
                      type: 'text',
                      text: {
                          content: username,
                      },
                  },
                  ],
              },
              'Name' : {
                      type: 'rich_text',
                      rich_text: [
                      {
                          type: 'text',
                          text: {
                              content: name,
                          },
                      }
                      ],
              },
              'Date': { 
                type: 'date',
                date: {
                    "start": date
                }
            },
          }    
      });
      return response;
  } catch (error) {
      console.error(error.body);
  }
}

//Query single data entry from a Notion database
async function querySinglePageInDatabase(databaseId, username) {
    try {
      const response = await notion.databases.query({
        database_id: databaseId,
        "filter": {
          "property": "ID",
          "rich_text": {
            "contains": username
          }
        }
      });
      console.log(response);
      
      if (response.results && response.results.length > 0) {
        return response.results[0];
      } else {
        throw new Error("No results found");
      }
    } catch (error) {
      console.error(error);
      throw error; // Propagate the error
    }
  }
  

//Query all data entry from a Notion database
async function queryAllDatabase(databaseId, username) {
    try {
        const response = await notion.databases.query({
            database_id: databaseId,
            "filter": {
                "property": "ID",
                "rich_text": {
                    "contains": username
                }
            }
        });  

        // Check if results are found
        if (response.results.length === 0) {
            console.log('No results found');
        }

        // Return array of all results
        console.log(response.results)
        return response.results;
    } catch (error){
        console.log(error.body);
    }
}


//Delete single data entry from our Notion database
async function deleteSingleItem(databaseId, username) {
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const getPage = await querySinglePageInDatabase(databaseId, username);
        const pageId = getPage.id;
       
        // Delete the page
        const response = await notion.blocks.delete({
            block_id: pageId,
        });

        // Check if the response status indicates success
        if (response.ok) {
            console.log('Page deletion initiated successfully');
            //console.log(response); // Log the response from the delete operation
        } else {
            console.error(response); // Log detailed response
        }

        console.log('Page deleted successfully');
        return response.id;

    } catch (error) {
        console.error(error);
    }
}



//Delete ALL data entry from our Notion database
async function deleteAllItems(databaseId, username) {
    try {
        // Check if username is truthy (not null, undefined, or empty string)
        if (!username) {
            const errorMessage = 'Username cannot be empty.';
            console.error(errorMessage);
            return
        }

        // Query the database to get all pages with the same username
        const pages = await queryAllDatabase(databaseId, username);
        
        // Iterate over each page and delete it
        for (const page of pages) {
            const pageId = page.id;
            try {
                const response = await notion.blocks.delete({
                    block_id: pageId,
                });
                console.log(`Page ${pageId} deleted successfully`);
                //console.log(response); // Log the response from the delete operation
            } catch (error) {
                console.error(`Failed to delete page ${pageId} from the database`);
                console.error(error); // Log detailed error
            }
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}




//Update data in the Notion database
async function updateItem(databaseId, username, status, date) {
    try {
        // Retrieve the page ID asynchronously
        const getPage = await querySinglePageInDatabase(databaseId, username);
        const pageId = getPage.id;

        // Use the retrieved page ID to update the page
        const response = await notion.pages.update({
            page_id: pageId,
            properties: {
                'Status': {
                    checkbox: status,
                },
                'Date': {
                    type: 'date',
                    date: {
                        "start": date
                    }
                },
            },
        });

        console.log(response);

    } catch (error) {
        console.error(error.body);
    }
}

//Search by title or database
async function performSearch(query, value) {
    try {
        const response = await notion.search({
            query: query,
            filter: {
              value: value,
              property: 'object'
            },
            sort: {
              direction: 'ascending',
              timestamp: 'last_edited_time'
            },
        });
        console.log(response);
        return response; // Return the search result
    } catch (error) {
        console.error(error.body);
        throw error; // Rethrow the error to be caught by the caller
    }
}


export class NotionController {

    search = async (req, res) => {
        try {
            const { query, value } = req.body;
            console.table([{ query, value }]);
            const result = await performSearch(query, value); // Call separate function
            
            // Return the result as JSON to the client
            return res.json(result);
    
        } catch (error) {
            console.error(error);
            // Sending an error response if an error occurs
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    

  queryDatabase = async (req, res) => {
    try {
        // Extract databaseId and username from query parameters
        const { databaseId, username } = req.body;
        console.table([{ databaseId, username }]);

        // Call queryAllDatabase function with extracted parameters
        const result = await queryAllDatabase(databaseId, username);
        
        // Send the result as a response
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
  };

  addDataToDatabase = async (req, res) => {
    try {
        const { databaseId, username, name, status, date } = req.body;
        console.log(databaseId,username,name, status, date)
        
        const result = await addToDatabase(databaseId, username, name, status, date);
        res.send(result);
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
  };

  deleteItem = (req, res) => {
    try {
        const { databaseId, username } = req.body;
        console.log(databaseId,username)
        
        const result = deleteSingleItem(databaseId, username);
        
        res.send(result);
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
  };

  deleteAll = (req, res) => {
    try {
        const { databaseId, username } = req.body;
        console.log(databaseId,username)
        
        const result = deleteAllItems(databaseId, username);
        
        res.send(result);
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
  };

  update = async (req, res) => {
    try {
        // Extract databaseId and username from query parameters
        const { databaseId, username, status, date } = req.body;
        console.log(databaseId,username)
        
        // Call queryDatabase function with extracted parameters
        const result = updateItem(databaseId, username, status, date);
        
        // Send the result as a response
        res.send(result);
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
  };



}
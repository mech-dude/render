import { Router } from 'express'
import { NotionController } from '../controllers/notion-controller.js'

export const createNotionRouter = () => {
  const notionRouter = Router()

  const notionController = new NotionController()

  /*notionRouter.post('/notion', notionController.createPage)
  notionRouter.get('/notion/:page_id', notionController.getPage)*/

  notionRouter.post('/notion/searchByTitle', notionController.search)
  notionRouter.post('/notion/queryPageInDatabase', notionController.queryDatabase)
  notionRouter.post('/notion/addToDatabase', notionController.addDataToDatabase)
  notionRouter.post('/notion/deletePageInDatabase', notionController.deleteItem)
  notionRouter.post('/notion/deleteAllPagesInDatabase', notionController.deleteAll)
  notionRouter.patch('/notion/updateDatabase', notionController.update)

  /*notionRouter.delete('/:page_id', notionController.delete)
  notionRouter.patch('/:page_id', notionController.updatePageProperties)*/

  return notionRouter
}
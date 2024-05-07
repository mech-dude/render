import { Router } from 'express'
import { HelpscoutController } from '../controllers/helpscout-controller.js'

export const createHelpscoutRouter = () => {
  const helpscoutRouter = Router()
  const helpscoutController = new HelpscoutController()
  helpscoutRouter.get('/refresh-conversations', helpscoutController.refresh)
  return helpscoutRouter
}
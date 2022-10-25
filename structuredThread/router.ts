import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import StructuredThreadCollection from './collection';
import * as userValidator from '../user/middleware';
import * as threadValidator from './middleware';
import * as util from './util';

const router = express.Router();

/**
 * Get all the freets
 *
 * @name GET /api/freets
 *
 * @return {FreetResponse[]} - A list of all the freets sorted in descending
 *                      order by date modified
 */
/**
 * Get freets by author.
 *
 * @name GET /api/freets?authorId=id
 *
 * @return {FreetResponse[]} - An array of freets created by user with id, authorId
 * @throws {400} - If authorId is not given
 * @throws {404} - If no user has given authorId
 *
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    // Check if authorId query parameter was supplied
    if (req.query.author !== undefined) {
      next();
      return;
    }

    const allThreads = await StructuredThreadCollection.findAll();
    const response = allThreads.map(util.constructThreadResponse);
    res.status(200).json(response);
  },
  [
    userValidator.isAuthorExists
  ],
  async (req: Request, res: Response) => {
    const authorFreets = await StructuredThreadCollection.findAllByUsername(req.query.author as string);
    const response = authorFreets.map(util.constructThreadResponse);
    res.status(200).json(response);
  }
);

/**
 * Create a new freet.
 *
 * @name POST /api/freets
 *
 * @param {string} content - The content of the freet
 * @return {FreetResponse} - The created freet
 * @throws {403} - If the user is not logged in
 * @throws {400} - If the freet content is empty or a stream of empty spaces
 * @throws {413} - If the freet content is more than 140 characters long
 */
router.post(
  '/',
  [
    userValidator.isUserLoggedIn,
    threadValidator.isValidThreadFreetsContent,
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    let thread;

    const content = [req.body.content1, req.body.content2, req.body.content3];

    thread = await StructuredThreadCollection.addOne(userId, content);
    
    res.status(201).json({
      message: 'Your freet was created successfully.',
      freet: util.constructThreadResponse(thread)
    });
  }
);

/**
 * Delete a freet
 *
 * @name DELETE /api/freets/:id
 *
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in or is not the author of
 *                 the freet
 * @throws {404} - If the freetId is not valid
 */
router.delete(
  '/:threadId?',
  [
    userValidator.isUserLoggedIn,
    threadValidator.isThreadExists,
  ],
  async (req: Request, res: Response) => {
    await StructuredThreadCollection.deleteOne(req.params.threadId);
    res.status(200).json({
      message: 'Your thread was deleted successfully.'
    });
  }
);

export {router as structuredThreadRouter};

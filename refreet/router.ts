import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import RefreetCollection from './collection';
import * as userValidator from '../user/middleware';
import * as refreetValidator from '../refreet/middleware';
import * as util from './util';

const router = express.Router();

/**
 * Get all the freets
 *
 * @name GET /api/freets
 *
 * @return {RefreetResponse[]} - A list of all the freets sorted in descending
 *                      order by date modified
 */
/**
 * Get freets by author.
 *
 * @name GET /api/freets?authorId=id
 *
 * @return {RefreetResponse[]} - An array of freets created by user with id, authorId
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

    const allRefrets = await RefreetCollection.findAll();
    const response = allRefrets.map(util.constructRefreetResponse);
    res.status(200).json(response);
  },
  [
    userValidator.isAuthorExists
  ],
  async (req: Request, res: Response) => {
    const authorRefreets = await RefreetCollection.findAllByUsername(req.query.author as string);
    const response = authorRefreets.map(util.constructRefreetResponse);
    res.status(200).json(response);
  }
);

/**
 * Create a new freet.
 *
 * @name POST /api/refreets
 *
 * @param {string} refreet - The content of the freet
 * @return {RefreetResponse} - The created freet
 * @throws {403} - If the user is not logged in
 * @throws {400} - If the freet content is empty or a stream of empty spaces
 * @throws {413} - If the freet content is more than 140 characters long
 */
router.post(
  '/',
  [
    userValidator.isUserLoggedIn,
    refreetValidator.isValidRefreetParent
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const refreet = await RefreetCollection.addOne(userId, req.body.parentId);

    res.status(201).json({
      message: 'Your refreet was created successfully.',
      refreet: util.constructRefreetResponse(refreet)
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
  '/:refreetId?',
  [
    userValidator.isUserLoggedIn,
    refreetValidator.isRefreetExists,
  ],
  async (req: Request, res: Response) => {
    await RefreetCollection.deleteOne(req.params.refreetId);
    res.status(200).json({
      message: 'Your refreet was deleted successfully.'
    });
  }
);

export {router as refreetRouter};

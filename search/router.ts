import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import SearchCollection from './collection';
import * as userValidator from '../user/middleware';
import * as feedValidator from '../feed/middleware';
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
  async (req: Request, res: Response) => {
    const viewerFeed = await SearchCollection.findOneByUser(req.session.userId as string);
    res.status(200).json(util.constructSearchResponse(viewerFeed));
  }
);

/**
 * Modify a freet
 *
 * @name PUT /api/freets/:id
 *
 * @param {string} content - the new content for the freet
 * @return {FreetResponse} - the updated freet
 * @throws {403} - if the user is not logged in or not the author of
 *                 of the freet
 * @throws {404} - If the freetId is not valid
 * @throws {400} - If the freet content is empty or a stream of empty spaces
 * @throws {413} - If the freet content is more than 140 characters long
 */
router.put(
  '/',
  [
    userValidator.isUserLoggedIn,
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const search = await SearchCollection.findOneByUser(userId);

    if (!search) {
      res.status(404).json({
        searchNotFound: `Search of user with ID ${req.session.userId} not found.`
      });
      return;
    }

    const result = await SearchCollection.updateSearch(search._id,req.body.content);

    res.status(200).json({
      message: 'Your search was updated successfully.',
      search: util.constructSearchResponse(result)
    });
  }
);

export {router as searchRouter};

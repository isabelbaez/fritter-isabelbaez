import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import CredibilityFilteringCollection from './collection';
import * as userValidator from '../user/middleware';
import * as filterValidator from '../credibilityFiltering/middleware';
import * as util from './util';
import FeedCollection from '../feed/collection';

const router = express.Router();

/**
 * Get all the freets
 *
 * @name GET /api/freets
 *
 * @return {FilterResponse[]} - A list of all the freets sorted in descending
 *                      order by date modified
 */
/**
 * Get freets by author.
 *
 * @name GET /api/freets?authorId=id
 *
 * @return {FilterResponse[]} - An array of freets created by user with id, authorId
 * @throws {400} - If authorId is not given
 * @throws {404} - If no user has given authorId
 *
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    // Check if authorId query parameter was supplied
    if (req.query.feedId !== undefined) {
      next();
      return;
    }

    const allFilters= await CredibilityFilteringCollection.findAll();
    const response = allFilters.map(util.constructFilterResponse);
    res.status(200).json(response);
  },
  [
    filterValidator.isValidFilterFeed
  ],
  async (req: Request, res: Response) => {

    const filter = await CredibilityFilteringCollection.findOneByFeed(req.query.feedId as string);
    
    const response = util.constructFilterResponse(filter);
    res.status(200).json(response);
  }
);

/**
 * Create a new freet.
 *
 * @name POST /api/likes
 *
 * @param {string} like - The content of the freet
 * @return {LikeResponse} - The created freet
 * @throws {403} - If the user is not logged in
 * @throws {400} - If the freet content is empty or a stream of empty spaces
 * @throws {413} - If the freet content is more than 140 characters long
 */
router.post(
  '/',
  [
    filterValidator.isValidFilterFeed
  ],
  async (req: Request, res: Response) => {

    const filter = await CredibilityFilteringCollection.addOne(req.body.feedId);

    res.status(201).json({
      message: 'Your filter was created successfully.',
      filter: util.constructFilterResponse(filter)
    });
  }
);

/**
 * Modify a filter
 *
 * @name PUT /api/credibilityFiltering/:id
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
    const feed = await FeedCollection.findOneByUser(userId);
    const filter = await CredibilityFilteringCollection.findOneByFeed(feed._id);

    if (!filter) {
      res.status(404).json({
        filterNotFound: `Filter of feed of user with ID ${req.session.userId} not found.`
      });
      return;
    }

    let unscored = true;
    let highScored = true;;
    let lowScored = true;

    if (!req.body.unscored) {
      unscored = false;
    }

    if (!req.body.highScored) {
      highScored = false;
    }

    if (!req.body.lowScored) {
      lowScored = false;
    }

    await CredibilityFilteringCollection.updateFiltering(feed._id,unscored,highScored,lowScored);

    res.status(200).json({
      message: 'Your feed was updated successfully.'
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
  '/:scoreId?',
  [
    userValidator.isUserLoggedIn,
    filterValidator.isFilterExists,
  ],
  async (req: Request, res: Response) => {

    const filterId = (req.params.filterId as string) ?? '';
    
    await CredibilityFilteringCollection.deleteOne(filterId);
    res.status(200).json({
      message: 'Your filter was deleted successfully.'
    });
  }
);

export {router as credibilityFilteringRouter};

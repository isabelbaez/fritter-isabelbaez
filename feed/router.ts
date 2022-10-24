import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import FeedCollection from './collection';
import * as userValidator from '../user/middleware';
import * as feedValidator from '../feed/middleware';
import * as util from './util';
import CredibilityFilteringCollection from '../credibilityFiltering/collection';

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
    const viewerFeed = await FeedCollection.findOneByUser(req.session.userId as string);
    res.status(200).json(util.constructFeedResponse(viewerFeed));
  }
);

// /**
//  * Create a new freet.
//  *
//  * @name POST /api/freets
//  *
//  * @param {string} content - The content of the freet
//  * @return {FreetResponse} - The created freet
//  * @throws {403} - If the user is not logged in
//  * @throws {400} - If the freet content is empty or a stream of empty spaces
//  * @throws {413} - If the freet content is more than 140 characters long
//  */
// router.post(
//   '/',
//   [
//     userValidator.isUserLoggedIn,
//     feedValidator.isValidNewFeed
//   ],
//   async (req: Request, res: Response) => {
//     const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
//     const freet = await FeedCollection.addOne(userId);

//     res.status(201).json({
//       message: 'Your Thread was created successfully.',
//       freet: util.constructFeedResponse(freet)
//     });
//   }
// );

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
    const feed = await FeedCollection.findOneByUser(userId);

    if (!feed) {
      res.status(404).json({
        feedNotFound: `Feed of user with ID ${req.session.userId} not found.`
      });
      return;
    }

    const filter = await CredibilityFilteringCollection.findOneByFeed(feed._id);

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

    await CredibilityFilteringCollection.updateFiltering(filter._id, unscored, highScored, lowScored);
    await FeedCollection.updateFeed(feed._id);

    res.status(200).json({
      message: 'Your feed was updated successfully.'
    });
  }
);

export {router as feedRouter};

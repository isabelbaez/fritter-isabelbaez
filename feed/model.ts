import FreetModel, { Freet } from '../freet/model';
import type {Types} from 'mongoose';
import {Schema, model} from 'mongoose';
import LikeCollection from 'like/collection';

/**
 * This file defines the properties stored in a Freet
 * DO NOT implement operations here ---> use collection file
 */

// Type definition for Freet on the backend
export type Feed = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  viewerId: Types.ObjectId;
  filterId: Types.ObjectId;
  freets: Array<string>;
};

// Mongoose schema definition for interfacing with a MongoDB table
// Freets stored in this table will have these fields, with the
// type given by the type property, inside MongoDB

const FeedSchema = new Schema<Feed>({
  // The author userId
  viewerId: {
    // Use Types.ObjectId outside of the schema
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  filterId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'CredibilityFiltering'
  },
  freets: {
    type: [String],
    default: new Array<string>()
  }
});

const FeedModel = model<Feed>('Feed', FeedSchema);
export default FeedModel;

import LikeModel, { Like } from '../like/model';
import type {Types} from 'mongoose';
import {Schema, model} from 'mongoose';
import LikeCollection from 'like/collection';
import { freetCredibilityScoreRouter } from 'freetCredibilityScore/router';

/**
 * This file defines the properties stored in a Freet
 * DO NOT implement operations here ---> use collection file
 */

// Type definition for Freet on the backend
export type Freet = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  authorId: Types.ObjectId;
  dateCreated: Date;
  content: string;
  credibilityScoreId: Types.ObjectId;
  likes: Array<string>; // Add a new field called "views" with the number type to the interface
  refreets: Array<string>;
  comments: Array<string>;
};

// Mongoose schema definition for interfacing with a MongoDB table
// Freets stored in this table will have these fields, with the
// type given by the type property, inside MongoDB

const likes_default = new Array<Like>();

const FreetSchema = new Schema<Freet>({
  // The author userId
  authorId: {
    // Use Types.ObjectId outside of the schema
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  // The date the freet was created
  dateCreated: {
    type: Date,
    required: true
  },
  // The content of the freet
  content: {
    type: String,
    required: true
  },
  credibilityScoreId: {
    type: Schema.Types.ObjectId,
    required: false
  },
  // Add views field to the schema
  likes: {
    type: [String],
    default: new Array<string>()
  },
  // Add views field to the schema
  refreets: {
    type: [String],
    default: new Array<string>()
  },
  comments: {
    type: [String],
    default: new Array<string>()
  }
});

const FreetModel = model<Freet>('Freet', FreetSchema);
export default FreetModel;

import type {Types} from 'mongoose';
import {Schema, model} from 'mongoose';

/**
 * This file defines the properties stored in a Freet
 * DO NOT implement operations here ---> use collection file
 */

// Type definition for Freet on the backend
export type Search = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  viewerId: Types.ObjectId;
  content: string;
  users: Array<string>;
};

// Mongoose schema definition for interfacing with a MongoDB table
// Freets stored in this table will have these fields, with the
// type given by the type property, inside MongoDB

const SearchSchema = new Schema<Search>({
  // The author userId
  viewerId: {
    // Use Types.ObjectId outside of the schema
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  content: {
    type: String,
    default: ""
  },
  users: {
    type: [String],
    default: new Array<string>()
  }
});

const SearchModel = model<Search>('Search', SearchSchema);
export default SearchModel;

const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');
const { User } = require('../models');

const resolvers = {
  Query: {
    me: async (_, __, context) => {
      
      if (!context.user) {
        throw new AuthenticationError('Not logged in');
      }
      const userData = await User.findOne({ email: context.user.email })
        .select('-__v -password');
      return userData;
    }
  },
  Mutation: {
  //   # Login requires email and password returns authentication/ new JWT for User
  // login(email: String!, password: String!): Auth
    login: async (_,{email, password}) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);
      return { token, user };
    },
  // # add a new User requires email, password, username, and returns JWT
  // addUser(username: String!, email: String!, password: String!): Auth
    addUser: async (_, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      return {user, token};
    },
  // # saves a book to a specific User
  // saveBook(user: book inputs): User
    saveBook: async (_, args, context) => {
      console.log(args);
      // if there is a user
      if (context.user) {
        // update the user's books array 
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet:  {savedBooks:args}  },
          { new: true }
        )

        return updatedUser;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  // # remove a book from a User
  // removeBook(bookId: String): User
    removeBook: async (_, { bookId }, context) => {
      // if there is a user
      if (context.user) {
        // update the user's books array 
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          {
            $pull: {
              savedBooks: { bookId: bookId }
            }
          },
          { new: true }
        ).populate('books');

        return updatedUser;
      }
      throw new AuthenticationError('You need to be logged in!');
    }
  }
};

module.exports = resolvers;
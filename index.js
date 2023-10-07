import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from '@apollo/server/standalone';
import { GraphQLError } from 'graphql';

import './db.js'
import Person from './models/person.js'
import User from './models/user.js'
import jwt from "jsonwebtoken";

const JWT_SECRET = 'ESTA_ES_MI_CLAVE'

const typeDefs = `#graphql
  enum YesNo {
    YES
    NO
  }

  type Address {
      street: String!
      city: String!
  }
  type Person {
      name: String!
      phone: String
      address: Address!
      id: ID!
  }

  type User {
    username: String!
    friends: [Person]!
    id: ID!
  }

  type Token {
    value: String!
  }
  
  type Query {
      personCount: Int!
      allPersons(phone: YesNo): [Person]!
      findPerson(name: String!): Person
      me: User
  }
  
  type Mutation {
      addPerson(
          name: String!
          phone: String
          street: String!
          city: String!
      ): Person
      editNumber(
        name: String!
        phone: String!
      ): Person
      createUser(
        username: String!
      ): User
      login(
        username: String!
        password: String!
      ): Token
  }

`

const resolvers = {
  Query: {
    personCount: () => Person.collection.countDocuments(),
    allPersons: async (root, args) => {

      if (!args.phone) return Person.find({})
      return Person.find({ phone: { $exists: args.phone === 'YES' } })

    },
    findPerson: (root, args) => {
      const { name } = args
      return Person.findOne({ name })
      // return persons.find(person => person.name === name)
    },
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Mutation: {
    addPerson: async (root, args) => {
      const person = new Person({ ...args })
      try {
        await person.save();
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args,
          },
        });
      }
      return person

    },
    editNumber: async (root, args) => {
      const person = await Person.findOne({ name: args.name });
      if (!person) return
      person.phone = args.phone;

      try {
        await person.save();
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args,
          },
        });
      }
      return person
    },
    createUser: (root, args) => {
      const user = new User({ username: args.username })
      return user.save()
      .catch(error => {
        throw new GraphQLError(error.message, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args,
          },
        })
      })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      if (!user || args.password !== 'secret') {
          throw new GraphQLError('wrong credentials', {
            extensions: {
              code: 'BAD_USER_INPUT',
            }
          })
      }

      const userForToken = {
        username: user.username,
        id: user._id
      }

      return {
        value: jwt.sign(userForToken, JWT_SECRET)
      }
    },
  },
  Person: {
    address: (root) => {
      return {
        street: root.street,
        city: root.city
      }
    }
  }
}


const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const token = auth.substring(7)
      const { id } = jwt.verify(token, JWT_SECRET)
      const currentUser = await User.findById(id).populate('friends')
      return { currentUser }
    }
  }
})

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
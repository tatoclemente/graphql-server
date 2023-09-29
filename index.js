import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from '@apollo/server/standalone';
import { v4 as uuidv4 } from 'uuid'
import { GraphQLError } from 'graphql';
import axios from 'axios';

const persons = [
  {
    name: "Gustavo",
    phone: "555-123-4567",
    street: "Calle Ficticia 123",
    city: "Nueva York",
    id: 1
  },
  {
    name: "Pedrito",
    phone: "555-987-6543",
    street: "Avenida Imaginaria 456",
    city: "Los Ángeles",
    id: 2
  },
  {
    name: "Mariana",
    street: "Calle Inventada 789",
    city: "Chicago",
    id: 3
  }
];

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
  
  type Query {
      personCount: Int!
      allPersons(phone: YesNo): [Person]!
      findPerson(name: String!): Person
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
  }

`

const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: async (root, args) => {

      if (!args.phone) {
        return persons
      }
      const byPhone = (person) =>
        args.phone === 'YES' ? person.phone : !person.phone
      return persons.filter(byPhone)
    },
    findPerson: (root, args) => {
      const { name } = args
      return persons.find(person => person.name === name)
    }
  },
  Mutation: {
    addPerson: (root, args) => {
      if (persons.find(p => p.name === args.name)) {
        throw new GraphQLError(`The name ${args.name} is already taken`, {
          invalidArgs: args.name,
          extensions: {
            code: 'FORBIDDEN',
            myExtension: "foo",
          },
        });
      }
      const person = { ...args, id: uuidv4() }
      persons.push(person)
      return person
    },
    editNumber: (root, args) => {
      const personIndex = persons.findIndex(p => p.name === args.name)
      if (!personIndex === -1) return null
      
      const person = persons[personIndex]
      const updatedPerson = { ...person, phone: args.phone }
      persons[personIndex] = updatedPerson
      return updatedPerson
    }
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
  resolvers
})

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from '@apollo/server/standalone';

const persons = [
    {
      name: "Juan Pérez",
      phone: "555-123-4567",
      street: "Calle Ficticia 123",
      city: "Nueva York",
      id: 1
    },
    {
      name: "María Rodríguez",
      phone: "555-987-6543",
      street: "Avenida Imaginaria 456",
      city: "Los Ángeles",
      id: 2
    },
    {
      name: "Carlos Sánchez",
      street: "Calle Inventada 789",
      city: "Chicago",
      id: 3
    }
  ];

  const typeDefs = `#graphql
    type Person {
        name: String!
        phone: String
        street: String!
        city: String!
        id: ID!
    }
    
    type Query {
        personCount: Int!
        allPersons: [Person]!
    }
  `
  
  const resolvers = {
    Query: {
        personCount: () => persons.length,
        allPersons: () => persons
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
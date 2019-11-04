const { gql } = require('apollo-server');

const typeDefs = gql`
    type Query {
        actors: [Person]!
        actor(id: ID!): Person!
        movies: [Movie]!
        movie(id: ID!): Movie!
    }

    type Person {
        id: ID
        name: String
        age: Int
    }

    type Movie {
        id: ID
        title: String!
        released: Int!
        actors: [Person]
        director: Person
    }

    type Mutation {
        createPerson(name: String! age: Int!): Person!
        createMovie(title: String! released: Int!): Movie!
        directed(movie:ID! director:ID!) : String
        acted(movie:ID! actor:ID!) : String
    }
`;

module.exports = typeDefs;

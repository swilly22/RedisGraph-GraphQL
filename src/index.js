const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema');
const {createGraph} = require('./utils');
const resolvers = require('./resolvers');
const GraphAPI = require('./datasources/graph');

const graph = createGraph();
const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({
        graphAPI: new GraphAPI({ graph })
	})
});

server.listen().then(({url}) => {
    console.log(`Server ready at ${url}`);
});

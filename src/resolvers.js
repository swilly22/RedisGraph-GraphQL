
module.exports = {
    Query: {
        actors: (_, __, { dataSources }) =>
            dataSources.graphAPI.getAllActors(),
        actor: (_, { id }, { dataSources }) =>
            dataSources.graphAPI.getActor({ id }),

        movies: (_, __, { dataSources }) =>
            dataSources.graphAPI.getAllMovies(),
        movie: (_, { id }, { dataSources }) =>
            dataSources.graphAPI.getMovie({ id }),
    },
    Mutation: {
        createPerson: async (_, { name, age }, { dataSources }) =>
            dataSources.graphAPI.createPerson({name, age}),
        createMovie: async (_, { title, released }, { dataSources }) =>
            dataSources.graphAPI.createMovie({ title, released }),
        directed: async (_, { movie, director }, { dataSources }) => {
            const src = director;
            const rel = 'directed';
            const dest = movie;
            dataSources.graphAPI.connectNodes({ src, dest, rel })
        },
        acted: async (_, { movie, actor }, { dataSources }) => {
            const src = actor;
            const rel = 'acted';
            const dest = movie;
            dataSources.graphAPI.connectNodes({ src, dest, rel })
        },
    },
};

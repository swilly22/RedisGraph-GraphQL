const RedisGraph = require("redisgraph.js").Graph;

module.exports.createGraph = () => {
    const graph = new RedisGraph('imdb');
    return { graph };
};

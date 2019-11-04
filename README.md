# RedisGraph-GraphQL
Demo application querying RedisGraph via GraphQL, in this demo we're modeling a IMDB data-set, in which we've got `Person` and `Movies` entities, we can form relations between the two, e.g. a person can `act` or `direct` a movie.

## Run
1. Make sure to have a RedisGraph server running in the background
`docker run --rm -p 6379:6379 redislabs/redisgraph:edge`

2. Install required packages, from root
`npm install`

3. Start the server
`node src/index.js`

4. In your browser navigate to http://127.0.0.1:4000/

## API
### Mutations
* createMovie - Creates a movie entity
* createPerson - Creates a person entity
* directed - Associate a person with a movie by forming a directed relation.
* acted - Associate a person with a movie by forming a acted relation.

### Query
* actors - Get all person entities.
* actor - Get a specific actor.
* movies - Get all movie entities.
* movie - Get a specific movie.

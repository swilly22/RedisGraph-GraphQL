const { DataSource } = require('apollo-datasource');

const edgeDir = {
    RTL:1,
    LRT:2
} 

class GraphAPI extends DataSource {
    constructor({ graph }) {
        super();
        this.graph = graph;
    }

    /**
     * This is a function that gets called by ApolloServer when being setup.
     * This function gets called with the datasource config including things
     * like caches and context. We'll assign this.context to the request context
     * here, so we can know about the user making requests
     */
    initialize(config) {
        this.context = config.context;
    }

    // Reducers
    personReducer(person) {                
        if(person) {
            return {
                id: person.id || '0',
                name: person.properties['name'],
                age: person.properties['age'],
            };
        } else {
            return {
                id: -1,
                name: "",
                age: 0,
            };
        }
    }
    
    movieReducer(movie) {
        if(movie) {
            return {
                id: movie.id || '0',
                title: movie.properties['title'],
                released: movie.properties['released'],
            };
        } else {
            return { id: -1, title: '', released: 0 };
        }
    }

    // API
    async getAllActors() {
        let actors = await this.getAllNodes(`Person`);
        actors = actors.map(person => this.personReducer(person));
        return actors;
    }

    async getActor({id}) {
        let actor = await this.getNode(id);
        actor = this.personReducer(actor);
        return actor;
    }

    async getAllMovies() {
        let movies = await this.getAllNodes(`Movie`);
        movies = movies.map(movie => this.movieReducer(movie));
        for(let i = 0; i < movies.length; i++) {
            let actors = await this.getNeighbors(movies[i].id, `acted`, `Person`, edgeDir.RTL);
            actors = actors.map(person => this.personReducer(person));

            let director = await this.getNeighbors(movies[i].id, `directed`, `Person`, edgeDir.RTL);
            if(director) {
                director = director[0];
                director = this.personReducer(director);
            }
            
            movies[i].actors = actors;
            movies[i].director = director;
        }
        return movies;
    }

    async getMovie({id}) {
        let director = null;
        let actors = [];
        let movie = await this.getNode(id);
        if(movie) {
            actors = await this.getNeighbors(movie.id, `acted`, `Person`, edgeDir.RTL);
            actors = actors.map(person => this.personReducer(person));

            director = await this.getNeighbors(id, `directed`, `Person`, edgeDir.RTL);
            if(director.length > 0) {
                director = director[0];
                director = this.personReducer(director);
            }
        }

        movie = this.movieReducer(movie);
        movie.director = director;
        movie.actors = actors;
        
        return movie;
    }

    async createPerson({name, age}) {
        const person = await this.createNode('Person', {'name': name, 'age': age});
        return this.personReducer(person);
    }

    async createMovie({title, released}) {
        const movie = await this.createNode('Movie', {'title': title, 'released': released});
        return this.movieReducer(movie);
    }

    // GraphAPI
    async query(q) {
        console.log("q: " + q);
        const response = await this.graph.graph.query(q);
        return response;
    }

    async getNode(id) {
        let node = null;
        let resp = await this.query(`MATCH (n) WHERE ID(n) = ` + id + ` RETURN n`);
        if(resp.hasNext()) {
            const rec = resp.next();
            node = rec.get('n');
        }
        return node;
    }

    async getAllNodes(label) {
        let res = [];
        let q = `MATCH (n:`+label+`) RETURN n`;
        let resp = await this.query(q);
        while(resp.hasNext()){
            let rec = resp.next();
            res.push(rec.get('n'));
        }
        return res;
    }

    async getNeighbors(srcId, relation, destLabel, dir) {
        let res = [];
        let q = "";
        
        q = `MATCH (src)`;
        if(dir == edgeDir.RTL) {
            q += `<-[:` + relation + `]-`;
        } else {
            q += `-[:` + relation + `]->`;
        }
        q += `(dest`;
        if(destLabel) {
            q += `:` + destLabel;
        }
        q += `) WHERE ID(src) = ` + srcId + ` RETURN dest`;

        let resp = await this.query(q);

        while(resp.hasNext()){
            let rec = resp.next();
            res.push(rec.get('dest'));
        }

        return res;
    }

    async createNode(label, attributes) {
        let q = `CREATE (n`
        if (label) {
            q += `:` + label;
        }
        if(attributes) {
            q += `{`;
            for (var key in attributes) {
                var val = attributes[key];
                if(typeof val === "string") {
                    val = `"` + val + `"`;
                }
                q += key + `:` + val + `,`;
            }
            q = q.slice(0, -1);
            q += `}`;
        }

        q += `) RETURN  n AS n`;
        const resp = await this.query(q);
        const rec = resp.next();
        const node = rec.get('n');
        return node;
    }

    async connectNodes({ src, dest, rel, attributes }) {
        let q = `MATCH (src), (dest) WHERE ID(src) = ` + src + ` AND ID(dest) = ` + dest + ` CREATE (src)-[:` + rel
        if(attributes) {
            q += `{` + attributes + `}`;
        }
        q += `]->(dest)`;

        const resp = await this.query(`MATCH (src), (dest) WHERE ID(src) = ` + src + ` AND ID(dest) = ` + dest + ` CREATE (src)-[:` + rel + `]->(dest)`);
        return "";
    }
}

module.exports = GraphAPI;

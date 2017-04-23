//Logic for the express side of the application
const express = require('express');

//Library that is a compatibility layer between GraphQL and express
const expressGraphQL = require('express-graphql');

//Start express app 
const app = express();

//If any incoming route is for a graphql query - app.use is tying in a middleware, in this case registering graphql as a middleware
//Note: GraphQL can be a part of your application with this functionality, and you can continue
//to have RESTful routing throughout and have GraphQL for specific queries for example
app.use('/graphql', expressGraphQL({
    graphiql: true
}));

//App listens on this port
app.listen(4000, () => {
    console.log('Listening');
});


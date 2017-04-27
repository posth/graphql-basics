//This schema file will contain all the knowledge that tells GraphQL what the data of my application looks like
//All the properties each object has and how each of those objects are related to each other

//Pulling in the GraphQL library
const graphql = require('graphql');
const axios = require('axios');

//Grabbing multiple properties from the GraphQL library
const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema
} = graphql;

//GraphQLObjectType will tell GraphQL what a user object looks like (properties it has)
const UserType = new GraphQLObjectType({
    name: 'User',
    fields: {
        id: { type: GraphQLString },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt }
    }
});

//Entry point into the GraphQL Db to get information - jump and land on a specific node in the graph of all the data
//We can ask the root query about users of the application  - if you're looking for a user and you give it an ID, it will return a user
//args are what it takes in, the id
//resolve is a function where it goes into the DB and finds the user - parentValue is rarely used
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args) {
                //request to the JSON server
                //this is a promise that will resolve into the data you want
                return axios.get(`http://localhost:3000/users/${args.id}`)
                    .then(resp => resp.data);
                    //axios responses nests the data in data:, which graphQL already does, so you look for data in that response 
            }
        }
    }
});

//GraphQLSchema takes in a rootQuery and returns a GraphQL instance
//can export it to be used in other files of the app
module.exports = new GraphQLSchema({
    query: RootQuery
});
//This schema file will contain all the knowledge that tells GraphQL what the data of my application looks like
//All the properties each object has and how each of those objects are related to each other

//Pulling in the GraphQL library
const graphql = require('graphql');

//Grabbing multiple properties from the GraphQL library
const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt
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


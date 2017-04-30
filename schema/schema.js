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
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = graphql;

//IMPORTANT - has to be defined before the UserType - order of definitions is important
const CompanyType = new GraphQLObjectType({
    name: 'Company',
    //Wrap the fields property in an arrow function for circular dependencies of data
    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        users: {
            //We can receive more than 1 user when going from company to user
            type: new GraphQLList(UserType),
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
                    .then(resp => resp.data)
            }
        }
    })
});

//GraphQLObjectType will tell GraphQL what a user object looks like (properties it has)
const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLString },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        company: {
            type: CompanyType,
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
                    .then(resp => resp.data);
            }
        }
    })
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
        },
        //Being able to root query into the company directly - so you can ask all the users that belong to company X
        company: {
            type: CompanyType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/companies/${args.id}`)
                    .then(resp => resp.data);
            }
        }
    }
});

//Mutations used to edit data - change underlying data
const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        //Fields of a mutation describe what the mutation does to the data
        addUser: {
            //Type here refers to the type of data that will be returned from the resolve function
            type: UserType,
            //args are what are need to be able to resolve the data back
            args: {
                //GraphQLNonNull means that this is a necessary field when making the mutation
                firstName: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: new GraphQLNonNull(GraphQLInt) },
                companyId: { type: GraphQLString }
            },
            //resolve here is where you undergo the operation to do the mutation
            resolve(parentValue, { firstName, age }) {
                return axios.post('http://localhost:3000/users', { firstName, age })
                    .then(resp => resp.data);
            }
        },
        deleteUser: {
            type: UserType,
            args: {
                userId: { type: new GraphQLNonNull(GraphQLString) }
            },
            //userID uses ES6 argument destruction to get that value directly from the args object
            resolve(parentValue, { userId }) {
                return axios.delete(`http://localhost:3000/users/${userId}`)
                    .then(resp => resp.data);
            }
        },
        editUser: {
            //want the updated user to be returned
            type: UserType,
            args: {
                //id is required to identify the user, other args are optional
                userId: { type: new GraphQLNonNull(GraphQLString) },
                firstName: { type: GraphQLString },
                age: { type: GraphQLInt },
                companyId: { type: GraphQLString }
            },
            resolve(parentValue, args) {
                //with axios patch, and you pass the ID in the args object it won't update it (part of the axios lib function)
                return axios.patch(`http://localhost:3000/users/${args.userId}`, args)
                    .then(resp => resp.data); 
            }
        }
    }
});

//GraphQLSchema takes in a rootQuery and returns a GraphQL instance
//can export it to be used in other files of the app
module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
});
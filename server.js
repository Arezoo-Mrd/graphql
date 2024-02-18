const express = require('express')
const expressGraphQl = require('express-graphql').graphqlHTTP
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull
} = require('graphql')
const app = express()

const authors = [
    { id: 1, name: 'J. K. Rowling' },
    { id: 2, name: 'J. R. R. Tolkien' },
    { id: 3, name: 'Brent Alderson' }
]
const books = [
    { id: 1, name: 'Harry Potter and the Philosopher\'s Stone', authorId: 1 },
    { id: 2, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
    { id: 3, name: 'The Lord of the Rings', authorId: 2 },
    { id: 4, name: 'Foundation', authorId: 3 },
    { id: 5, name: 'Animal Farm', authorId: 3 },
    { id: 6, name: 'The Hobbit', authorId: 2 },
    { id: 7, name: 'The Fellowship of the Ring', authorId: 2 },
    { id: 8, name: 'The Two Towers', authorId: 2 }
]

const AuthorType = new GraphQLObjectType({
    name: "Author",
    description: "This represents an author of a book",
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLInt) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        books: {
            type: new GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => book.authorId === author.id)
            }
        }

    })
})
const BookType = new GraphQLObjectType({
    name: "Book",
    description: "This represents a book written by an author",
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLInt) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(GraphQLInt) },

    })
})

const RootQueryType = new GraphQLObjectType({
    name: "Query",
    description: "Root Query",
    fields: () => (
        {
            books: {
                type: (BookType),
                description: "List of all books",
                resolve: () => books
            },
            book: {
                type: (BookType),
                description: "A single book",
                args: {
                    id: { type: GraphQLInt }
                },
                resolve: (parent, args) => books.find((book) => book.id === args.id)
            },
            authors: {
                type: new GraphQLList(AuthorType),
                resolve: () => authors
            },
            author: {
                type: (AuthorType),
                args: {
                    id: { type: GraphQLInt }
                },
                resolve: (parent, args) => authors.find((author) => author.id === args.id)
            }
        }
    )
})


const RootMutationType = new GraphQLObjectType({
    name: "Mutation",
    description: "Root Mutation",
    fields: () => ({
        addBook: {
            type: BookType,
            description: "Add a book",
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                authorId: { type: new GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const book = {
                    id: books.length + 1,
                    name: args.name,
                    authorId: args.authorId
                }
                books.push(book)
                return book
            }
        },
        addAuthor: {
            type: AuthorType,
            description: "Add an author",
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve: (parent, args) => {
                const author = {
                    id: books.length + 1,
                    name: args.name,
                }
                authors.push(author)
                return author
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use('/graphql', expressGraphQl({
    schema,
    graphiql: true
}))
app.listen(8000, () => console.log('Listening on port 8000'))
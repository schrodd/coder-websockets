const { options } = require('./options.js')
const knex = require('knex')(options)

knex.schema.createTable('messages', table => {
    table.increments('id')
    table.string('userId')
    table.string('content')
    table.string('time')
})
.then (() => console.log('table messages created'))
.catch (e => console.log(e))
.finally (() => knex.destroy())

knex.schema.createTable('products', table => {
    table.increments('id')
    table.string('title')
    table.string('price')
    table.string('thumbnail')
})
.then (() => console.log('table products created'))
.catch (e => console.log(e))
.finally (() => knex.destroy())
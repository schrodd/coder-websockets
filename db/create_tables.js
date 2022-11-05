const { optionsMariaDB, optionsSQLite } = require('./options.js')
const knexMariaDB = require('knex')(optionsMariaDB)
const knexSQLite = require('knex')(optionsSQLite)

knexSQLite.schema.createTable('messages', table => {
    table.increments('id')
    table.string('userId')
    table.string('content')
    table.string('time')
})
.then (() => console.log('Table messages created'))
.catch (e => console.log(e))
.finally (() => knexSQLite.destroy())

knexMariaDB.schema.createTable('products', table => {
    table.increments('id')
    table.string('title')
    table.string('price')
    table.string('thumbnail')
})
.then (() => console.log('Table products created'))
.catch (e => console.log(e))
.finally (() => knexMariaDB.destroy())
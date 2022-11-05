const optionsMariaDB = {
    client: 'mysql',
    connection: {
        host: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'ej6test'
    },
    pool: { min: 0, max: 7 }
}
const optionsSQLite = {
    client: 'sqlite3',
    connection: {
        filename: './db/msgs.sqlite'
    },
    useNullAsDefault: true
}

module.exports = { optionsMariaDB, optionsSQLite }
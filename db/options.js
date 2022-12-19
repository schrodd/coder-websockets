require('dotenv').config()

const optionsMariaDB = {
    client: 'mysql',
    connection: {
        host: process.env.MARIADB_HOST || '127.0.0.1',
        user: process.env.MARIADB_USER || 'root',
        password: process.env.MARIADB_PASSWORD || '',
        database: process.env.MARIADB_DATABASE || 'ej6test'
    },
    pool: { min: 0, max: 7 }
}
const optionsSQLite = {
    client: 'sqlite3',
    connection: {
        filename: process.env.SQLITE_FILENAME || './db/msgs.sqlite'
    },
    useNullAsDefault: true
}

module.exports = { optionsMariaDB, optionsSQLite }
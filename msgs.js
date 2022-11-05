const { options } = require('./db/options.js')
const knex = require('knex')(options)

class Messages {
  addMsg = async obj => {
    await knex('messages')
      .insert(obj)
      .then(() => console.log('Message submitted successfully'))
      .catch(e => console.log(e))
  }
  getAll = async () => {
    const msgs = []
    await knex('messages')
      .then(rows => {
        for (const row of rows) {
          const msg = {
            id: row['id'],
            userId: row['userId'], 
            content: row['content'],
            time: row['time']
          }
          msgs.push(msg)
        }
      })
      .catch(e => console.log(e))
    return msgs
  }
}

module.exports = Messages

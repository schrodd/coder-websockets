const fs = require('fs')
const route = './db/msgs.json'
const utf = 'utf-8'
const { faker } = require("@faker-js/faker")
const { datatype } = faker

class Messages {
  addMsg = async obj => {
    const msgs = await this.getAll()
    obj.id = datatype.uuid()
    obj.timestamp = new Date(Date.now()).toLocaleString()
    msgs.push(obj)
    try {
      await fs.promises.writeFile(route, JSON.stringify(msgs), utf)
    }
    catch (err) {
        console.log(err)
    }
    console.log('Se ha guardado con éxito')
  }
  getAll = async () => {
    const msgs = JSON.parse(await fs.promises.readFile(route, utf))
    return msgs
  }
  static async clean(){
    try {
      await fs.promises.writeFile(route, JSON.stringify([]), utf)
    }
    catch (err) {
        console.log(err)
    }
  }
}

module.exports = Messages

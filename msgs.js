const fs = require('fs')
const route = './db/msgs.json'
const utf = 'utf-8'
const { faker } = require("@faker-js/faker")
const { datatype } = faker

class Messages {
  addMsg = async obj => {
    try {
      const msgs = await this.getAll()
      obj.id = datatype.uuid()
      obj.timestamp = new Date(Date.now()).toLocaleString()
      msgs.messages.push(obj)
      await fs.promises.writeFile(route, JSON.stringify(msgs), utf)
    }
    catch (err) {
        console.log(err)
    }
    console.log('Se ha guardado con éxito')
  }
  getAll = async () => {
    try {
      const msgs = JSON.parse(await fs.promises.readFile(route, utf))
      return msgs
    } catch (error) {
      console.log(error)
    }
  }
  getMessagesOnly = async () => {
    try {
      const msgs = JSON.parse(await fs.promises.readFile(route, utf))
      return msgs.messages
    } catch (error) {
      console.log(error)
    }
  }
  static async clean(){
    try {
      await fs.promises.writeFile(route, JSON.stringify({id:1000,messages:[]}), utf)
    }
    catch (err) {
        console.log(err)
    }
  }
}

module.exports = Messages

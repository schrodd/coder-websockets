const fs = require('fs')
const route = './msgs.json'
const utf = 'utf-8'

class Messages {
  constructor (){
    this.updateFromFile()
  }
  ///////////////////////////  ABAJO: NO USAR DESDE FUERA DE LA CLASE ////////////////////////////
  updateFromFile = async () => {
    try {
      this.messages = JSON.parse(await fs.promises.readFile(route, utf))
      return this.messages
    }
    catch (err) {console.log(err)}
  }
  saveToFile = async obj => {
    try {
        await fs.promises.writeFile(route, JSON.stringify(obj), utf)
    }
    catch (err) {console.log(err)}
  }
  ///////////////////////////  ARRIBA: NO USAR DESDE FUERA DE LA CLASE ////////////////////////////

  addMsg = async obj => {
    await this.updateFromFile()
    let id = 1
    if (this.messages.length > 0){
        id = this.messages.at(-1).id + 1
    }
    obj.id = id
    this.messages.push(obj)
    await this.saveToFile(this.messages)
    console.log('Se ha guardado con éxito')
    return this.messages
  }
  getAll = async () => {
    await this.updateFromFile()
    return this.messages
  }
  deleteAll = async () => {
    this.messages = []
    await this.saveToFile(this.messages)
    console.log('Se han borrado todos los objetos')
    return null
  }
}

module.exports = Messages

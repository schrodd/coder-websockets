const fs = require('fs')
const route = './products.json'
const utf = 'utf-8'

class Products {
  constructor (){
    this.updateFromFile()
  }
  ///////////////////////////  ABAJO: NO USAR DESDE FUERA DE LA CLASE ////////////////////////////
  updateFromFile = async () => {
    try {
      this.objects = JSON.parse(await fs.promises.readFile(route, utf))
      return this.objects
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

  addProduct = async obj => {
    await this.updateFromFile()
    let id = 1
    if (this.objects.length > 0){
        id = this.objects.at(-1).id + 1
    }
    obj.id = id
    this.objects.push(obj)
    await this.saveToFile(this.objects)
    console.log('Se ha guardado con éxito')
    return this.objects
  }
  getById = async id => {
    await this.updateFromFile()
    const obj = this.objects.find(e => e.id == id)
    console.log(obj ? obj : 'No se encontró, no existe un objeto con ese ID')
    return obj ? obj : null
  }
  getAll = async () => {
    await this.updateFromFile()
    return this.objects
  }
  deleteById = async id => {
    await this.updateFromFile()
    let index = this.objects.findIndex(e => e.id == id)
    if (index != -1){
        this.objects.splice(index, 1)
        await this.saveToFile(this.objects)
        console.log('Se ha eliminado con éxito')
        return null
    }
    console.log('No se borró, no existe un objeto con ese ID')
  }
  deleteAll = async () => {
    this.objects = []
    await this.saveToFile(this.objects)
    console.log('Se han borrado todos los objetos')
    return null
  }
}

module.exports = Products

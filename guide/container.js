const fs = require('fs')
const route = './productos.json'
const utf = 'utf-8'
class Container {
    constructor(name, objects){
        this.name = name
        this.objects = objects
        this.actualizar()
    }
    async actualizar() {
        try {
            this.objects = JSON.parse(await fs.promises.readFile(route, utf))
            return this.objects
        }
        catch (err) {
            console.log(err)
        }
    }
    async guardar(obj) {
        try {
            await fs.promises.writeFile(route, JSON.stringify(obj), utf)
        }
        catch (err) {
            console.log(err)
        }
    }
    save = async obj => {
        await this.actualizar()
        let id = 1
        if (this.objects.length > 0){
            id = this.objects.at(-1).id + 1
        }
        obj.id = id
        this.objects.push(obj)
        await this.guardar(this.objects)
        console.log('Se ha guardado con éxito')
        return id
    }
    getById = async id => {
        await this.actualizar()
        const obj = this.objects.find(e => e.id == id)
        console.log(obj ? obj : 'No se encontró, no existe un objeto con ese ID')
        return obj ? obj : null
    }
    getAll = async () => {
        await this.actualizar()
        console.log(this.objects)
        return this.objects
    }
    deleteById = async id => {
        await this.actualizar()
        let index = this.objects.findIndex(e => e.id == id)
        if (index != -1){
            this.objects.splice(index, 1)
            await this.guardar(this.objects)
            console.log('Se ha eliminado con éxito')
            return null
        }
        console.log('No se borró, no existe un objeto con ese ID')
    }
    deleteAll = async () => {
        this.objects = []
        await this.guardar(this.objects)
        console.log('Se han borrado todos los objetos')
        return null
    }
}

module.exports = Container;

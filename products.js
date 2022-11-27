const { optionsMariaDB } = require('./db/options.js')
const knex = require('knex')(optionsMariaDB)
const { faker } = require("@faker-js/faker")
const { commerce, image, datatype } = faker
faker.locale = 'es_MX'

class Products {
  getAll = async () => {
    const products = []
    await knex('products')
      .then(rows => {
        for (const row of rows) {
          const prod = {
            id: row['id'],
            title: row['title'], 
            price: row['price'],
            thumbnail: row['thumbnail']
          }
          products.push(prod)
        }
      })
      .catch(e => console.log(e))
    return products
  }
  getRandom = (n) => {
    const products = []
    for (let i = 0 ; i < n ; i++) {
      const prod = {
        id: datatype.uuid(),
        title: commerce.product(), 
        price: commerce.price(),
        thumbnail: image.image(500, 500)
      }
      products.push(prod)
    }
    return products
  }
  addProduct = async obj => {
    await knex('products')
      .insert(obj)
      .then(() => console.log('Product submitted successfully'))
      .catch(e => console.log(e))
  }
  static async clean(){
    await knex('products')
    .del()
  }
}

module.exports = Products

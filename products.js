const { options } = require('./db/options.js')
const knex = require('knex')(options)

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
  addProduct = async obj => {
    await knex('products')
      .insert(obj)
      .then(() => console.log('Product submitted successfully'))
      .catch(e => console.log(e))
  }
}

module.exports = Products

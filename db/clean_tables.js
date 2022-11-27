const Messages = require("../msgs")
const Products = require("../products")
async function clean(){
    await Messages.clean()
    await Products.clean()
    console.log("Tables have been cleared")
    process.exit()
}
clean()
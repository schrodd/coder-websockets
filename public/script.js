const socket = io()
const statusContainer = document.querySelector('#ws-status')
let user = ''
let normalizedSize = 0
let denormalizedSize = 0

function compressionSizeUpdate(){
  console.log(`Normalized: ${normalizedSize} | Denormalized: ${denormalizedSize}`)
  document.querySelector('#msg-compression').innerHTML = `${Math.round(normalizedSize / denormalizedSize * 100)}%`
}

if (window.location.pathname == '/chat'){
  user = prompt("Ingresá tu email:", "no-user")
}

// Cambia el aspecto de los mensajes según el usuario
function chatColor(){
  for (e of document.getElementsByClassName("msg")){
    e.getAttribute('user') == user && e.classList.add('me')
  }
}
chatColor()

// Conecta y cambia el estado a "conectado" en el front
function setConnected(){
  statusContainer.style.color = 'green';
  statusContainer.innerHTML = "conectado";
}
socket.on('conectionSuccess', () => {
  setConnected()
})

// Maneja el submit del formulario
try {
  const addProdForm = document.querySelector('#add-product-form')
  addProdForm.addEventListener('submit', ev => {
    ev.preventDefault()
    const producto = {
      title: addProdForm[0].value,
      price: addProdForm[1].value,
      thumbnail: addProdForm[2].value
    }
    socket.emit('productLoaded', producto)
  })
} catch (error) {
  console.log(error)
}

// Maneja el submit del chat
try {
  const chatForm = document.querySelector('#msg-form')
  const chatInput = document.querySelector('#msg-input')
  chatForm.addEventListener('submit', ev => {
    ev.preventDefault()
    /* const msg = {
      userId: user,
      content: chatForm[0].value,
      time: new Date().toLocaleTimeString()
    } */
    const msg = {
      author: {
        id: user,
        nombre: '',
        apellido: '',
        edad: '',
        alias: '',
        avatar: ''
      },
      text: chatForm[0].value,
    }
    socket.emit('msgSent', msg)
    chatInput.value = ''
  })
} catch (error) {
  console.log(error)
}

// Maneja la actualización de la tabla cuando se actualiza la lista de productos
socket.on('productRefresh', chat => {
  hacerTabla(chat).then(code => {
    document.querySelector('#product-wrapper').innerHTML = code
  })
})
function hacerTabla(prod) {
  return fetch('/products.hbs')
      .then(res => res.text())
      .then(tabla => {
          const template = Handlebars.compile(tabla);
          const html = template({products: prod})
          return html
      })
}

const authorSchema = new normalizr.schema.Entity('authors')
const messageSchema = new normalizr.schema.Entity('messages',{
    author: authorSchema
})
const chatSchema = new normalizr.schema.Entity('chat', {
    messages: [messageSchema]
})

// Maneja la actualización del chat
socket.on('chatRefresh', async normalized => {
  normalizedSize = JSON.stringify(normalized).length
  const denorm = await normalizr.denormalize(normalized.result, chatSchema, normalized.entities)
  denormalizedSize = JSON.stringify(denorm).length
  compressionSizeUpdate()
  hacerChat(denorm.messages).then(code => {
    const e = document.querySelector('.msg-container')
    e.innerHTML = code
    chatColor()
    e.scrollTo(0, Number.MAX_SAFE_INTEGER)
  })
})
function hacerChat(ch) {
  return fetch('/chat.hbs')
      .then(res => res.text())
      .then(msgs => {
          const template = Handlebars.compile(msgs);
          const html = template({msg: ch})
          return html
      })
}
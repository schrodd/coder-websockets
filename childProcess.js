/*
  Agregar otra ruta '/api/randoms' que permita calcular un cantidad de números aleatorios
  en el rango del 1 al 1000 especificada por parámetros de consulta (query).
  Por ej: /randoms?cant=20000.
  Si dicho parámetro no se ingresa, calcular 100.000.000 números.
  El dato devuelto al frontend será un objeto que contendrá como claves los números
  random generados junto a la cantidad de veces que salió cada uno. Esta ruta no será
  bloqueante (utilizar el método fork de child process). Comprobar el no bloqueo con una
  cantidad de 500.000.000 de randoms.
  Observación: utilizar routers y apis separadas para esta funcionalidad.
*/

function randCalc(e){ // e = amount of iterations
  const res = {}
  for(let i = 0; i <= e; i++){
    const random = Math.floor(Math.random()*1001)
    if (res[random]) {
      res[random]++
    } else {
      res[random] = 1
    }
  }
  return res
}

process.on('message', msj => {
  process.send(randCalc(msj))
})
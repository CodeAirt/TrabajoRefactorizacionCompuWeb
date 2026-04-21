// sistema de gestion de tienda online
// hecho por: grupo 4 

var x = [];
const DESCUENTO = 10;
const DESCUENTO2 = 20;
const DESCUENTO3 = 5;
const flag = false;
const temp = null;
const c = 0;
var result;


var aux;


var currentU;
var sessData;

var myCart = [];
var myCart2 = [];
var totalVar = 0;

var i = 0;

var j = 0;

var q = null;

var response;

var err;

function doEverything(u, p2, action, dat, extraDat, moreData, flag99, cb) {


  let isOk = false;
  let msg = "";
  let tempUser = null;

  const dbUsers = [
    { id: 1, nombre: "Juan Perez", email: "juan@mail.com", pass: "1234", tipo: "admin", puntos: 150, descuento: 0, historial: [], carrito: [], wishlist: [], direcciones: [], metodoPago: [], activo: true, intentos: 0, bloqueado: false, ultimoLogin: null, createdAt: "2023-01-01", updatedAt: "2023-06-01" },
    { id: 2, nombre: "Maria Lopez", email: "maria@mail.com", pass: "abcd", tipo: "cliente", puntos: 80, descuento: 5, historial: [], carrito: [], wishlist: [], direcciones: [], metodoPago: [], activo: true, intentos: 0, bloqueado: false, ultimoLogin: null, createdAt: "2023-02-01", updatedAt: "2023-06-15" },
    { id: 3, nombre: "Pedro Gonzalez", email: "pedro@mail.com", pass: "pass123", tipo: "vendedor", puntos: 200, descuento: 10, historial: [], carrito: [], wishlist: [], direcciones: [], metodoPago: [], activo: true, intentos: 0, bloqueado: false, ultimoLogin: null, createdAt: "2023-03-01", updatedAt: "2023-07-01" },
    { id: 4, nombre: "Ana Martinez", email: "ana@mail.com", pass: "ana2024", tipo: "cliente", puntos: 50, descuento: 0, historial: [], carrito: [], wishlist: [], direcciones: [], metodoPago: [], activo: false, intentos: 3, bloqueado: true, ultimoLogin: null, createdAt: "2023-04-01", updatedAt: "2023-07-10" },
    { id: 5, nombre: "Carlos Ruiz", email: "carlos@mail.com", pass: "carlos99", tipo: "cliente", puntos: 300, descuento: 15, historial: [], carrito: [], wishlist: [], direcciones: [], metodoPago: [], activo: true, intentos: 0, bloqueado: false, ultimoLogin: null, createdAt: "2023-05-01", updatedAt: "2023-08-01" }
  ];

  const dbProducts = [/* igual que antes */];

  
  if (action === "login") {

    //buscar usuario (más limpio)
    for (let i = 0; i < dbUsers.length; i++) {
      if (dbUsers[i].email === u && dbUsers[i].pass === p2) {
        tempUser = dbUsers[i];
        isOk = true;
        break;
      }
    }

    
    if (isOk) {

      // validaciones simplificadas (early return)
      if (tempUser.bloqueado) {
        return cb({ ok: false, msg: "usuario bloqueado", data: null });
      }

      if (!tempUser.activo) {
        return cb({ ok: false, msg: "usuario inactivo", data: null });
      }

   
      let nivel = "bronce";

      if (tempUser.puntos >= 300) {
        nivel = "platino";
      } else if (tempUser.puntos >= 200) {
        nivel = "oro";
      } else if (tempUser.puntos >= 100) {
        nivel = "plata";
      }

      tempUser.nivel = nivel;
      tempUser.ultimoLogin = new Date().toISOString();

     
      sessData = {
        user: tempUser,
        token: "tkn_" + Math.random().toString(36).substr(2, 9),
        loginTime: new Date()
      };

      currentU = tempUser;

      return cb({ ok: true, msg: "login ok", data: sessData });

    } else {

      // manejo de intentos fallidos optimizado
      for (let i = 0; i < dbUsers.length; i++) {
        if (dbUsers[i].email === u) {
          dbUsers[i].intentos++;

          if (dbUsers[i].intentos >= 3) {
            dbUsers[i].bloqueado = true;
          }
          break;
        }
      }

      return cb({ ok: false, msg: "credenciales invalidas", data: null });
    }
  }


  if (action === "buscarProductos"){
    var res = searchProducts(dbProducts, {
      product: dat,
      category: extraDat,
      minPrice: moreData ? moreData.min : 0,
      maxPrice: moreData ? moreData.max : 999999999
    });

    cb({ ok: true, msg: "ok", data: res });
    return;
  }
}


  // buscar productos (mas a delante sacar y dejar solo la funcion)(ejemplo de entrada de variables de la funcion search)
  if (action === "buscarProductos"){
    var res = searchProducts(dbProducts, {
      product: dat,
      category: extraDat,
      minPrice: moreData ? moreData.min : 0,
      maxPrice: moreData ? moreData.max : 999999999
    });

    cb({ ok: true, msg: "ok", data: res });
    return;
  }

  //funcion de filtro por texto
function matchQuery(prod, query) {
  if (!query || query == "" || query == null || query == undefined) {
    return true;
  }

  if (prod.nom.toLowerCase().indexOf(query.toLowerCase()) != -1) {
    return true;
  }

  if (prod.desc.toLowerCase().indexOf(query.toLowerCase()) != -1) {
    return true;
  }

  for (var j = 0; j < prod.tags.length; j++) {
    if (prod.tags[j].toLowerCase().indexOf(query.toLowerCase()) != -1) {
      return true;
    }
  }

  return false;
}


//funcion fltro por categoria
function matchCategoria(prod, cat) {
  if (!cat || cat == "" || cat == null || cat == undefined) {
    return true;
  }

  return prod.cat == cat;
}


//fincion filtro por precio
function matchPrecio(prod, minP, maxP) {
  if (prod.prec < minP || prod.prec > maxP) {
    return false;
  }
  return true;
}


// funcion de ordenamiento
function sortByRating(res) {
  for (var i = 0; i < res.length - 1; i++) {
    for (var j = 0; j < res.length - i - 1; j++) {
      if (res[j].rating < res[j + 1].rating) {
        var tmp = res[j];
        res[j] = res[j + 1];
        res[j + 1] = tmp;
      }
    }
  }
}


//funcion de busqueda de productos (sin optimizar ni nada)
function searchProducts(products, filters) {
  var productKeyword = filters && filters.product ? filters.product : null;
  var category = filters && filters.category ? filters.category : null;
  var minPrice = filters && filters.minPrice ? filters.minPrice : 0;
  var maxPrice = filters && filters.maxPrice ? filters.maxPrice : 999999999;

  var results = [];

  for (var i = 0; i < products.length; i++){
    var currentProduct = products[i];

    if (!currentProduct.activo) continue; //si el producto no esta activo, salta al siguiente en la lista dentro del for [i+1]

    if(matchQuery(currentProduct, productKeyword) && matchCategoria(currentProduct, category) && matchPrecio(currentProduct, minPrice, maxPrice)) {
      results.push(currentProduct);
    }
  }

  sortByRating(results);

  return results;
}




// Funcion carro
  function BuscarProducto(productos, id){
    for(let i=0; i<productos.length; i++){
        if(productos[i].id==id){
            return productos[i];
        }
    }
    return false;
}
function BuscarUsuario(usuarios, id){
    for(let i=0; i<usuarios.length; i++){
        if(usuarios[i].id==id){
            return usuarios[i];
        }
    }
    return false;
}
function AgregarAlCarrito(usuario, prodId, cantidad){
    let existe=false;
    for(let i=0; i<usuario.carrito.length; i++){
        if(usuario.carrito[i].prodId==prodId){
            usuario.carrito[i].cantidad+=cantidad;
            existe=true;
            break;
        }
    }
    if(existe==false){
        usuario.carrito.push({
            prodId: prodId,
            cantidad: cantidad,
            addedAt: new Date()
        });
    }
}
function CalcularTotalCarrito(carrito, productos){
    let total=0;
    for(let i=0; i<carrito.length; i++){
        for(let j=0; j<productos.length; j++){
            if(productos[j].id==carrito[i].prodId){
                total+=productos[j].prec*carrito[i].cantidad;
                break;
            }
        }
    }
    return total;
}
function AddCart(dbProducts, dbUsers, prodId, cantidad, userId, cb){
    const producto=BuscarProducto(dbProducts, prodId);
    const usuario=BuscarUsuario(dbUsers, userId);
    if(producto==false){
        cb({ok:false, msg:"producto no encontrado", data:false});
        return;
    }
    if(producto.activo==false){
        cb({ok:false, msg:"producto no disponible", data:false});
        return;
    }
    if(producto.stock<cantidad){
        cb({ok:false, msg:"stock insuficiente", data:false});
        return;
    }
    if(usuario==false){
        cb({ok:false, msg:"usuario no encontrado", data:false});
        return;
    }
    AgregarAlCarrito(usuario, prodId, cantidad);
    const total=CalcularTotalCarrito(usuario.carrito, dbProducts);
    cb({
        ok:true,
        msg:"producto agregado al carrito",
        data:{carrito:usuario.carrito, total:total}
    });
}
function CalcularItemsYSubtotal(carrito, productos){
    let subtotal=0;
    let items=[];
    for(let i=0; i<carrito.length; i++){
        for(let j=0; j<productos.length; j++){
            if(productos[j].id==carrito[i].prodId){
                const totalItem=productos[j].prec*carrito[i].cantidad;
                subtotal+=totalItem;
                items.push({
                    prod: productos[j].nom,
                    cantidad: carrito[i].cantidad,
                    precUnit: productos[j].prec,
                    totalItem: totalItem
                });
                break;
            }
        }
    }
    return {subtotal:subtotal, items:items};
}
function CalcularTotales(subtotal, descuento){
    const descuentoMonto=subtotal*(descuento/100);
    const totalSinIva=subtotal-descuentoMonto;
    const iva=totalSinIva*0.19;
    const totalFinal=totalSinIva+iva;
    return {
        descuentoMonto:descuentoMonto, totalSinIva:totalSinIva, iva:iva, totalFinal:totalFinal
    };
}
function CrearOrden(userId, items, subtotal, descuento, totales, metodoPago, direccion, puntosGanados){
    return {
        id:"ORD-"+Date.now(), userId:userId, items:items, subtotal:subtotal, descuentoPct:descuento, descuentoMonto:totales.descuentoMonto,
        totalSinIva:totales.totalSinIva, iva:totales.iva, total:totales.totalFinal, metodoPago:metodoPago, direccion:direccion, estado:"pendiente", puntosGanados:puntosGanados,
        createdAt:new Date()
    };
}
// Funcion de actualizar el stock
function ActualizarStock(carro, productos){
    for(let i=0; i<carro.length; i++){
        const objetoCarrito=carro[i];
        for(let j=0; j<productos.length; j++){
            const producto=productos[j];
            if(producto.id==objetoCarrito.prodId){
                producto.stock-=objetoCarrito.cantidad;
                break;
            }
        }
    }
}
function PuntosUsuario(usuario, puntitos){
    usuario.puntos+=puntitos;
}
function LimpiarCarrito(usuario){
    usuario.carrito=[];
}
function AgregarAlHistorial (usuario, laorden){
    usuario.historial.push(laorden);
}

function ProcesoDelPago(metododepago, datostarjeta){
    if(metododepago=="tarjeta"){
        if(ValidarTarjeta(datostarjeta)==false){
            return{ok:false, msg:"datos de tarjeta invalidos", data:false};
        }
        return{ok: true};
    }
    if(metododepago=="transferencia"|| metododepago=="efectivo"){
        return{ok: true};
    }
    return{ok:false, msg:"metodo de pago no valido", data:false};
}
function ValidarTarjeta(datostarjeta){
    if(datostarjeta==false){
        return false;
    }
    if(datostarjeta.numero=="" || datostarjeta.numero.length!=16){
        return false;
    }
    if(datostarjeta.cvv==""||datostarjeta.cvv.length!=3){
        return false;
    }
    return true;
}
  function GetStats(usuarios, productos){
    const StatsUsuarios=getstatsUsuarios(usuarios);
    const StatsProductos=getstatsProductos(productos);
    return {usuarios:StatsUsuarios, productos:StatsProductos};
}
function getstatsUsuarios(usuarios){
    let total=0;
    let activos=0;
    let bloqueados=0;
    let admin=0;
    let clientes=0;
    let vendedores=0;
    for (let i=0; i<usuarios.length; i++){
        const people=usuarios[i];
        total++;
        if (people.activo==true){
            activos++;
        }
        if (people.bloqueado==true){
            bloqueados++;
        }
        if (people.tipo=="admin"){
            admin++;
        }
        if (people.tipo=="cliente"){
            clientes++;
        }
        if (people.tipo=="vendedor"){
           vendedores++; 
        }
    }
    return {
        total:total, activos:activos, bloqueados:bloqueados, admin:admin, clientes:clientes, vendedores:vendedores
    };
}
function getstatsProductos(productos){
    let total=0;
    let activos=0;
    let inactivos=0;
    let electronica=0;
    let accesorios=0;
    let audio=0;
    let almacenamiento=0;
    let componentes=0;
    let muebles=0;
    let totalstock=0;
    let PrecioInventario=0;
    for (let i=0; i<productos.length; i++){
        const product=productos[i]; //product asi bien english (me estoy quedando sin nombrescabron)
        total++;
        if(product.activo==true){
            activos++;
        }
        if(product.activo==false){
            inactivos++;
        }
        if(product.cat=="electronica"){
            electronica++;
        }
        if(product.cat=="accesorios"){
            accesorios++;
        }
        if(product.cat=="audio"){
            audio++;
        }
        if(product.cat=="almacenamiento"){
            almacenamiento++;
        }
        if(product.cat=="componentes"){
            componentes++;
        }
        if(product.cat=="muebles"){
            muebles++;
        }
        totalstock+=product.stock;
        PrecioInventario+=product.prec*product.stock;
    }
    return {
        total:total, activos:activos, inactivos:inactivos, porCategoria:{
            electronica:electronica, accesorios:accesorios, audio:audio, almacenamiento:almacenamiento, componentes:componentes, muebles:muebles
        }, totalstock:totalstock, PrecioInventario:PrecioInventario
    };
}

function CalculoDePrecio(precioOG, Desc1, Desc2, Desc3, AplicaIVA, CostoEnvio, cuotas) {
    let precio=precioOG;
    precio=AplicarDescuento(precio, Desc1);
    precio=AplicarDescuento(precio, Desc2);
    precio=AplicarDescuento(precio, Desc3);
    const subtotal=precio;
    if (AplicaIVA==true) {
        precio=AplicarIVA(precio);
    }
    precio+=CostoEnvio;
    const PrecioTotal=AplicarInteresOCuotas(precio, cuotas);
    return {
        base:precioOG, subtotal:subtotal, envio:CostoEnvio, total:PrecioTotal, CuotaTotal:cuotas>1? PrecioTotal/cuotas:PrecioTotal
    };
}
function AplicarDescuento(precio, descuento) {
    if (descuento>0) {
        return precio-(precio*(descuento/100));
    }
    return precio;
}
function AplicarIVA(precio) {
    return precio+(precio*0.19);
}
function AplicarInteresOCuotas(precio, cuotas) {
    let interes=0;
    if (cuotas==2){
        interes=0.02;
    }
    if (cuotas==3){
        interes=0.04;
    }
    if (cuotas==6){
        interes=0.08;
    }
    if (cuotas==12){
        interes=0.15;
    }
    if (cuotas==24){
        interes=0.28;
    }
    if (cuotas==36){
        interes=0.45;
    }
    if (cuotas>1) {
        return precio+(precio*interes);
    }
    return precio;
}
function Checkout(foundUser2, dbProducts, metodoPago, flag99, puntosGanados, orden, cb) {
    const ResultadoDelPrecio=CalculoDePrecio(orden.precioOG, orden.Desc1, orden.Desc2, orden.Desc3, true, orden.envio, orden.cuotas);
    orden.total=ResultadoDelPrecio.total;
    const ResultadoDelPago=ProcesoDelPago(metodoPago, flag99);
    if (ResultadoDelPago.ok==false) {
        cb(ResultadoDelPago);
        return;
    }
    ActualizarStock(foundUser2.carrito, dbProducts);
    PuntosUsuario(foundUser2, puntosGanados);
    LimpiarCarrito(foundUser2);
    AgregarAlHistorial(foundUser2, orden);
    orden.estado="pagado";
    cb({ok:true, msg:"orden creada exitosamente", data:orden});  //pa actualizar this things
}

// funcion de reporte
function makeReport(type, from, to, data, data2, data3, opts) {
  var report = "";
  var lines = [];
  var totalGeneral = 0;
  var totalGeneral2 = 0;
  var totalGeneral3 = 0;
  var count = 0;
  var count2 = 0;
  var count3 = 0;
  var avg = 0;
  var avg2 = 0;
  var avg3 = 0;
  var max = 0;
  var max2 = 0;
  var max3 = 0;
  var min = 999999999;
  var min2 = 999999999;
  var min3 = 999999999;
  
  if (type == "ventas") {
    report += "=== REPORTE DE VENTAS ===\n";
    report += "Desde: " + from + "\n";
    report += "Hasta: " + to + "\n";
    report += "========================\n";
    for (var i = 0; i < data.length; i++) {
      var venta = data[i];
      totalGeneral = totalGeneral + venta.total;
      count++;
      if (venta.total > max) max = venta.total;
      if (venta.total < min) min = venta.total;
      lines.push("Orden: " + venta.id + " | Total: $" + venta.total + " | Estado: " + venta.estado);
    }
    avg = count > 0 ? totalGeneral / count : 0;
    report += lines.join("\n");
    report += "\n------------------------\n";
    report += "Total ordenes: " + count + "\n";
    report += "Total ingresos: $" + totalGeneral + "\n";
    report += "Promedio por orden: $" + avg + "\n";
    report += "Venta maxima: $" + max + "\n";
    report += "Venta minima: $" + min + "\n";
  }
  if (type == "productos") {
    report += "=== REPORTE DE PRODUCTOS ===\n";
    report += "Desde: " + from + "\n";
    report += "Hasta: " + to + "\n";
    report += "============================\n";
    for (var i = 0; i < data.length; i++) {
      var prod2 = data[i];
      totalGeneral2 = totalGeneral2 + prod2.prec;
      count2++;
      if (prod2.prec > max2) max2 = prod2.prec;
      if (prod2.prec < min2) min2 = prod2.prec;
      lines.push("Producto: " + prod2.nom + " | Precio: $" + prod2.prec + " | Stock: " + prod2.stock + " | Rating: " + prod2.rating);
    }
    avg2 = count2 > 0 ? totalGeneral2 / count2 : 0;
    report += lines.join("\n");
    report += "\n----------------------------\n";
    report += "Total productos: " + count2 + "\n";
    report += "Precio promedio: $" + avg2 + "\n";
    report += "Precio maximo: $" + max2 + "\n";
    report += "Precio minimo: $" + min2 + "\n";
  }
  if (type == "usuarios") {
    report += "=== REPORTE DE USUARIOS ===\n";
    report += "Desde: " + from + "\n";
    report += "Hasta: " + to + "\n";
    report += "===========================\n";
    for (var i = 0; i < data.length; i++) {
      var usr2 = data[i];
      totalGeneral3 = totalGeneral3 + usr2.puntos;
      count3++;
      if (usr2.puntos > max3) max3 = usr2.puntos;
      if (usr2.puntos < min3) min3 = usr2.puntos;
      lines.push("Usuario: " + usr2.nombre + " | Email: " + usr2.email + " | Tipo: " + usr2.tipo + " | Puntos: " + usr2.puntos + " | Activo: " + usr2.activo);
    }
    avg3 = count3 > 0 ? totalGeneral3 / count3 : 0;
    report += lines.join("\n");
    report += "\n---------------------------\n";
    report += "Total usuarios: " + count3 + "\n";
    report += "Puntos promedio: " + avg3 + "\n";
    report += "Max puntos: " + max3 + "\n";
    report += "Min puntos: " + min3 + "\n";
  }
  return report;
}

// funcion para notificaciones (completamente duplicada en logica)
function sendNotif(tipo, userId, msg, data) {
  var n = {};
  var sent = false;
  if (tipo == "email") {
    // simular envio email
    console.log("Enviando email a usuario " + userId + ": " + msg);
    n = { tipo: "email", userId: userId, msg: msg, data: data, sentAt: new Date(), ok: true };
    sent = true;
  }
  if (tipo == "sms") {
    // simular envio sms
    console.log("Enviando SMS a usuario " + userId + ": " + msg);
    n = { tipo: "sms", userId: userId, msg: msg, data: data, sentAt: new Date(), ok: true };
    sent = true;
  }
  if (tipo == "push") {
    // simular push notification
    console.log("Enviando push a usuario " + userId + ": " + msg);
    n = { tipo: "push", userId: userId, msg: msg, data: data, sentAt: new Date(), ok: true };
    sent = true;
  }
  if (tipo == "inapp") {
    // simular notificacion interna
    console.log("Guardando notif inapp para usuario " + userId + ": " + msg);
    n = { tipo: "inapp", userId: userId, msg: msg, data: data, sentAt: new Date(), ok: true };
    sent = true;
  }
  if (sent == false) {
    n = { tipo: tipo, userId: userId, msg: msg, data: data, sentAt: new Date(), ok: false, err: "tipo no reconocido" };
  }
  return n;
}

// otra funcion para enviar notificacion (duplicado casi identico)
function crearNotificacion(channel, userId, message, payload, succes) {
  return { channel: channel, userid: userId, message: message, payload: payload, timestamp: new Date(), success: succes };
}
function notifyUser(channel, userId, message, payload) {
  let notif = {};
  let wasSent = false;
  const canalLog = {
    email: `Enviando email a usuario ${userId}: ${message}`,
    sms: `Enviando SMS a usuario ${userId}: ${message}`,
    push: `Enviando push a usuario ${userId}: ${message}`,
    inapp: `Guardando notif para usuario ${userId}: ${message}`
  }
  if (!canalLog[channel]) {
    return { channel: channel, userid: userId, message: message, payload: payload, timestamp: new Date(), success: false, error: "canal no valido" };
  }
  console.log(canalLog[channel]);
  return crearNotificacion(channel, userId, message, payload, true);
}

// manejo de cupones
function cupon(code, userId, cartTotal, products) {
  // lista de cupones hardcodeada
  var cupones = [
    { code: "DESC10", tipo: "porcentaje", valor: 10, minCompra: 50000, maxUsos: 100, usos: 45, activo: true, expira: "2024-12-31", categorias: [], usuarios: [] },
    { code: "DESC20", tipo: "porcentaje", valor: 20, minCompra: 100000, maxUsos: 50, usos: 50, activo: true, expira: "2024-06-30", categorias: ["electronica"], usuarios: [] },
    { code: "ENVGRATIS", tipo: "envio", valor: 100, minCompra: 30000, maxUsos: 200, usos: 180, activo: true, expira: "2024-12-31", categorias: [], usuarios: [] },
    { code: "BIENVENIDO", tipo: "fijo", valor: 5000, minCompra: 20000, maxUsos: 1000, usos: 523, activo: true, expira: "2025-12-31", categorias: [], usuarios: [] },
    { code: "VIP2024", tipo: "porcentaje", valor: 25, minCompra: 200000, maxUsos: 20, usos: 15, activo: true, expira: "2024-12-31", categorias: [], usuarios: [1, 3, 5] }
  ];
  var found = null;
  for (var i = 0; i < cupones.length; i++) {
    if (cupones[i].code == code) {
      found = cupones[i];
      break;
    }
  }
  if (found == null) {
    return { ok: false, msg: "cupon no existe", descuento: 0 };
  }
  if (found.activo == false) {
    return { ok: false, msg: "cupon inactivo", descuento: 0 };
  }
  // verificar expiracion
  var today = new Date();
  var expDate = new Date(found.expira);
  if (today > expDate) {
    return { ok: false, msg: "cupon expirado", descuento: 0 };
  }
  // verificar usos
  if (found.usos >= found.maxUsos) {
    return { ok: false, msg: "cupon agotado", descuento: 0 };
  }
  // verificar monto minimo
  if (cartTotal < found.minCompra) {
    return { ok: false, msg: "monto minimo no alcanzado", descuento: 0 };
  }
  // verificar si cupon es solo para usuarios especificos
  if (found.usuarios.length > 0) {
    var userOk = false;
    for (var i = 0; i < found.usuarios.length; i++) {
      if (found.usuarios[i] == userId) {
        userOk = true;
        break;
      }
    }
    if (userOk == false) {
      return { ok: false, msg: "cupon no valido para este usuario", descuento: 0 };
    }
  }
  // calcular descuento
  var descuentoFinal = 0;
  if (found.tipo == "porcentaje") {
    descuentoFinal = cartTotal * (found.valor / 100);
  }
  if (found.tipo == "fijo") {
    descuentoFinal = found.valor;
    if (descuentoFinal > cartTotal) descuentoFinal = cartTotal;
  }
  if (found.tipo == "envio") {
    descuentoFinal = found.valor; // descuento en envio
  }
  found.usos++;
  return { ok: true, msg: "cupon aplicado", descuento: descuentoFinal, tipo: found.tipo };
}



// formatear precio (funcion repetida 3 veces con minimas diferencias)
function fmtPrice(n) {
  return "$" + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function formatearPrecio(num) {
  return "$" + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function mostrarPrecio(numero) {
  return "$" + numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}




function renderProduct(product, products){
  const data = getProductViewData(product, products);
  return renderProductHTML(data);
}

function getProductViewData(product, products){
  const data = {};

  data.id = product.id;
  data.nombre = product.nom;
  data.descripcion = product.desc;
  data.precio = fmtPrice(product.prec);
  data.categoria = product.cat;
  data.imagen = product.imgs && product.imgs.length > 0 ? product.imgs[0] : "no-image.jpg";

  //stock
  const inventory = checkInventory(product.id, products); //llama a la funcion de chekinventory pasandole id del product y la db de productos "original"
  const status = inventory.status;

  data.sinStock = status === "Agotado";
  data.pocoStock = status === "Critico" || status === "Bajo";
  data.stockText = getStockText(status);

  //rating
  data.rating = product.rating;
  data.stars = buildStars(product.rating);

  //disponibilidad boton
  data.disponible = product.activo && !data.sinStock;

  return data;
}

function buildStars(rating){
  let stars = "";
  for (let i = 0; i < 5; i++){
    if (i < Math.floor(rating)){
      stars += "★";
    } else {
      stars += "☆";
    }
  }
  return stars;
}

function getStockText(status) {
  if (status === "Agotado") return "Producto agotado";
  if (status === "Critico") return "¡Últimas unidades disponibles!";
  if (status === "Bajo") return "Quedan pocas unidades";
  if (status === "Normal") return "Disponible";
  if (status === "Alto") return "Stock disponible";
  return "";
}

function renderProductHTML(data) {
  var html = "";

  html += "<div class='product-card'>";

  html += "<div class='product-img'>";
  html += "<img src='" + data.imagen + "' alt='" + data.nombre + "'>";

  if (data.sinStock){
    html += "<div class='badge-agotado'>AGOTADO</div>";
  } else if (data.pocoStock){
    html += "<div class='badge-poco-stock'>" + data.stockText + "</div>";
  }

  html += "</div>";

  html += "<div class='product-info'>";
  html += "<h3>" + data.nombre + "</h3>";

  html += "<div class='rating'>";
  html += data.stars + " (" + data.rating + ")";
  html += "</div>";

  html += "<p class='desc'>" + data.descripcion + "</p>";
  html += "<div class='price'>" + data.precio + "</div>";
  html += "<div class='category'>Categoría: " + data.categoria + "</div>";

  if (data.disponible){
    html += "<button onclick='addToCart(" + data.id + ", 1)' class='btn-cart'>Agregar al carrito</button>";
  } else {
    html += "<button disabled class='btn-cart-disabled'>No disponible</button>";
  }

  html += "</div>";
  html += "</div>";

  return html;
}




// funcion para procesar formulario de registro (sin separacion de responsabilidades)
function processRegistrationFormAndValidateAndSaveAndSendEmailAndLoginAndRedirect(formData) {
  // 1. validar campos
  var errors = [];
  if (!formData.nombre || formData.nombre == "" || formData.nombre.length < 3) {
    errors.push("Nombre invalido");
  }
  if (!formData.email || formData.email.indexOf("@") == -1) {
    errors.push("Email invalido");
  }
  if (!formData.pass || formData.pass.length < 8) {
    errors.push("Password debe tener minimo 8 caracteres");
  }
  if (formData.pass != formData.passConfirm) {
    errors.push("Passwords no coinciden");
  }
  if (!formData.rut || formData.rut.length < 8) {
    errors.push("RUT invalido");
  }
  if (!formData.telefono || formData.telefono.length < 9) {
    errors.push("Telefono invalido");
  }
  if (errors.length > 0) {
    return { ok: false, errors: errors };
  }
  // 2. verificar si ya existe
  var exists = false;
  var usersDB = [{ email: "juan@mail.com" }, { email: "maria@mail.com" }]; // hardcoded again
  for (var i = 0; i < usersDB.length; i++) {
    if (usersDB[i].email == formData.email) {
      exists = true;
      break;
    }
  }
  if (exists == true) {
    return { ok: false, errors: ["Email ya registrado"] };
  }
  // 3. crear usuario
  var newUser = {
    id: Math.floor(Math.random() * 9000) + 1000,
    nombre: formData.nombre,
    email: formData.email,
    pass: formData.pass, // ALERTA: guardando password en texto plano
    rut: formData.rut,
    telefono: formData.telefono,
    tipo: "cliente",
    puntos: 0,
    descuento: 0,
    historial: [],
    carrito: [],
    wishlist: [],
    direcciones: [],
    metodoPago: [],
    activo: true,
    intentos: 0,
    bloqueado: false,
    ultimoLogin: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  // 4. guardar (simulado)
  console.log("Guardando usuario en DB...", newUser);
  // 5. enviar email de bienvenida
  console.log("Enviando email de bienvenida a " + newUser.email);
  sendNotif("email", newUser.id, "Bienvenido a la tienda! Tu cuenta ha sido creada.", { userName: newUser.nombre });
  // 6. auto-login
  sessData = { user: newUser, token: "tkn_" + Math.random().toString(36).substr(2, 9), loginTime: new Date() };
  currentU = newUser;
  // 7. redirigir (simulado)
  console.log("Redirigiendo a /dashboard...");
  return { ok: true, user: newUser, session: sessData, redirect: "/dashboard" };
}

// funcion de wishlist duplicando logica del carrito
function wishlist(action2, userId4, prodId2) {
  var dbUsers2 = [
    { id: 1, wishlist: [101, 103] },
    { id: 2, wishlist: [102, 104, 105] },
    { id: 3, wishlist: [] },
    { id: 4, wishlist: [101] },
    { id: 5, wishlist: [103, 107, 108] }
  ];
  var foundUser3 = null;
  for (var i = 0; i < dbUsers2.length; i++) {
    if (dbUsers2[i].id == userId4) {
      foundUser3 = dbUsers2[i];
      break;
    }
  }
  if (foundUser3 == null) {
    return { ok: false, msg: "usuario no encontrado" };
  }
  if (action2 == "add") {
    var yaEsta2 = false;
    for (var i = 0; i < foundUser3.wishlist.length; i++) {
      if (foundUser3.wishlist[i] == prodId2) {
        yaEsta2 = true;
        break;
      }
    }
    if (yaEsta2 == true) {
      return { ok: false, msg: "producto ya en wishlist" };
    }
    foundUser3.wishlist.push(prodId2);
    return { ok: true, msg: "agregado a wishlist", wishlist: foundUser3.wishlist };
  }
  if (action2 == "remove") {
    var idx = -1;
    for (var i = 0; i < foundUser3.wishlist.length; i++) {
      if (foundUser3.wishlist[i] == prodId2) {
        idx = i;
        break;
      }
    }
    if (idx == -1) {
      return { ok: false, msg: "producto no en wishlist" };
    }
    foundUser3.wishlist.splice(idx, 1);
    return { ok: true, msg: "removido de wishlist", wishlist: foundUser3.wishlist };
  }
  if (action2 == "get") {
    return { ok: true, wishlist: foundUser3.wishlist };
  }
  return { ok: false, msg: "accion no reconocida" };
}

// funcion gigante de actualizacion de perfil que mezcla todo
function updateUserProfile(uid, field, value, field2, value2, field3, value3, field4, value4, field5, value5) {
  // actualizar hasta 5 campos a la vez con parametros individuales
  var dbUsers3 = [
    { id: 1, nombre: "Juan Perez", email: "juan@mail.com", telefono: "912345678", rut: "12345678-9", direccion: "Av. Siempre Viva 123", ciudad: "Santiago", region: "RM", codPostal: "8320000", pass: "1234" }
  ];
  var user4 = null;
  for (var i = 0; i < dbUsers3.length; i++) {
    if (dbUsers3[i].id == uid) {
      user4 = dbUsers3[i];
      break;
    }
  }
  if (user4 == null) return { ok: false, msg: "no encontrado" };
  // actualizar campos sin validacion adecuada
  if (field && value) user4[field] = value;
  if (field2 && value2) user4[field2] = value2;
  if (field3 && value3) user4[field3] = value3;
  if (field4 && value4) user4[field4] = value4;
  if (field5 && value5) user4[field5] = value5;
  console.log("Usuario actualizado:", user4);
  return { ok: true, user: user4 };
}

// funcion para reviews - mezcla lectura y escritura
function reviews(action3, prodId3, userId5, rating2, comment, data4) {
  var dbReviews = [
    { id: 1, prodId: 101, userId: 2, rating: 5, comment: "Excelente laptop!", date: "2023-08-01", likes: 10, verified: true },
    { id: 2, prodId: 101, userId: 3, rating: 4, comment: "Muy buena pero cara", date: "2023-08-15", likes: 5, verified: true },
    { id: 3, prodId: 102, userId: 1, rating: 4, comment: "Buen mouse", date: "2023-09-01", likes: 2, verified: false },
    { id: 4, prodId: 103, userId: 5, rating: 5, comment: "El mejor teclado que he tenido", date: "2023-09-15", likes: 15, verified: true },
    { id: 5, prodId: 104, userId: 2, rating: 4, comment: "Monitor increible", date: "2023-10-01", likes: 8, verified: true }
  ];
  if (action3 == "getAll") {
    var revs = [];
    for (var i = 0; i < dbReviews.length; i++) {
      if (dbReviews[i].prodId == prodId3) {
        revs.push(dbReviews[i]);
      }
    }
    return { ok: true, reviews: revs, count: revs.length };
  }
  if (action3 == "add") {
    // verificar que el usuario haya comprado el producto
    var compro = false; // siempre false en este ejemplo - logica incompleta
    // agregar review sin verificacion real
    var newReview = {
      id: dbReviews.length + 1,
      prodId: prodId3,
      userId: userId5,
      rating: rating2,
      comment: comment,
      date: new Date().toISOString().split("T")[0],
      likes: 0,
      verified: compro
    };
    dbReviews.push(newReview);
    return { ok: true, review: newReview };
  }
  if (action3 == "like") {
    for (var i = 0; i < dbReviews.length; i++) {
      if (dbReviews[i].id == data4) {
        dbReviews[i].likes++;
        return { ok: true, likes: dbReviews[i].likes };
      }
    }
    return { ok: false, msg: "review no encontrada" };
  }
  if (action3 == "delete") {
    var idx2 = -1;
    for (var i = 0; i < dbReviews.length; i++) {
      if (dbReviews[i].id == data4 && dbReviews[i].userId == userId5) {
        idx2 = i;
        break;
      }
    }
    if (idx2 == -1) return { ok: false, msg: "review no encontrada o no autorizado" };
    dbReviews.splice(idx2, 1);
    return { ok: true, msg: "review eliminada" };
  }
  return { ok: false, msg: "accion invalida" };
}

// funcion de envio con logica embebida
function calcShipping(destCity, weight, dimensions, prodType, isUrgent, isFree, hasInsurance) {
  // tasas hardcodeadas
  var baseCost = 0;
  var cityMult = 1;
  var weightCost = 0;
  var insuranceCost = 0;
  var urgentCost = 0;
  
  if (destCity == "Santiago") cityMult = 1;
  if (destCity == "Valparaiso") cityMult = 1.2;
  if (destCity == "Concepcion") cityMult = 1.4;
  if (destCity == "La Serena") cityMult = 1.6;
  if (destCity == "Antofagasta") cityMult = 1.8;
  if (destCity == "Iquique") cityMult = 2.0;
  if (destCity == "Punta Arenas") cityMult = 2.5;
  
  // costo por peso
  if (weight <= 1) weightCost = 2000;
  if (weight > 1 && weight <= 5) weightCost = 3500;
  if (weight > 5 && weight <= 10) weightCost = 5000;
  if (weight > 10 && weight <= 20) weightCost = 8000;
  if (weight > 20) weightCost = 12000;
  
  // tipo de producto
  if (prodType == "fragil") weightCost = weightCost * 1.5;
  if (prodType == "electronico") weightCost = weightCost * 1.3;
  if (prodType == "normal") weightCost = weightCost * 1;
  
  baseCost = weightCost * cityMult;
  
  if (isUrgent == true) urgentCost = baseCost * 0.5;
  if (hasInsurance == true) insuranceCost = baseCost * 0.1;
  if (isFree == true) return { costo: 0, desglose: "Envio gratis" };
  
  var total = baseCost + urgentCost + insuranceCost;
  return { costo: total, base: baseCost, urgente: urgentCost, seguro: insuranceCost };
}

// funcion inventario con numeros magicos
function checkInventory(prodId4, products) {
  var prods2 = [
    { id: 101, stock: 5 }, { id: 102, stock: 50 }, { id: 103, stock: 20 },
    { id: 104, stock: 8 }, { id: 105, stock: 30 }, { id: 106, stock: 15 },
    { id: 107, stock: 25 }, { id: 108, stock: 40 }, { id: 109, stock: 0 },
    { id: 110, stock: 60 }
  ];
  var prod3 = null;
  for (var i = 0; i < prods2.length; i++) {
    if (prods2[i].id == prodId4) { prod3 = prods2[i]; break; }
  }
  if (prod3 == null) return { ok: false };
  var status = "";
  var color = "";
  var alerta = false;
  if (prod3.stock == 0) { status = "Agotado"; color = "red"; alerta = true; }
  if (prod3.stock > 0 && prod3.stock <= 5) { status = "Critico"; color = "orange"; alerta = true; }   // numero magico 5
  if (prod3.stock > 5 && prod3.stock <= 15) { status = "Bajo"; color = "yellow"; alerta = true; }     // numero magico 15
  if (prod3.stock > 15 && prod3.stock <= 30) { status = "Normal"; color = "green"; alerta = false; }  // numero magico 30
  if (prod3.stock > 30) { status = "Alto"; color = "green"; alerta = false; }
  return { ok: true, prodId: prodId4, stock: prod3.stock, status: status, color: color, alerta: alerta };
}

// funcion de logs sin estructura
function log(msg, level, data) {
  var timestamp = new Date().toISOString();
  var entry = "[" + timestamp + "] [" + level + "] " + msg;
  if (data) entry += " | DATA: " + JSON.stringify(data);
  console.log(entry);
  // no hay manejo de niveles, no hay rotacion de logs, no hay storage
}

// funcion de paginacion copia-pega
function paginateProducts(items, page, size) {
  var total = items.length;
  var totalPages = Math.ceil(total / size);
  var start = (page - 1) * size;
  var end = start + size;
  var pageItems = items.slice(start, end);
  return { items: pageItems, page: page, totalPages: totalPages, total: total, size: size };
}
function paginateUsers(items2, page2, size2) {
  var total2 = items2.length;
  var totalPages2 = Math.ceil(total2 / size2);
  var start2 = (page2 - 1) * size2;
  var end2 = start2 + size2;
  var pageItems2 = items2.slice(start2, end2);
  return { items: pageItems2, page: page2, totalPages: totalPages2, total: total2, size: size2 };
}
function paginateOrders(items3, page3, size3) {
  var total3 = items3.length;
  var totalPages3 = Math.ceil(total3 / size3);
  var start3 = (page3 - 1) * size3;
  var end3 = start3 + size3;
  var pageItems3 = items3.slice(start3, end3);
  return { items: pageItems3, page: page3, totalPages: totalPages3, total: total3, size: size3 };
}


// Franco
// refactorizacion de sorting
function sortByField(items, field, order) {
  const sortedItems = items.slice();

  sortedItems.sort((a, b) => {
    if (a[field] === b[field]) return 0;

    const isAscending = order === "asc";

    return (a[field] < b[field])
      ? (isAscending ? -1 : 1)
      : (isAscending ? 1 : -1);
  });

  return sortedItems;
}

function sortProducts(products, field, order) {
  return sortByField(products, field, order);
}

function sortUsers(users, field, order) {
  return sortByField(users, field, order);
}

function sortOrders(orders, field, order) {
  return sortByField(orders, field, order);
}


// formateo de fecha unificado
function padNumber(value) {
  return value < 10 ? "0" + value : value;
}

function formatDateTime(date) {
  const day = padNumber(date.getDate());
  const month = padNumber(date.getMonth() + 1);
  const year = date.getFullYear();

  const hours = padNumber(date.getHours());
  const minutes = padNumber(date.getMinutes());
  const seconds = padNumber(date.getSeconds());

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function formatDateOnly(date) {
  const day = padNumber(date.getDate());
  const month = padNumber(date.getMonth() + 1);
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function formatDateFromString(dateString) {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}


// utils reemplazado por funciones reales
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}
function truncate(text, maxLength) {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function slugify(text) {
  return text.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
}
function deepClone(object) {
  return JSON.parse(JSON.stringify(object));
}
function isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}
function sumArray(numbers) {
  return numbers.reduce((sum, n) => sum + n, 0);
}
function averageArray(numbers) {
  return numbers.length ? sumArray(numbers) / numbers.length : 0;
}
function uniqueArray(array) {
  return [...new Set(array)];
}
function flattenArray(array) {
  return array.flat();
}

// export limpio
module.exports = {
  doEverything,
  v,
  calc,
  makeReport,
  sendNotif,
  notifyUser,
  cupon,
  search,
  fmtPrice,
  renderProduct,
  processRegistrationFormAndValidateAndSaveAndSendEmailAndLoginAndRedirect,
  wishlist,
  updateUserProfile,
  reviews,
  calcShipping,
  checkInventory,
  log,
  paginateProducts,
  paginateUsers,
  paginateOrders,
  sortProducts,
  sortUsers,
  sortOrders,

  // fechas
  formatDateTime,
  formatDateOnly,
  formatDateFromString,

  // utils separadas
  capitalize,
  truncate,
  getRandomNumber,
  slugify,
  deepClone,
  isEmptyObject,
  sumArray,
  averageArray,
  uniqueArray,
  flattenArray
};

    /* ============================================================
       PROYECTO: SAFEGUARD INDUSTRIAL
       ARCHIVO:  script.js (JS General compartido en todas las páginas)
       ============================================================ */

    document.addEventListener("DOMContentLoaded", function () {

        /* ============================================================
           NAVEGACIÓN — Dropdowns del header (todas las páginas)
           Ya manejado por CSS (:hover), sin JS necesario aquí.
           ============================================================ */


        /* ============================================================
           PÁGINA — CALCULADORA DE EPP
           ============================================================ */
        const formularioCalc = document.getElementById('industria');

        if (formularioCalc) {

            let riesgoSeleccionado = "alto";

            const EQUIPOS_BASE = [
                ["Casco de seguridad",      1, "Anual",      "alta",  85],
                ["Guantes industriales",    2, "Mensual",    "alta",  20],
                ["Gafas de protección",     1, "Semestral",  "media", 35],
                ["Calzado de seguridad",    1, "Anual",      "alta",  120],
                ["Chaleco reflectivo",      1, "Semestral",  "baja",  25]
            ];

            const EQUIPOS_POR_INDUSTRIA = {
                construccion: ["Arnés anticaídas", 1, "Anual", "alta", 230],
                mineria:      ["Arnés anticaídas", 1, "Anual", "alta", 230],
                quimica:      ["Traje químico",    1, "Trimestral", "alta", 310],
                manufactura:  null,
                logistica:    null
            };

            const pillsRiesgo = document.querySelectorAll('.pills-riesgo .pill');
            pillsRiesgo.forEach(function (pill) {
                pill.addEventListener('click', function () {
                    pillsRiesgo.forEach(function (p) { p.classList.remove('activo'); });
                    this.classList.add('activo');
                    riesgoSeleccionado = this.textContent.trim().toLowerCase();
                });
            });

            function calcularPrioridadFinal(prioridadBase, riesgo) {
                switch (riesgo) {
                    case "alto":
                        if (prioridadBase === "media") return "alta";
                        return prioridadBase;
                    case "bajo":
                        if (prioridadBase === "alta") return "media";
                        return prioridadBase;
                    case "medio":
                    default:
                        return prioridadBase;
                }
            }

            function crearFilaEquipo(nombre, cantidadBase, frecuencia, prioridadBase, trabajadores) {
                const cantidadTotal = cantidadBase * trabajadores;
                const prioridadFinal = calcularPrioridadFinal(prioridadBase, riesgoSeleccionado);

                let claseBadge = "badge-media";
                if (prioridadFinal === "alta") claseBadge = "badge-alta";
                if (prioridadFinal === "baja") claseBadge = "badge-baja";

                return "<tr>" +
                    "<td>" + nombre + "</td>" +
                    "<td>" + cantidadTotal + " x trabajador</td>" +
                    "<td>" + frecuencia + "</td>" +
                    "<td><span class='" + claseBadge + "'>" +
                    prioridadFinal.charAt(0).toUpperCase() + prioridadFinal.slice(1) +
                    "</span></td></tr>";
            }

            function calcularEPP() {
                const industria = document.getElementById('industria').value;
                const trabajadoresInput = document.getElementById('trabajadores').value;
                const trabajadores = parseInt(trabajadoresInput, 10);

                if (industria === "" || trabajadoresInput === "" || isNaN(trabajadores) || trabajadores < 1) {
                    alert("Por favor selecciona tu industria e ingresa un número válido de trabajadores.");
                    return;
                }

                const cuerpoTabla = document.getElementById('cuerpo-tabla-calc');
                cuerpoTabla.innerHTML = "";

                let totalEquipos = 0, presupuestoTotal = 0;

                for (let i = 0; i < EQUIPOS_BASE.length; i++) {
                    const [nombre, cantidadBase, frecuencia, prioridadBase, precioUnitario] = EQUIPOS_BASE[i];
                    cuerpoTabla.innerHTML += crearFilaEquipo(nombre, cantidadBase, frecuencia, prioridadBase, trabajadores);
                    totalEquipos += cantidadBase * trabajadores;
                    presupuestoTotal += precioUnitario * cantidadBase * trabajadores;
                }

                const equipoExtra = EQUIPOS_POR_INDUSTRIA[industria];
                if (equipoExtra) {
                    const [nombreExtra, cantExtra, frecExtra, prioExtra, precioExtra] = equipoExtra;
                    cuerpoTabla.innerHTML += crearFilaEquipo(nombreExtra, cantExtra, frecExtra, prioExtra, trabajadores);
                    totalEquipos += cantExtra * trabajadores;
                    presupuestoTotal += precioExtra * cantExtra * trabajadores;
                }

                document.getElementById('metrica-total').textContent = totalEquipos;
                document.getElementById('metrica-presupuesto').textContent = "S/ " + presupuestoTotal.toLocaleString('es-PE');

                let norma = "ANSI Z89.1";
                switch (industria) {
                    case "quimica": norma = "OSHA 1910.132"; break;
                    case "mineria":
                    case "construccion": norma = "ANSI Z89.1 / OSHA 1910"; break;
                    default: norma = "ANSI Z89.1";
                }
                document.getElementById('metrica-norma').textContent = norma;

                setTimeout(function () {
                    const irACotizar = confirm(
                        "Calculamos " + totalEquipos + " equipos con un presupuesto estimado de S/ " +
                        presupuestoTotal.toLocaleString('es-PE') + ".\n\n¿Deseas solicitar una cotización formal con esta lista?"
                    );
                    if (irACotizar) window.location.href = "../Cotizacion/Cotizacion.html";
                }, 0);
            }

            const botonCalcular = document.querySelector('.btn-calcular');
            let usuarioCalculoManualmente = false;

            if (botonCalcular) {
                botonCalcular.addEventListener('click', function () {
                    usuarioCalculoManualmente = true;
                    calcularEPP();
                });
            }

            const PERFILES_DEMO = [
                { industria: "construccion", trabajadores: 35, riesgo: "alto" },
                { industria: "mineria", trabajadores: 80, riesgo: "alto" },
                { industria: "quimica", trabajadores: 50, riesgo: "medio" },
                { industria: "manufactura", trabajadores: 120, riesgo: "bajo" },
                { industria: "logistica", trabajadores: 60, riesgo: "medio" }
            ];
            let indiceDemo = 0;

            function ejecutarDemoAutomatico() {
                if (usuarioCalculoManualmente) return;

                const perfil = PERFILES_DEMO[indiceDemo];
                riesgoSeleccionado = perfil.riesgo;

                const cuerpoTabla = document.getElementById('cuerpo-tabla-calc');
                cuerpoTabla.innerHTML = "";

                let totalEquipos = 0, presupuestoTotal = 0;

                for (let i = 0; i < EQUIPOS_BASE.length; i++) {
                    const [nombre, cantidadBase, frecuencia, prioridadBase, precioUnitario] = EQUIPOS_BASE[i];
                    cuerpoTabla.innerHTML += crearFilaEquipo(nombre, cantidadBase, frecuencia, prioridadBase, perfil.trabajadores);
                    totalEquipos += cantidadBase * perfil.trabajadores;
                    presupuestoTotal += precioUnitario * cantidadBase * perfil.trabajadores;
                }

                const equipoExtra = EQUIPOS_POR_INDUSTRIA[perfil.industria];
                if (equipoExtra) {
                    const [nombreExtra, cantExtra, frecExtra, prioExtra, precioExtra] = equipoExtra;
                    cuerpoTabla.innerHTML += crearFilaEquipo(nombreExtra, cantExtra, frecExtra, prioExtra, perfil.trabajadores);
                    totalEquipos += cantExtra * perfil.trabajadores;
                    presupuestoTotal += precioExtra * cantExtra * perfil.trabajadores;
                }

                document.getElementById('metrica-total').textContent = totalEquipos;
                document.getElementById('metrica-presupuesto').textContent = "S/ " + presupuestoTotal.toLocaleString('es-PE');

                let norma = "ANSI Z89.1";
                switch (perfil.industria) {
                    case "quimica": norma = "OSHA 1910.132"; break;
                    case "mineria":
                    case "construccion": norma = "ANSI Z89.1 / OSHA 1910"; break;
                    default: norma = "ANSI Z89.1";
                }
                document.getElementById('metrica-norma').textContent = norma;

                const selectIndustria = document.getElementById('industria');
                if (selectIndustria) selectIndustria.value = perfil.industria;
                const inputTrabajadores = document.getElementById('trabajadores');
                if (inputTrabajadores) inputTrabajadores.value = perfil.trabajadores;

                indiceDemo = (indiceDemo + 1) % PERFILES_DEMO.length;
            }

            ejecutarDemoAutomatico();
            setInterval(ejecutarDemoAutomatico, 12000);
        }


        /* ============================================================
           PÁGINA — PREGUNTAS FRECUENTES (FAQ)
           ============================================================ */
        const headersFaq = document.querySelectorAll('.acordeon-header');

        headersFaq.forEach(function (header) {
            header.addEventListener('click', function () {
                const item = this.parentElement;
                document.querySelectorAll('.acordeon-item').forEach(function (i) {
                    if (i !== item) i.classList.remove('abierto');
                });
                item.classList.toggle('abierto');
            });
        });

        const linksFaq = document.querySelectorAll('.sidebar-faq ul li a');

        linksFaq.forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();

                linksFaq.forEach(function (l) { l.classList.remove('activo'); });
                this.classList.add('activo');

                const idObjetivo = this.getAttribute('href').substring(1);
                const itemObjetivo = document.getElementById(idObjetivo);

                if (itemObjetivo) {
                    document.querySelectorAll('.acordeon-item').forEach(function (i) {
                        i.classList.remove('abierto');
                    });
                    itemObjetivo.classList.add('abierto');
                    itemObjetivo.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        });


        /* ============================================================
           PÁGINA — SOPORTE TÉCNICO (Chat flotante)
           ============================================================ */
        const botonChat = document.getElementById('boton-chat');

        if (botonChat) {
            const respuestasBot = [
                ["envios",  "¿Hacen envíos a todo el Perú?",
                    "Sí, realizamos envíos a todo el territorio peruano. Pedidos mayores a S/500 tienen envío gratuito y llegan en 48 a 72 horas."],
                ["garantia", "¿Cuál es la garantía de los productos?",
                    "Todos nuestros EPP cuentan con 12 meses de garantía contra defectos de fabricación, respaldados por certificación ANSI/OSHA."],
                ["horario", "¿Cuál es su horario de atención?",
                    "Atendemos de Lunes a Viernes de 8:00am a 6:00pm, y Sábados de 9:00am a 1:00pm."],
                ["asesor", "Quiero hablar con un asesor",
                    "Perfecto, te derivaremos a un asesor humano. Por favor confirma para continuar."]
            ];

            function alternarChat() {
                document.getElementById("ventana-chat").classList.toggle("abierta");
            }

            botonChat.addEventListener('click', alternarChat);
            document.getElementById('btn-cerrar-chat').addEventListener('click', alternarChat);

            document.querySelectorAll('.btn-pregunta-rapida').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    const clave = this.getAttribute('data-pregunta');
                    let pregunta = "", respuesta = "";

                    for (let i = 0; i < respuestasBot.length; i++) {
                        if (respuestasBot[i][0] === clave) {
                            pregunta = respuestasBot[i][1];
                            respuesta = respuestasBot[i][2];
                            break;
                        }
                    }

                    const chatBody = document.getElementById("chat-body");
                    const burbujaUsuario = document.createElement("div");
                    burbujaUsuario.className = "mensaje-usuario";
                    burbujaUsuario.textContent = pregunta;
                    const sonido = document.getElementById('sonido-notificacion');
                    if (sonido) sonido.play();
                    chatBody.appendChild(burbujaUsuario);

                    setTimeout(function () {
                        const burbujaBot = document.createElement("div");
                        burbujaBot.className = "mensaje-bot";
                        burbujaBot.textContent = respuesta;
                        chatBody.appendChild(burbujaBot);
                        chatBody.scrollTop = chatBody.scrollHeight;

                        if (clave === "asesor") {
                            const confirmar = confirm("¿Deseas que un asesor te contacte por WhatsApp ahora mismo?");
                            if (confirmar) window.open("https://wa.me/51999999999", "_blank");
                        }
                    }, 500);

                    chatBody.scrollTop = chatBody.scrollHeight;
                });
            });
        }


        /* ============================================================
           PÁGINA — ASESORÍA TÉCNICA
           ============================================================ */
        const formAsesoria = document.getElementById('form-asesoria');

        if (formAsesoria) {
            const TIPOS_ASESORIA = ["auditoria", "seleccion", "capacitacion", "riesgos"];
            let urgenciaSeleccionada = "media";

            const botonesUrgencia = document.querySelectorAll(".pill-urgencia");
            botonesUrgencia.forEach(function (boton) {
                boton.addEventListener("click", function () {
                    botonesUrgencia.forEach(function (b) { b.classList.remove("activo"); });
                    this.classList.add("activo");
                    urgenciaSeleccionada = this.getAttribute("data-urgencia");
                });
            });

            function calcularTiempoRespuesta(tipo, urgencia) {
                let horas = 48;
                switch (tipo) {
                    case "auditoria": horas = 72; break;
                    case "seleccion": horas = 24; break;
                    case "capacitacion": horas = 96; break;
                    case "riesgos": horas = 48; break;
                    default: horas = 48;
                }
                if (urgencia === "alta") horas = horas / 2;
                else if (urgencia === "baja") horas = horas * 1.5;
                return Math.round(horas);
            }

            function enviarAsesoria() {
                const nombre = document.getElementById("nombre-asesoria").value;
                const email = document.getElementById("email-asesoria").value;
                const tipo = document.getElementById("tipo-asesoria").value;

                if (nombre === "" || email === "" || tipo === "") {
                    alert("Por favor completa al menos tu nombre, email y el tipo de asesoría antes de continuar.");
                    return;
                }
                if (!TIPOS_ASESORIA.includes(tipo)) {
                    alert("Selecciona un tipo de asesoría válido.");
                    return;
                }

                const tiempoEstimado = calcularTiempoRespuesta(tipo, urgenciaSeleccionada);
                const resultado = document.getElementById("resultado-asesoria");
                resultado.innerHTML =
                    "Hola <strong>" + nombre + "</strong>, recibimos tu solicitud. " +
                    "Un especialista te contactará en aproximadamente " +
                    "<strong>" + tiempoEstimado + " horas</strong> según la urgencia indicada.";

                const confirmar = confirm(
                    "¿Confirmas el envío de tu solicitud de asesoría?\n\nTipo: " + tipo + "\nUrgencia: " + urgenciaSeleccionada
                );

                if (confirmar) {
                    alert("¡Solicitud enviada con éxito! Revisa tu correo en las próximas horas.");
                } else {
                    alert("Tu solicitud no fue enviada. Puedes intentarlo de nuevo cuando quieras.");
                }
            }

            document.getElementById('btn-enviar-asesoria').addEventListener('click', enviarAsesoria);
        }


        /* ============================================================
           PÁGINA — COMPARADOR DE PRODUCTOS
           ============================================================ */
        const btnComparar = document.getElementById('btn-comparar');

        if (btnComparar) {
            const matrizProductos = [
                ["casco",   "Casco de Seguridad Pro",   "ABS de alta resistencia",      "450 g",  "ANSI Z89.1",  "S/ 85.00"],
                ["arnes",   "Arnés Anticaídas",          "Poliéster reforzado",          "1.2 kg", "ANSI Z359.1", "S/ 220.00"],
                ["extintor","Extintor PQS 6kg",          "Acero al carbono",             "9.5 kg", "NTP 350.043", "S/ 180.00"],
                ["traje",   "Traje Químico Tyvek",       "Polietileno laminado",         "0.6 kg", "EN 14605",    "S/ 95.00"],
                ["andamio", "Andamio Modular",           "Acero galvanizado",            "18 kg",  "EN 12810",    "S/ 650.00"]
            ];

            const etiquetasFilas = ["Nombre", "Material", "Peso", "Normativa", "Precio"];

            function buscarProducto(clave) {
                for (let i = 0; i < matrizProductos.length; i++) {
                    if (matrizProductos[i][0] === clave) return matrizProductos[i];
                }
                return null;
            }

            function generarComparacion() {
                const clave1 = document.getElementById("producto1").value;
                const clave2 = document.getElementById("producto2").value;
                const clave3 = document.getElementById("producto3").value;

                const seleccionadas = [clave1, clave2, clave3].filter(function (c) { return c !== ""; });

                if (seleccionadas.length < 2) {
                    alert("Selecciona al menos 2 productos para poder compararlos.");
                    return;
                }

                const productosEncontrados = [];
                seleccionadas.forEach(function (clave) {
                    const producto = buscarProducto(clave);
                    if (producto) productosEncontrados.push(producto);
                });

                let html = "<table class='tabla-comparador'><thead><tr><th>Especificación</th>";
                productosEncontrados.forEach(function (producto) { html += "<th>" + producto[1] + "</th>"; });
                html += "</tr></thead><tbody>";

                for (let fila = 0; fila < etiquetasFilas.length; fila++) {
                    html += "<tr><td>" + etiquetasFilas[fila] + "</td>";
                    productosEncontrados.forEach(function (producto) { html += "<td>" + producto[fila + 2] + "</td>"; });
                    html += "</tr>";
                }
                html += "</tbody></table>";

                document.getElementById("zona-resultado").innerHTML = html;
            }

            btnComparar.addEventListener('click', generarComparacion);
        }


        /* ============================================================
           PÁGINA — SEGUIMIENTO DE PEDIDO
           ============================================================ */
        const btnConsultarPedido = document.getElementById('btn-consultar-pedido');

        if (btnConsultarPedido) {
            const pedidosSimulados = { "SG001": 1, "SG002": 2, "SG003": 3, "SG004": 4 };
            const textosEstado = {
                1: "Tu pedido fue confirmado y está siendo procesado por nuestro equipo.",
                2: "Tu pedido está siendo preparado en nuestro almacén central.",
                3: "Tu pedido va en camino. Llegará en las próximas 24 a 48 horas.",
                4: "¡Tu pedido fue entregado con éxito! Gracias por confiar en Safeguard Industrial."
            };

            function mostrarResultado(codigo, etapaActual) {
                document.getElementById("titulo-resultado").textContent = "Pedido #" + codigo;
                document.getElementById("subtitulo-resultado").textContent = "Estado actual: Etapa " + etapaActual + " de 4";

                for (let i = 1; i <= 4; i++) {
                    document.getElementById("etapa-" + i).classList.remove("completada", "actual");
                }

                switch (etapaActual) {
                    case 4:
                        document.getElementById("etapa-3").classList.add("completada");
                        document.getElementById("etapa-2").classList.add("completada");
                        document.getElementById("etapa-1").classList.add("completada");
                        document.getElementById("etapa-4").classList.add("actual");
                        break;
                    case 3:
                        document.getElementById("etapa-2").classList.add("completada");
                        document.getElementById("etapa-1").classList.add("completada");
                        document.getElementById("etapa-3").classList.add("actual");
                        break;
                    case 2:
                        document.getElementById("etapa-1").classList.add("completada");
                        document.getElementById("etapa-2").classList.add("actual");
                        break;
                    case 1:
                        document.getElementById("etapa-1").classList.add("actual");
                        break;
                    default:
                        alert("Etapa de pedido no reconocida.");
                }

                document.getElementById("texto-estado").innerHTML = "<strong>Estado:</strong> " + textosEstado[etapaActual];
                document.getElementById("resultado-seguimiento").classList.add("visible");
            }

            function consultarPedido() {
                const codigoIngresado = prompt("Ingresa tu código de pedido (Ej: SG001):");
                if (codigoIngresado === null) return;

                const codigo = codigoIngresado.trim().toUpperCase();
                if (codigo === "") {
                    alert("Debes ingresar un código de pedido.");
                    return;
                }

                const etapa = pedidosSimulados[codigo];
                if (!etapa) {
                    alert("No encontramos un pedido con el código '" + codigo + "'. Verifica e intenta de nuevo.");
                    return;
                }

                mostrarResultado(codigo, etapa);
            }

            btnConsultarPedido.addEventListener('click', consultarPedido);
        }


        /* ============================================================
           PÁGINA — MAPA DE DISTRIBUIDORES
           Filtro por ciudad: muestra/oculta tarjetas según data-ciudad
           ============================================================ */
        const filtrosCiudad = document.querySelectorAll('.filtros-ciudad .btn-filtro');

        if (filtrosCiudad.length > 0) {
            const tarjetasDistribuidor = document.querySelectorAll('.tarjeta-distribuidor');
            const mapaHeaderSpan = document.querySelector('.mapa-header span');

            filtrosCiudad.forEach(function (btn) {
                btn.addEventListener('click', function () {
                    filtrosCiudad.forEach(function (b) { b.classList.remove('activo'); });
                    this.classList.add('activo');

                    const ciudad = this.getAttribute('data-ciudad');
                    let visibles = 0;

                    tarjetasDistribuidor.forEach(function (tarjeta) {
                        const ciudadTarjeta = tarjeta.getAttribute('data-ciudad');

                        if (ciudad === 'todos' || ciudadTarjeta === ciudad) {
                            tarjeta.style.display = 'block';
                            visibles++;
                        } else {
                            tarjeta.style.display = 'none';
                        }
                    });

                    if (mapaHeaderSpan) mapaHeaderSpan.textContent = visibles;
                });
            });
        }


        /* ============================================================
           PÁGINA — COTIZACIÓN
           ============================================================ */
        const formCotizacion = document.getElementById('form-cotizacion');

        if (formCotizacion) {
            const btnEnviarCotizacion = document.getElementById('btn-enviar-cotizacion');

            btnEnviarCotizacion.addEventListener('click', function () {
                const nombre = document.getElementById('nombre').value.trim();
                const email = document.getElementById('email').value.trim();
                const categoria = document.getElementById('categoria').value;
                const descripcion = document.getElementById('descripcion').value.trim();

                // VALIDACIÓN con operadores lógicos
                if (nombre === "" || email === "" || categoria === "" || descripcion === "") {
                    alert("Por favor completa los campos obligatorios: nombre, email, categoría y descripción.");
                    return;
                }

                // Validación simple de formato email
                if (!email.includes("@") || !email.includes(".")) {
                    alert("Ingresa un correo electrónico válido.");
                    return;
                }

                const confirmar = confirm(
                    "¿Confirmas el envío de tu solicitud de cotización?\n\n" +
                    "Nombre: " + nombre + "\nCategoría: " + categoria
                );

                if (confirmar) {
                    alert("¡Solicitud de cotización enviada con éxito! Te contactaremos en menos de 24 horas.");
                    formCotizacion.reset();
                } else {
                    alert("Tu solicitud no fue enviada.");
                }
            });
        }

        /* ============================================================
       PÁGINA — PANEL DE INVENTARIO
       ============================================================ */
        const tablaInventario = document.getElementById('tabla-inventario');

        if (tablaInventario) {

            const sucursales = ["Arequipa Centro", "Arequipa Norte", "Lima San Isidro", "Lima Callao", "Cusco", "Trujillo"];
            const productosInv = ["Cascos", "Arneses", "Extintores", "Trajes", "Señales", "Guantes"];

            const inventario = [
                [45, 8,  30, 22, 50, 18],
                [12, 5,  7,  40, 15, 33],
                [60, 25, 42, 8,  70, 9],
                [7,  18, 55, 35, 6,  44],
                [30, 3,  14, 27, 38, 11],
                [22, 40, 9,  50, 17, 28]
            ];

            let sucursalActiva = -1;

            function totalFila(fila) {
                let total = 0;
                for (let j = 0; j < fila.length; j++) total += fila[j];
                return total;
            }

            function totalColumna(colIndex) {
                let total = 0;
                for (let i = 0; i < inventario.length; i++) total += inventario[i][colIndex];
                return total;
            }

            // Usa WHILE en vez de FOR — cumple el requisito de estructuras repetitivas
            function calcularMinimo() {
                let i = 0;
                let minimo = inventario[0][0];
                while (i < inventario.length) {
                    let j = 0;
                    while (j < inventario[i].length) {
                        if (inventario[i][j] < minimo) minimo = inventario[i][j];
                        j++;
                    }
                    i++;
                }
                return minimo;
            }

            function contarCriticos() {
                let criticos = 0;
                for (let i = 0; i < inventario.length; i++) {
                    for (let j = 0; j < inventario[i].length; j++) {
                        if (inventario[i][j] < 10) criticos++;
                    }
                }
                return criticos;
            }

            function totalGeneral() {
                let total = 0;
                for (let i = 0; i < inventario.length; i++) {
                    for (let j = 0; j < inventario[i].length; j++) total += inventario[i][j];
                }
                return total;
            }

            function generarFiltros() {
                const contenedor = document.getElementById("filtros-inventario");

                const btnTodas = document.createElement("button");
                btnTodas.className = "btn-filtro-inv activo";
                btnTodas.textContent = "Todas";
                btnTodas.setAttribute("data-index", "-1");
                btnTodas.onclick = function () { filtrarSucursal(-1); };
                contenedor.appendChild(btnTodas);

                for (let i = 0; i < sucursales.length; i++) {
                    const btn = document.createElement("button");
                    btn.className = "btn-filtro-inv";
                    btn.textContent = sucursales[i];
                    btn.setAttribute("data-index", i);
                    btn.onclick = (function (index) { return function () { filtrarSucursal(index); }; })(i);
                    contenedor.appendChild(btn);
                }
            }

            function filtrarSucursal(index) {
                sucursalActiva = index;
                const botones = document.querySelectorAll(".btn-filtro-inv");
                for (let b = 0; b < botones.length; b++) {
                    botones[b].classList.remove("activo");
                    if (parseInt(botones[b].getAttribute("data-index")) === index) {
                        botones[b].classList.add("activo");
                    }
                }
                generarTabla();
            }

            function generarMetricas() {
                const contenedor = document.getElementById("metricas-inventario");
                const total = totalGeneral();
                const criticos = contarCriticos();
                const minimo = calcularMinimo();
                const promedio = Math.round(total / (inventario.length * productosInv.length));

                const datos = [
                    { etiqueta: "TOTAL UNIDADES", valor: total },
                    { etiqueta: "STOCK MÍNIMO", valor: minimo },
                    { etiqueta: "PROMEDIO / CELDA", valor: promedio },
                    { etiqueta: "ALERTAS CRÍTICAS", valor: criticos }
                ];

                for (let k = 0; k < datos.length; k++) {
                    const card = document.createElement("div");
                    card.className = "metrica-inv-card";

                    const etiqueta = document.createElement("span");
                    etiqueta.textContent = datos[k].etiqueta;

                    const valor = document.createElement("strong");
                    valor.textContent = datos[k].valor;

                    if (datos[k].etiqueta === "ALERTAS CRÍTICAS" && datos[k].valor > 0) {
                        valor.style.color = "#e74c3c";
                    }

                    card.appendChild(etiqueta);
                    card.appendChild(valor);
                    contenedor.appendChild(card);
                }
            }

            function generarTabla() {
                const tabla = document.getElementById("tabla-inventario");
                tabla.innerHTML = "";

                const thead = document.createElement("thead");
                const filaEncabezado = document.createElement("tr");

                const thVacio = document.createElement("th");
                thVacio.textContent = "SUCURSAL / PRODUCTO";
                filaEncabezado.appendChild(thVacio);

                for (let j = 0; j < productosInv.length; j++) {
                    const th = document.createElement("th");
                    th.textContent = productosInv[j].toUpperCase();
                    filaEncabezado.appendChild(th);
                }

                const thTotal = document.createElement("th");
                thTotal.textContent = "TOTAL";
                filaEncabezado.appendChild(thTotal);

                thead.appendChild(filaEncabezado);
                tabla.appendChild(thead);

                const tbody = document.createElement("tbody");

                for (let i = 0; i < inventario.length; i++) {
                    if (sucursalActiva !== -1 && sucursalActiva !== i) continue;

                    const fila = document.createElement("tr");

                    const tdSucursal = document.createElement("td");
                    tdSucursal.textContent = sucursales[i];
                    tdSucursal.className = "celda-sucursal";
                    fila.appendChild(tdSucursal);

                    for (let j = 0; j < inventario[i].length; j++) {
                        const td = document.createElement("td");
                        const cantidad = inventario[i][j];
                        td.textContent = cantidad;

                        if (cantidad < 10) {
                            td.className = "stock-critico";
                            td.title = "Stock crítico — requiere reposición urgente";
                        } else if (cantidad < 30) {
                            td.className = "stock-medio";
                            td.title = "Stock medio";
                        } else {
                            td.className = "stock-alto";
                            td.title = "Stock alto";
                        }

                        fila.appendChild(td);
                    }

                    const tdTotal = document.createElement("td");
                    tdTotal.textContent = totalFila(inventario[i]);
                    tdTotal.className = "celda-total-fila";
                    fila.appendChild(tdTotal);

                    tbody.appendChild(fila);
                }

                tabla.appendChild(tbody);

                const tfoot = document.createElement("tfoot");
                const filaTotales = document.createElement("tr");

                const tdEtiqueta = document.createElement("td");
                tdEtiqueta.textContent = "TOTAL POR PRODUCTO";
                tdEtiqueta.className = "celda-sucursal";
                filaTotales.appendChild(tdEtiqueta);

                for (let j = 0; j < productosInv.length; j++) {
                    const td = document.createElement("td");
                    td.textContent = sucursalActiva !== -1 ? inventario[sucursalActiva][j] : totalColumna(j);
                    td.className = "celda-total-col";
                    filaTotales.appendChild(td);
                }

                const tdTotalGeneral = document.createElement("td");
                tdTotalGeneral.textContent = sucursalActiva !== -1 ? totalFila(inventario[sucursalActiva]) : totalGeneral();
                tdTotalGeneral.className = "celda-total-general";
                filaTotales.appendChild(tdTotalGeneral);

                tfoot.appendChild(filaTotales);
                tabla.appendChild(tfoot);
            }

            generarFiltros();
            generarMetricas();
            generarTabla();
        }

        /* ============================================================
      PÁGINA — Detalle Producto
      ============================================================ */


        /* ===== BOM: history.back() — propiedades de navegación ===== */
        const btnVolver = document.getElementById('btn-volver');
        if (btnVolver) {
            btnVolver.addEventListener('click', function () {
                history.back();
            });
        }



    });
// ui.js (Web_Editor_Pro)
// MODIFICADO: Importación estricta del lector de estado local para nutrir el componente UI portado
import { getKeys } from './state.js';

// NUEVO: Variables de control de estado encapsuladas para el proceso de traducción por lotes portadas del repositorio secundario
let currentKeyIndex = 0;
let procesoDetenido = false;
let procesoPausado = false;

export const UI = {
    log: (mensaje) => {
        console.log(`[Editor] ${mensaje}`);
        // Si tienes una consola en el editor, puedes apuntar aquí
        
        // NUEVO: Integración defensiva para volcar logs visuales al contenedor de estado nativo del editor si se encuentra presente
        const statusCarga = document.getElementById('status-carga');
        if (statusCarga) {
            statusCarga.innerText = mensaje;
        }

        // NUEVO: Trazabilidad extendida. Soporte defensivo para volcar logs en tiempo real al Monitor del Sistema si existe en el DOM
        const consolaVisual = document.getElementById('consola');
        if (consolaVisual) {
            const div = document.createElement('div');
            div.textContent = mensaje;
            consolaVisual.appendChild(div);
            consolaVisual.scrollTop = consolaVisual.scrollHeight;
        }
    },
    setLoadingState: (buttonId, isLoading, text = "Guardando...") => {
        const btn = document.getElementById(buttonId);
        if (!btn) return;
        btn.disabled = isLoading;
        btn.innerText = isLoading ? text : "Guardar";
    },
    
    // NUEVO: Patrón de renderizado optimizado y enmascaramiento seguro de API Keys portado del repositorio secundario
    actualizarListaKeys: (selectorElemento = '.select-keys') => {
        // Manejo defensivo del DOM: búsqueda adaptativa por clase o identificador alternativo
        const selectEl = document.querySelector(selectorElemento) || document.getElementById('selectKeys');
        if (!selectEl) return;
        
        const keys = getKeys();
        if (keys.length === 0) {
            selectEl.innerHTML = '<option value="">No hay API Keys cargadas</option>';
            selectEl.disabled = true;
            return;
        }

        selectEl.disabled = false;
        selectEl.innerHTML = keys.map((k, i) => {
            // Enmascaramiento seguro para evitar la exposición visual de tokens completos
            const resumida = k.length > 10 ? `${k.substring(0, 6)}...${k.substring(k.length - 4)}` : k;
            return `<option value="${k}">Key ${i + 1}: ${resumida}</option>`;
        }).join('');
    },

    // NUEVO: Inicializador defensivo del entorno "Ajustes solo para expertos" para el intercambio de archivos locales (PC)
    inicializarAjustesExpertos: (stateContainer) => {
        UI.log("[Expertos] Vinculando componentes interactivos del panel avanzado de control...");

        // Registro seguro de eventos de exportación CSV local hacia la PC
        const btnExportar = document.getElementById('btnExportarCsvExpertos') || document.getElementById('saveCsvBtn');
        if (btnExportar) {
            btnExportar.onclick = () => {
                if (stateContainer && stateContainer.headers && stateContainer.csvData) {
                    UI.exportarCSV(stateContainer.headers, stateContainer.csvData);
                } else {
                    UI.log("[Error] El estado del sistema no contiene estructuras válidas de datos para proceder.");
                }
            };
        }

        // Registro seguro de eventos de importación CSV local desde la PC
        const inputImportar = document.getElementById('btnImportarCsvExpertos') || document.getElementById('archivoLocal');
        if (inputImportar) {
            inputImportar.onchange = (e) => {
                const file = e.target.files[0];
                if (file && stateContainer) {
                    UI.importarCSV(file, (headers, data) => {
                        stateContainer.headers = headers;
                        stateContainer.csvData = data;
                        UI.log(`[OK] Archivo cargado en memoria externa. Filas procesadas: ${data.length}`);
                        if (typeof UI.renderTable === 'function') {
                            UI.renderTable();
                        }
                    });
                }
            };
        }

        // Registro seguro de botones de ciclo de vida del motor de automatización asíncrona por lotes
        const btnIniciar = document.getElementById('btnIniciarTraduccionLotes') || document.getElementById('btnIniciar');
        if (btnIniciar) {
            btnIniciar.onclick = () => {
                if (stateContainer) {
                    UI.iniciarTraduccionPorLotes(stateContainer);
                }
            };
        }

        const btnPausa = document.getElementById('btnPausarTraduccionLotes') || document.getElementById('btnPausa');
        if (btnPausa) {
            btnPausa.onclick = () => {
                procesoPausado = !procesoPausado;
                btnPausa.innerText = procesoPausado ? "REANUDAR" : "PAUSAR";
                UI.log(procesoPausado ? "[Info] Ejecución en segundo plano pausada temporalmente." : "[Info] Reanudando procesamiento de traducciones...");
            };
        }

        const btnCancelar = document.getElementById('btnCancelarTraduccionLotes') || document.getElementById('btnCancelar');
        if (btnCancelar) {
            btnCancelar.onclick = () => {
                procesoDetenido = true;
                UI.log("[Info] Enviando señal de interrupción al bucle de peticiones distribuidas...");
            };
        }
    },

    // NUEVO: Compilador de archivos planos CSV estructurado con fallback autónomo para salvaguardar la compatibilidad
    exportarCSV: (headers, csvData) => {
        try {
            let resultadoTexto = "";
            if (window.Papa) {
                resultadoTexto = window.Papa.unparse([headers, ...csvData]);
            } else {
                // Algoritmo recursivo de escape nativo ante ausencia accidental de librerías externas
                resultadoTexto = [headers, ...csvData].map(row => 
                    row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")
                ).join("\n");
            }
            const blob = new Blob([resultadoTexto], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = 'exportacion_expertos_final.csv';
            link.click();
            UI.log("[OK] Operación exitosa: Archivo binario CSV transferido al almacenamiento local del PC.");
        } catch (err) {
            UI.log(`[Error Exportar] Interrupción crítica en la compilación de datos: ${err.message}`);
        }
    },

    // NUEVO: Lector asíncrono y sanitizador de flujo de entrada de texto estructurado Local
    importarCSV: (file, callback) => {
        const lector = new FileReader();
        lector.onload = (e) => {
            const contenidoCrudo = e.target.result;
            try {
                if (window.Papa) {
                    window.Papa.parse(contenidoCrudo, {
                        skipEmptyLines: true,
                        complete: (resultado) => {
                            if (resultado.data && resultado.data.length > 0) {
                                const headers = resultado.data[0];
                                const data = resultado.data.slice(1);
                                callback(headers, data);
                            }
                        }
                    });
                } else {
                    // Fallback nativo de segmentación lineal para aislamiento procedimental autosuficiente
                    const lineas = contenidoCrudo.split(/\r?\n/).filter(line => line.trim() !== "");
                    if (lineas.length > 0) {
                        const headers = lineas[0].split(",").map(h => h.replace(/^"|"$/g, '').trim());
                        const data = lineas.slice(1).map(f => f.split(",").map(v => v.replace(/^"|"$/g, '').trim()));
                        callback(headers, data);
                    }
                }
            } catch (err) {
                UI.log(`[Error Importar] Imposible procesar la estructura tabular provista: ${err.message}`);
            }
        };
        lector.readAsText(file);
    },

    // NUEVO: Motor asíncrono optimizado de traducción masiva por lotes paralelos con rotación inteligente de cuotas
    iniciarTraduccionPorLotes: async (stateContainer) => {
        procesoDetenido = false;
        procesoPausado = false;
        
        const listaClavesAPI = getKeys();
        if (listaClavesAPI.length === 0) {
            return UI.log("[Error] Operación abortada: Introduzca al menos una API Key válida en el almacenamiento local.");
        }

        if (!stateContainer || !stateContainer.headers || !stateContainer.csvData) {
            return UI.log("[Error] La estructura de datos o cabeceras del estado se encuentra corrupta o vacía.");
        }

        // Extracción defensiva del rango de segmentación numérica directamente desde el DOM si existen los nodos
        const selectorInicio = document.getElementById('rangoInicio');
        const selectorFin = document.getElementById('rangoFin');
        const rangoInicio = selectorInicio ? (parseInt(selectorInicio.value) - 2 || 0) : 0;
        const rangoFin = selectorFin ? (parseInt(selectorFin.value) - 1 || stateContainer.csvData.length) : stateContainer.csvData.length;

        const ENDPOINT_GATEWAY = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";
        
        // Mapeo adaptativo automático de columnas lingüísticas regionales basadas en nomenclatura Nombre_
        const columnasIdiomasDestino = stateContainer.headers.map((h, i) => (h.startsWith("Nombre_") && h !== "Nombre_ES") ? i : -1).filter(i => i !== -1);
        const indiceCastellanoBase = stateContainer.headers.indexOf('Nombre_ES');

        if (indiceCastellanoBase === -1) {
            return UI.log("[Error] Estructura incompatible: Falta la columna pivote requerida 'Nombre_ES'.");
        }

        let totalPeticionesExitosas = 0;
        const matrizFilasPendientes = [];
        const techoLimiteEvaluacion = Math.min(rangoFin, stateContainer.csvData.length);

        // Escaneo quirúrgico automatizado para buscar e indexar traducciones huérfanas/vacías
        for (let i = Math.max(0, rangoInicio); i < techoLimiteEvaluacion; i++) {
            const cadenaCastellano = stateContainer.csvData[i][indiceCastellanoBase] || "Sin nombre";
            const indicesColumnasVacias = columnasIdiomasDestino.filter(idx => !stateContainer.csvData[i][idx] || stateContainer.csvData[i][idx].trim() === "");
            
            if (indicesColumnasVacias.length > 0) {
                matrizFilasPendientes.push({
                    indiceMatriz: i,
                    numeroFilaHumana: i + 2,
                    textoES: cadenaCastellano,
                    indicesColumnasFaltantes: indicesColumnasVacias,
                    codigosIdiomas: indicesColumnasVacias.map(idx => stateContainer.headers[idx].replace("Nombre_", ""))
                });
            }
        }

        if (matrizFilasPendientes.length === 0) {
            UI.log("[FIN] Integridad total verificada: No quedan celdas vacías por traducir en el rango seleccionado.");
            return;
        }

        UI.log(`[Info] Auditoría completada. Se detectaron ${matrizFilasPendientes.length} filas incompletas. Agrupando en micro-lotes distribuidos...`);
        const TAMANO_LOTE = 3;

        for (let j = 0; j < matrizFilasPendientes.length; j += TAMANO_LOTE) {
            if (procesoDetenido) break;
            while (procesoPausado) { 
                await new Promise(resolve => setTimeout(resolve, 500)); 
            }

            const loteActual = matrizFilasPendientes.slice(j, j + TAMANO_LOTE);
            const estructuraPromptPayload = loteActual.map(p => ({
                id_fila: p.numeroFilaHumana,
                texto: p.textoES,
                idiomas_requeridos: p.codigosIdiomas
            }));

            const secuenciaImpresionFilas = loteActual.map(p => p.numeroFilaHumana).join(', ');
            UI.log(`[Procesando Lote] Segmento Filas [${secuenciaImpresionFilas}] -> Transmitiendo payload agrupado a la API de Gemini...`);

            let peticionSatisfecha = false;
            while (!peticionSatisfecha && !procesoDetenido) {
                try {
                    const instruccionesEstructuralesIA = `Actúa como un traductor experto de menús de restaurantes. Te paso un array de objetos con textos en español, su id_fila correspondiente y los idiomas ISO a los que debes traducirlos.
                    Datos de entrada: ${JSON.stringify(estructuraPromptPayload)}
                    Responde EXCLUSIVAMENTE con un JSON plano que contenga una propiedad raíz llamada "lote", la cual guardará un array de objetos. Cada objeto debe mantener obligatoriamente su "id_fila" y un objeto "traducciones" con las claves de idioma solicitadas. No inventes filas, no agregues texto explicativo, ni abras bloques de código fuera del JSON.
                    Ejemplo de formato de respuesta esperado:
                    {"lote": [{"id_fila": 8, "traducciones": {"EN": "Children menu", "FR": "Menu enfant"}} ]}`;

                    const callResponse = await fetch(`${ENDPOINT_GATEWAY}?key=${listaClavesAPI[currentKeyIndex]}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contents: [{ parts: [{ text: instruccionesEstructuralesIA }] }] })
                    });

                    const respuestaJsonData = await callResponse.json();
                    
                    // Manejo dinámico inteligente de desbordamiento de cuota de API (Rate Limiting HTTP 429)
                    if (respuestaJsonData.error?.code === 429) {
                        currentKeyIndex = (currentKeyIndex + 1) % listaClavesAPI.length;
                        UI.log(`[Aviso de Red] Límite superado. Rotando balanceo defensivo hacia la Key Índice: ${currentKeyIndex + 1}...`);
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        continue; 
                    }

                    const textoLimpioIA = respuestaJsonData.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (textoLimpioIA) {
                        const jsonSanitizado = textoLimpioIA.replace(/```json/g, '').replace(/```/g, '').trim();
                        const objetoParseadoFinal = JSON.parse(jsonSanitizado);
                        
                        if (objetoParseadoFinal && objetoParseadoFinal.lote) {
                            objetoParseadoFinal.lote.forEach(filaLote => {
                                const objetivoFilaMemoria = loteActual.find(p => p.numeroFilaHumana === parseInt(filaLote.id_fila));
                                if (objetivoFilaMemoria && filaLote.traducciones) {
                                    objetivoFilaMemoria.indicesColumnasFaltantes.forEach(idxCol => {
                                        const codigoIdiomaISO = stateContainer.headers[idxCol].replace("Nombre_", "");
                                        if (filaLote.traducciones[codigoIdiomaISO]) {
                                            // Inyección atómica directa en la estructura bidimensional del estado mutado
                                            stateContainer.csvData[objetivoFilaMemoria.indiceMatriz][idxCol] = filaLote.traducciones[codigoIdiomaISO].replace(/[\(\)""'']/g, '');
                                        }
                                    });
                                }
                            });

                            UI.log(`[OK Lote] Bloque de filas [${secuenciaImpresionFilas}] inyectado exitosamente en caliente.`);
                            totalPeticionesExitosas++; 
                            peticionSatisfecha = true;
                        } else {
                            throw new Error("La firma del JSON no contiene el nodo raíz de encapsulación 'lote'.");
                        }
                    }
                } catch (errorCapturado) {
                    UI.log(`[Error Lote] Fallo en la resolución del segmento [${secuenciaImpresionFilas}]: ${errorCapturado.message}. Reintentando en 3000ms...`);
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    if (errorCapturado.message.includes("Unexpected token") || errorCapturado.message.includes("API key")) {
                        break;
                    }
                }
            }
            // Retardo prudencial de mitigación anti-bloqueo antes de liberar el siguiente hilo del lote
            await new Promise(resolve => setTimeout(resolve, 2500)); 
            if (typeof UI.renderTable === 'function') {
                UI.renderTable();
            }
        }

        if (procesoDetenido) {
            UI.log(`[FIN] Ejecución abortada manualmente por demanda explícita del usuario. Peticiones consumidas: ${totalPeticionesExitosas}`);
        } else {
            UI.log(`----------------------------------------------------------------------`);
            UI.log(`[FIN] ¡Flujo masivo completado! Base de datos de traducciones al día.`);
            UI.log(`[Estadísticas] Peticiones de red totales consumidas en Gemini: ${totalPeticionesExitosas}`);
            UI.log(`----------------------------------------------------------------------`);
        }
    }
};

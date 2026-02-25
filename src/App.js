import { auth, db } from "./firebase.js";
import { 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { 
  collection, 
  getDocs 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const tablaBody = document.querySelector("#tablaRegistros tbody");
const bienvenida = document.getElementById("bienvenida");
const logoutBtn = document.getElementById("logout");
const filtroFecha = document.getElementById("filtroFecha");
const filtroProfesor = document.getElementById("filtroProfesor");
const btnFiltrar = document.getElementById("btnFiltrar");
const btnReset = document.getElementById("btnReset");
const btnExportar = document.getElementById("btnExportar");
const totalRegistros = document.getElementById("totalRegistros");
const estadisticasProfesores = document.getElementById("estadisticasProfesores");
const totalProfesores = document.getElementById("totalProfesores");

let todosLosRegistros = [];

// Cerrar sesión
logoutBtn.onclick = () => {
  signOut(auth);
  window.location.href = "index.html";
};

// Verificar sesión
onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  bienvenida.textContent = `Bienvenido ${user.displayName}`;

  const snapshot = await getDocs(collection(db, "registros"));
  todosLosRegistros = snapshot.docs.map(doc => doc.data());

  mostrarRegistros(todosLosRegistros);

});

// Mostrar registros
function generarEstadisticas(registros) {

  totalRegistros.textContent = registros.length;

  const conteo = {};

  registros.forEach(reg => {
    conteo[reg.nombre] = (conteo[reg.nombre] || 0) + 1;
  });

  totalProfesores.textContent = Object.keys(conteo).length;
}
 {
generarEstadisticas(todosLosRegistros);
generarEstadisticas(filtrados);

  tablaBody.innerHTML = "";

  registros.forEach(data => {

    const fila = `
      <tr>
        <td>${data.fecha}</td>
        <td>${data.nombre}</td>
        <td>${data.materia}</td>
        <td>${data.grado}</td>
        <td>${data.contenido}</td>
      </tr>
    `;

    tablaBody.innerHTML += fila;

  });

}
function generarEstadisticas(registros) {

  totalRegistros.textContent = `Total registros: ${registros.length}`;

  const conteo = {};

  registros.forEach(reg => {
    conteo[reg.nombre] = (conteo[reg.nombre] || 0) + 1;
  });

  estadisticasProfesores.innerHTML = "";

  for (let profesor in conteo) {
    estadisticasProfesores.innerHTML += 
      `<li>${profesor}: ${conteo[profesor]} registros</li>`;
  }
}

// Filtrar
btnFiltrar.onclick = () => {

  const fecha = filtroFecha.value;
  const profesor = filtroProfesor.value.toLowerCase();

  const filtrados = todosLosRegistros.filter(reg => {

    const coincideFecha = fecha ? reg.fecha === fecha : true;
    const coincideProfesor = profesor ? reg.nombre.toLowerCase().includes(profesor) : true;

    return coincideFecha && coincideProfesor;

  });

  mostrarRegistros(filtrados);

};

// Reset filtros
btnReset.onclick = () => {
  filtroFecha.value = "";
  filtroProfesor.value = "";
  mostrarRegistros(todosLosRegistros);
};
// Exportar a CSV (Excel)
btnExportar.onclick = () => {

  if (todosLosRegistros.length === 0) {
    alert("No hay registros para exportar");
    return;
  }

  let csv = "Fecha,Profesor,Materia,Grado,Contenido\n";

  todosLosRegistros.forEach(reg => {
    csv += `${reg.fecha},${reg.nombre},${reg.materia},${reg.grado},"${reg.contenido}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "registros_docentes.csv";
  a.click();

  window.URL.revokeObjectURL(url);
};

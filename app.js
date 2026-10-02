/* Endpoint de envío del informe por Brevo. Se activa después de configurar el backend en Vercel. */
const SCRIPT_URL = "https://ceo-por-un-dia-api.vercel.app/api/send-report";
const companies={
campo:{name:"Envases Plast “Campo Grande”",icon:"🏭",type:"Empresa industrial",intro:"Fabricación de envases para clientes de la región."},
misionero:{name:"Yerba Mate “El Misionero”",icon:"🌿",type:"PYME agroindustrial",intro:"Producción y comercialización de yerba mate."},
logistica:{name:"Servicios Logísticos del Norte",icon:"🚚",type:"Empresa de transporte y servicios",intro:"Transporte y servicios logísticos para empresas de la región."}
};
const decisions=[
{title:"Aumento de los insumos",text:"El costo de los principales insumos aumentó un 30% por inflación y suba de combustibles. ¿Qué medida estratégica tomás?",options:[
{title:"A. Trasladar el 30% al precio final",desc:"Protegés el margen por unidad, pero aumenta la presión sobre los clientes.",delta:[10,-10,0,0,5],cons:"La empresa conserva mejor su margen por unidad, pero los clientes reciben el aumento y aparece una presión comercial mayor."},
{title:"B. Mantener el precio y reingenierizar costos",desc:"Cuidás la competitividad y buscás reducir costos en los procesos.",delta:[-8,8,-4,2,3],cons:"Conservás competitividad y relación con clientes, pero el margen queda tensionado y la operación debe volverse más eficiente."}
]},
{title:"El efecto dominó",text:"La decisión anterior produjo un nuevo desafío. ¿Dónde concentrás la siguiente respuesta?",options:[
{title:"A. Fortalecer marketing y fidelización",desc:"Destinás recursos a sostener la relación con clientes.",delta:[-5,8,0,3,1],cons:"Fortalecés la relación comercial y la fidelización, aunque parte del presupuesto deja de ir a mejoras operativas."},
{title:"B. Ajustar nuevamente precios y costos",desc:"Priorizás recuperar margen y eficiencia.",delta:[5,-7,3,0,5],cons:"Mejorás el resultado financiero, pero aumentás la presión sobre clientes y sobre la capacidad interna de respuesta."}
]},
{title:"Problema operativo",text:"La estructura de costos está presionando a la operación. ¿Qué hacés con el mantenimiento?",options:[
{title:"A. Reducir mantenimiento",desc:"Ahorrás en el corto plazo, aceptando mayor riesgo de fallas.",delta:[6,-2,-12,0,12],cons:"Conseguís ahorro inmediato, pero el tablero muestra una alerta roja en procesos por el riesgo de fallas, calidad y continuidad."},
{title:"B. Recuperar mantenimiento preventivo",desc:"Invertís ahora para proteger continuidad y calidad.",delta:[-6,0,12,2,-8],cons:"Aumentás el gasto actual para proteger la continuidad productiva, reducir riesgos y sostener la calidad."}
]},
{title:"Cliente estratégico",text:"Uno de tus principales clientes pide un descuento del 8% para renovar su contrato anual.",options:[
{title:"A. Aceptar el descuento",desc:"Conservás al cliente y asegurás volumen, pero resignás margen.",delta:[-8,10,0,0,2],cons:"Asegurás volumen y relación comercial, a costa de un margen menor en el contrato."},
{title:"B. Rechazar el descuento",desc:"Protegés el margen aunque existe riesgo de perder volumen.",delta:[8,-7,0,0,3],cons:"Protegés el resultado económico, pero asumís una mayor exposición a perder volumen del cliente."}
]},
{title:"Desafío presupuestario",text:"Tenés 10 unidades presupuestarias para el próximo período. Considerá Producción, Marketing, Capacitación y Administración y aplicá ABC/ABM para eliminar actividades sin valor agregado.",options:[
{title:"A. Priorizar producción y marketing",desc:"Buscás sostener ventas y capacidad productiva.",delta:[2,3,2,-2,1],cons:"Sostenés ventas y capacidad productiva, aunque destinás menos recursos al desarrollo interno."},
{title:"B. Priorizar mantenimiento y capacitación",desc:"Reforzás procesos y desarrollo de la organización.",delta:[-2,1,7,7,-6],cons:"La asignación refuerza mantenimiento y capacitación. En ABC/ABM, podés detectar y eliminar gastos de actividades que no agregan valor."}
]},
{title:"Decisión final",text:"Los indicadores muestran resultados diferentes. ¿Dónde concentrás el último esfuerzo?",options:[
{title:"A. Priorizar rentabilidad",desc:"Buscás mejorar el resultado financiero en el corto plazo.",delta:[8,-2,2,0,4],cons:"Concentrás el último esfuerzo en el resultado económico inmediato, reduciendo la prioridad relativa de clientes y aprendizaje."},
{title:"B. Priorizar clientes y procesos",desc:"Consolidás relaciones comerciales y eficiencia interna.",delta:[1,6,7,3,-5],cons:"Terminás reforzando clientes y procesos internos, con menor exposición al riesgo operativo."}
]}
];
let user={name:"",email:""},company=null,step=0,history=[],s=null,started=false;
const app=document.getElementById("app");
const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const btn=(t,c="")=>'<button class="btn '+c+'">'+t+"</button>";
function reset(){step=0;history=[];s={fin:50,cli:50,proc:50,apr:50,risk:20}}
function meter(n,v){return '<div class="meter"><strong>'+n+'</strong><small>'+Math.round(v)+'/100</small><div class="bar"><i style="width:'+v+'%"></i></div></div>'}
function status(v){return v>=65?"Favorable":v>=45?"Estable":"Crítico"}
function apply(d){s.fin=Math.max(0,Math.min(100,s.fin+d[0]));s.cli=Math.max(0,Math.min(100,s.cli+d[1]));s.proc=Math.max(0,Math.min(100,s.proc+d[2]));s.apr=Math.max(0,Math.min(100,s.apr+d[3]));s.risk=Math.max(0,Math.min(100,s.risk+d[4]))}
function dots(){return '<div class="steps">'+[1,2,3,4,5,6].map(i=>'<div class="stepdot '+(i<step?"done":i===step?"active":"")+'">'+i+"</div>").join("")+"</div>"}
function home(){started=false;reset();app.innerHTML='<section class="hero"><div><div class="eyebrow">Experiencia interactiva · Argentina</div><h1>CEO<br>por un día.</h1><p class="lead">Entrá a la oficina de dirección, enfrentá decisiones de mercado y descubrí cómo tu criterio cambia el rumbo de una empresa regional.</p><div class="actions" id="go">'+btn("Comenzar experiencia →")+'</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:18px"><span class="small" style="border:1px solid var(--line);padding:7px 10px;border-radius:999px">6 decisiones</span><span class="small" style="border:1px solid var(--line);padding:7px 10px;border-radius:999px">4 perspectivas</span><span class="small" style="border:1px solid var(--line);padding:7px 10px;border-radius:999px">1 dictamen final</span></div></div><div class="box"><div class="eyebrow">Tu desafío</div><div class="big">CEO</div><h3 style="margin-top:2px;font-size:24px">La mesa de dirección es tuya.</h3><p class="lead" style="margin-bottom:8px">Cada elección queda registrada y muestra su efecto antes de que puedas continuar.</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:18px"><div style="padding:11px;border:1px dashed var(--line);border-radius:12px"><div class="small">FINANZAS</div><b>Margen</b></div><div style="padding:11px;border:1px dashed var(--line);border-radius:12px"><div class="small">CLIENTES</div><b>Relación</b></div><div style="padding:11px;border:1px dashed var(--line);border-radius:12px"><div class="small">PROCESOS</div><b>Eficiencia</b></div><div style="padding:11px;border:1px dashed var(--line);border-radius:12px"><div class="small">APRENDIZAJE</div><b>Desarrollo</b></div></div><div class="label">Contabilidad · Estrategia · Presupuesto · Costos</div></div></section>';document.getElementById("go").onclick=identity}
function identity(){app.innerHTML='<section class="screen"><div class="head"><div><div class="eyebrow">Paso 0 · Identificación</div><h2>Antes de empezar, registrá tus datos.</h2><p class="lead">El nombre aparece en el dictamen y el Gmail se usa para enviarte el informe final.</p></div></div><div class="box"><div class="formgrid"><div class="field"><label>Nombre y apellido</label><input id="name" maxlength="70" placeholder="Ej.: María García"></div><div class="field"><label>Gmail</label><input id="email" type="email" maxlength="120" placeholder="Ej.: maria@gmail.com"></div></div><div class="hint" style="margin-top:12px;color:var(--muted);font-size:12px">El correo no se muestra públicamente en el tablero.</div><div class="actions"><span id="next">'+btn("Continuar →")+'</span><span id="back">'+btn("Volver","secondary")+'</span></div><div id="msg" class="warn" style="display:none"></div></div></section>';document.getElementById("next").onclick=()=>{const name=document.getElementById("name").value.trim(),email=document.getElementById("email").value.trim().toLowerCase(),msg=document.getElementById("msg");if(name.length<2){msg.textContent="Escribí tu nombre y apellido.";msg.style.display="block";return}if(!/^[^\s@]+@gmail\.com$/i.test(email)){msg.textContent="Usá una dirección de Gmail terminada en @gmail.com.";msg.style.display="block";return}user={name,email};companiesScreen()};document.getElementById("back").onclick=home}
function companiesScreen(){app.innerHTML='<section class="screen"><div class="head"><div><div class="eyebrow">Paso 1 · Elección</div><h2>Elegí la empresa que vas a dirigir.</h2><p class="lead">Tres realidades de negocio. Un mismo desafío: decidir.</p></div><div class="small">CREDENCIAL CEO · <b>'+esc(user.name)+"</b></div></div><div class=\"companies\">"+Object.entries(companies).map(([id,c],idx)=>'<button class="card" data-id="'+id+'"><div style="display:flex;justify-content:space-between;align-items:flex-start"><div class="icon">'+c.icon+'</div><span class="small" style="font-weight:800;letter-spacing:.1em">0'+(idx+1)+'</span></div><h3>'+c.name+'</h3><p>'+c.type+"<br>"+c.intro+'</p><div style="margin-top:18px;border-top:1px dashed var(--line);padding-top:12px;display:flex;justify-content:space-between;align-items:center"><span class="small">DESAFÍO DE GESTIÓN</span><span class="label" style="margin:0">Asumir →</span></div></button>').join("")+"</div></section>";document.querySelectorAll(".card").forEach(x=>x.onclick=()=>selectCompany(x.dataset.id))}
function selectCompany(id){company=companies[id];reset();started=true;intro()}
function intro(){app.innerHTML='<section class="screen"><div class="game"><div class="gamehead"><div><div class="eyebrow">Nueva gestión</div><b>'+company.icon+" "+company.name+'</b></div><span class="label">'+company.type+'</span></div><div class="scenario"><div class="alert">Tu primer día como CEO</div><h3>La empresa necesita una decisión.</h3><p class="lead">Nada avanza solo. Cada pantalla queda detenida hasta que pulses un botón.</p><div class="notice">Los alumnos del stand actúan como equipo asesor y pueden explicar los conceptos de contabilidad gerencial durante la experiencia.</div><div class="actions"><span id="enter">'+btn("Entrar a la empresa →")+'</span><span id="choose">'+btn("Elegir otra empresa","secondary")+"</span></div></div></div></section>";document.getElementById("enter").onclick=()=>{step=1;game()};document.getElementById("choose").onclick=companiesScreen}
function game(){
  const q=decisions[step-1];
  app.innerHTML=`
    <section class="screen">
      <div class="game">
        <div class="gamehead">
          <div><div class="eyebrow">${esc(company.name)}</div><b>Decisión ${step} de 6</b></div>
          <span class="small">CEO: <b>${esc(user.name)}</b></span>
        </div>
        <div class="progress"><i style="width:${((step-1)/6)*100}%"></i></div>
        ${dots()}
        <div class="scenario">
          <div class="alert">Escenario ${step}</div>
          <h3>${q.title}</h3>
          <p class="lead">${q.text}</p>
          <div class="options">
            ${q.options.map((o,i)=>`<button class="option" data-i="${i}"><b>${o.title}</b><span>${o.desc}</span></button>`).join("")}
          </div>
        </div>
        <div class="side">
          <div class="meters">
            ${meter("Finanzas",s.fin)}
            ${meter("Clientes",s.cli)}
            ${meter("Procesos",s.proc)}
            ${meter("Aprendizaje",s.apr)}
          </div>
          <div class="history">
            <div class="eyebrow">Recorrido</div>
            ${history.length
              ? history.map((h,i)=>`<div class="row"><b>Decisión ${i+1}:</b> ${esc(h.title)}</div>`).join("")
              : '<div class="row">Todavía no tomaste decisiones.</div>'}
          </div>
        </div>
      </div>
    </section>`;
  document.querySelectorAll(".option").forEach(x=>x.onclick=()=>{
    const o=q.options[+x.dataset.i];
    apply(o.delta);
    history.push({title:o.title,consequence:o.cons,delta:o.delta.slice()});
    consequenceScreen(step,o);
  });
}
function deltaRow(n,v){const c=v>0?"plus":v<0?"minus":"neutral";return '<div class="delta-row"><span>'+n+'</span><b class="'+c+'">'+(v>0?"+":"")+v+"</b></div>"}
function consequenceScreen(current,o){app.innerHTML='<section class="screen"><div class="game"><div class="gamehead"><div><div class="eyebrow">Consecuencia de la decisión '+current+'</div><b>No avanza automáticamente.</b></div><span class="label">Resultado intermedio</span></div><div class="consequence"><div class="alert">Efecto dominó</div><h2>Elegiste: '+esc(o.title)+'</h2><p class="lead">'+esc(o.cons)+'</p><div class="consequencegrid"><div class="delta"><h4>Qué cambió</h4>'+deltaRow("Finanzas",o.delta[0])+deltaRow("Clientes",o.delta[1])+deltaRow("Procesos",o.delta[2])+deltaRow("Aprendizaje",o.delta[3])+'</div><div class="delta"><h4>Indicadores actuales</h4>'+meter("Finanzas",s.fin)+meter("Clientes",s.cli)+meter("Procesos",s.proc)+meter("Aprendizaje",s.apr)+'</div></div><div class="notice"><b>La pantalla permanece abierta.</b><br>Conversá la decisión con los estudiantes y continuá cuando estés listo/a.</div><div class="actions"><span id="cont">'+btn(current<6?"Continuar al siguiente desafío →":"Ver mi evaluación como CEO →")+"</span></div></div></div></section>";document.getElementById("cont").onclick=()=>current<6?(step=current+1,game()):finish()}
function evaluate(){const v=[s.fin,s.cli,s.proc,s.apr],avg=v.reduce((a,b)=>a+b,0)/4,min=Math.min(...v),max=Math.max(...v),n=["Finanzas","Clientes","Procesos","Aprendizaje"],strong=n[v.indexOf(max)],weak=n[v.indexOf(min)];let profile,desc,strengths,focus;if(avg>=72&&min>=55){profile="CEO equilibrado/a";desc="Buscaste mantener varias áreas de la empresa funcionando sin descuidar de forma marcada ninguna de las cuatro perspectivas.";strengths=["Visión integral","Capacidad de balance","Lectura de efectos cruzados"];focus="Seguir profundizando el análisis de costos y presupuesto para sostener el equilibrio en escenarios más exigentes."}else if(s.proc>=s.fin+8&&s.proc>=s.cli&&s.proc>=s.apr){profile="CEO orientado/a a procesos";desc="Tus decisiones muestran una atención especial a la continuidad operativa, el mantenimiento y la eficiencia interna.";strengths=["Eficiencia operativa","Cuidado de procesos","Prevención de riesgos"];focus="Revisar cómo las decisiones operativas impactan en clientes y margen."}else if(s.cli>=s.fin+8&&s.cli>=s.proc&&s.cli>=s.apr){profile="CEO orientado/a al cliente";desc="Priorizaste la relación comercial y la permanencia de los clientes incluso cuando eso implicó resignar parte del margen.";strengths=["Orientación comercial","Fidelización","Lectura del mercado"];focus="Buscar un mayor equilibrio entre satisfacción del cliente y rentabilidad."}else if(s.apr>=s.fin+8&&s.apr>=s.cli&&s.apr>=s.proc){profile="CEO orientado/a al desarrollo";desc="Tu recorrido dio peso importante a capacitación y construcción de capacidades para el mediano plazo.";strengths=["Visión de largo plazo","Inversión en capacidades","Desarrollo organizacional"];focus="Convertir esa inversión en capacidades en mejoras financieras medibles."}else if(s.fin>=s.cli+8&&s.fin>=s.proc){profile="CEO orientado/a a resultados";desc="Priorizaste con frecuencia la protección del margen y el resultado económico.";strengths=["Foco financiero","Decisión bajo presión","Cuidado del margen"];focus="Incorporar de forma más sistemática los efectos sobre clientes, procesos y aprendizaje."}else{profile="CEO de respuesta estratégica";desc="Tu recorrido combinó decisiones de distinta naturaleza según el problema que apareció en cada etapa.";strengths=["Adaptabilidad","Capacidad de respuesta","Lectura de escenarios"];focus="Seguir desarrollando criterios de priorización cuando varios indicadores se mueven a la vez."}return{avg,profile,desc,strengths,focus,strong,weak,performance:avg>=72?"Resultado integral favorable":avg>=58?"Resultado con fortalezas y áreas de atención":"Resultado con varios indicadores bajo presión"}}
function finish(){const e=evaluate();app.innerHTML='<section class="screen"><div class="game"><div class="gamehead"><div><div class="eyebrow">Paso final</div><b>📜 Dictamen gerencial · '+esc(user.name)+'</b></div><span class="label">Gestión completada</span></div><div class="final"><div class="eyebrow">'+esc(company.name)+'</div><h2>Así terminó tu gestión.</h2><p class="lead">El resultado se construyó a partir de las seis decisiones tomadas durante el recorrido.</p><div class="finalgrid">'+["Finanzas","Clientes","Procesos internos","Aprendizaje"].map((x,i)=>'<div class="finalbox"><b>'+x+'</b><div class="score">'+Math.round([s.fin,s.cli,s.proc,s.apr][i])+'</div><div class="status">'+status([s.fin,s.cli,s.proc,s.apr][i])+'</div></div>').join("")+'</div><div class="profile"><div class="eyebrow">Tu evaluación como CEO</div><h3>'+esc(e.profile)+'</h3><p class="lead" style="margin:0">'+esc(e.desc)+'</p><div class="profilegrid"><div><b>Fortalezas observadas</b><ul class="list">'+e.strengths.map(x=>"<li>"+esc(x)+"</li>").join("")+'</ul></div><div><b>Aspecto para seguir desarrollando</b><p class="status" style="font-size:14px;line-height:1.65">'+esc(e.focus)+'</p></div></div><div class="notice"><b>'+esc(e.performance)+'</b><br>Indicador más alto: '+esc(e.strong)+' · Indicador que requiere más atención: '+esc(e.weak)+' · Promedio: '+Math.round(e.avg)+'/100.</div></div><h3 style="margin-top:28px">Tu recorrido</h3><div class="history">'+history.map((h,i)=>'<div class="row"><b>'+(i+1)+". "+esc(h.title)+'</b><br><span class="small">'+esc(h.consequence)+'</span></div>').join("")+'</div><div class="actions"><span id="pdf">'+btn("Generar CV gerencial en PDF")+'</span><span id="send">'+btn("Enviar el informe a mi Gmail","secondary")+'</span><span id="again">'+btn("Nueva simulación","ghost")+'</span></div><div id="emailStatus" class="email-status"></div></div></div></section>';document.getElementById("pdf").onclick=()=>downloadPdf(e);document.getElementById("send").onclick=()=>sendReport(e);document.getElementById("again").onclick=()=>{started=false;identity()}}
function buildPdf(e){if(!window.jspdf)throw new Error("No se pudo cargar el generador PDF.");const{jsPDF}=window.jspdf,doc=new jsPDF({unit:"pt",format:"a4"}),W=doc.internal.pageSize.getWidth(),L=48,R=48,MW=W-L-R;let y=58;doc.setFont("helvetica","bold");doc.setFontSize(22);doc.text("CEO POR UN DÍA",L,y);y+=24;doc.setFont("helvetica","normal");doc.setFontSize(11);doc.text("CV GERENCIAL · Perfil basado en las decisiones de la simulación",L,y);y+=23;doc.line(L,y,W-R,y);y+=23;doc.setFont("helvetica","bold");doc.setFontSize(15);doc.text(user.name,L,y);y+=18;doc.setFont("helvetica","normal");doc.setFontSize(11);doc.text(company.name,L,y);y+=15;doc.text("Correo: "+user.email,L,y);y+=23;doc.setFont("helvetica","bold");doc.setFontSize(16);doc.text("Perfil de gestión",L,y);y+=21;doc.setFontSize(13);doc.text(e.profile,L,y);y+=18;doc.setFont("helvetica","normal");doc.setFontSize(11);let lines=doc.splitTextToSize(e.desc,MW);doc.text(lines,L,y);y+=lines.length*14+15;doc.setFont("helvetica","bold");doc.setFontSize(14);doc.text("Indicadores finales",L,y);y+=19;[["Finanzas",s.fin],["Clientes",s.cli],["Procesos internos",s.proc],["Aprendizaje",s.apr]].forEach(([n,v])=>{doc.setFont("helvetica","normal");doc.setFontSize(11);doc.text(n+": "+Math.round(v)+"/100 · "+status(v),L,y);y+=15});y+=10;doc.setFont("helvetica","bold");doc.setFontSize(14);doc.text("Fortalezas observadas",L,y);y+=18;doc.setFont("helvetica","normal");e.strengths.forEach(x=>{doc.text("• "+x,L,y);y+=15});y+=6;doc.setFont("helvetica","bold");doc.text("Aspecto para seguir desarrollando",L,y);y+=17;doc.setFont("helvetica","normal");lines=doc.splitTextToSize(e.focus,MW);doc.text(lines,L,y);y+=lines.length*14+17;if(y>690){doc.addPage();y=58}doc.setFont("helvetica","bold");doc.setFontSize(14);doc.text("Dictamen gerencial",L,y);y+=19;doc.setFont("helvetica","normal");doc.setFontSize(11);lines=doc.splitTextToSize(e.performance+". Indicador más alto: "+e.strong+". Indicador que requiere más atención: "+e.weak+". Promedio: "+Math.round(e.avg)+"/100.",MW);doc.text(lines,L,y);y+=lines.length*14+17;doc.setFont("helvetica","bold");doc.setFontSize(14);doc.text("Decisiones tomadas",L,y);y+=19;doc.setFont("helvetica","normal");doc.setFontSize(10);history.forEach((h,i)=>{lines=doc.splitTextToSize((i+1)+". "+h.title+" — "+h.consequence,MW);if(y>735){doc.addPage();y=58}doc.text(lines,L,y);y+=lines.length*13+8});doc.setTextColor(105);doc.setFontSize(9);doc.text("CEO por un Día · Proyecto de exposición contable",L,806);return doc}
function downloadPdf(e){const el=document.getElementById("emailStatus");try{buildPdf(e).save("CV_CEO_"+user.name.replace(/\s+/g,"_")+".pdf");el.textContent="PDF generado correctamente."}catch(err){el.textContent="No se pudo generar el PDF."}}
async function sendReport(e){
  const el=document.getElementById("emailStatus");
  if(!SCRIPT_URL || SCRIPT_URL==="PENDIENTE_VERCEL"){
    el.textContent="El envío quedará activo cuando terminemos de conectar el backend.";
    return;
  }
  const sendButton=document.getElementById("send");
  try{
    sendButton.style.pointerEvents="none";
    sendButton.style.opacity=".65";
    el.textContent="Preparando tu CV gerencial y enviándolo a "+user.email+"…";
    const dataUri=buildPdf(e).output("datauristring");
    const base64=dataUri.split(",")[1];
    const response=await fetch(SCRIPT_URL,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        email:user.email,
        name:user.name,
        company:company.name,
        profile:e.profile,
        pdfBase64:base64,
        filename:"CV_CEO_"+user.name.replace(/\s+/g,"_")+".pdf"
      })
    });
    let result={};
    try{result=await response.json()}catch(_){}
    if(!response.ok || !result.ok){
      throw new Error(result.error||"El servicio de correo rechazó el envío.");
    }
    el.textContent="¡Listo! Enviamos tu CV gerencial a "+user.email+". Revisá Spam/Promociones si no aparece enseguida.";
  }catch(err){
    el.textContent="No se pudo enviar el informe: "+err.message;
  }finally{
    sendButton.style.pointerEvents="";
    sendButton.style.opacity="";
  }
}
window.addEventListener("beforeunload",e=>{if(started){e.preventDefault();e.returnValue=""}});
home();
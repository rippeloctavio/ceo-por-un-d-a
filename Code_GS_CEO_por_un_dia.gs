/**
 * CEO por un Día — Google Apps Script
 * Publicar como Aplicación web y usar la URL /exec en SCRIPT_URL del index.html.
 */
function doPost(e){
  try{
    const p=e&&e.parameter?e.parameter:{};
    const email=(p.email||"").trim().toLowerCase();
    const name=(p.name||"Participante").trim();
    const company=(p.company||"Empresa").trim();
    const profile=(p.profile||"Perfil de gestión").trim();
    const filename=(p.filename||"CV_CEO.pdf").trim();
    const pdfBase64=(p.pdfBase64||"").trim();

    if(!/^[^\s@]+@gmail\.com$/i.test(email)) return HtmlService.createHtmlOutput("Correo inválido.");
    if(!pdfBase64) return HtmlService.createHtmlOutput("No se recibió el PDF.");
    if(pdfBase64.length>900000) return HtmlService.createHtmlOutput("El PDF es demasiado grande.");

    const blob=Utilities.newBlob(Utilities.base64Decode(pdfBase64),"application/pdf",filename);
    MailApp.sendEmail({
      to:email,
      subject:"CEO por un Día — Tu CV gerencial",
      body:"Hola "+name+",\n\nGracias por participar de \"CEO por un Día\".\n\nEmpresa dirigida: "+company+"\nPerfil: "+profile+"\n\nAdjunto encontrás tu CV gerencial generado a partir de las decisiones tomadas durante la simulación.\n\nProyecto de exposición contable — 3.º año de Tecnicatura Contable.",
      attachments:[blob],
      name:"CEO por un Día"
    });
    return HtmlService.createHtmlOutput("OK");
  }catch(err){
    return HtmlService.createHtmlOutput("ERROR: "+err.message);
  }
}
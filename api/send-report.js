const nodemailer = require("nodemailer");

module.exports = async function handler(req, res) {
  const allowedOrigin = "https://rippeloctavio.github.io";

  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Método no permitido." });
  }

  const origin = req.headers.origin;
  if (origin && origin !== allowedOrigin) {
    return res.status(403).json({ ok: false, error: "Origen no autorizado." });
  }

  const smtpUser = process.env.BREVO_SMTP_USER;
  const smtpPass = process.env.BREVO_SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    return res.status(500).json({
      ok: false,
      error: "Faltan BREVO_SMTP_USER y BREVO_SMTP_PASS en Vercel."
    });
  }

  try {
    const body = req.body || {};
    const email = String(body.email || "").trim().toLowerCase();
    const name = String(body.name || "").trim();
    const company = String(body.company || "").trim();
    const profile = String(body.profile || "").trim();
    const pdfBase64 = String(body.pdfBase64 || "").replace(/^data:application\/pdf;base64,/, "");
    const filename = String(body.filename || "CV_CEO_por_un_dia.pdf").trim();

    if (!/^\S+@gmail\.com$/i.test(email)) {
      return res.status(400).json({ ok: false, error: "La dirección debe ser un Gmail válido." });
    }

    if (!name || !company || !profile || !pdfBase64) {
      return res.status(400).json({ ok: false, error: "Faltan datos para enviar el informe." });
    }

    if (pdfBase64.length > 5500000) {
      return res.status(413).json({ ok: false, error: "El PDF es demasiado grande para enviarlo." });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    await transporter.sendMail({
      from: '"CEO por un día" <ceoporundia@gmail.com>',
      to: email,
      replyTo: "ceoporundia@gmail.com",
      subject: "CEO por un Día — Tu CV gerencial",
      html:
        "<!doctype html><html><body style=\"font-family:Arial,sans-serif;line-height:1.6;color:#26352b\">" +
        "<h2>Tu experiencia como CEO por un día</h2>" +
        "<p>Hola <strong>" + escapeHtml(name) + "</strong>:</p>" +
        "<p>Terminaste la simulación de <strong>CEO por un Día</strong>.</p>" +
        "<p><strong>Empresa:</strong> " + escapeHtml(company) + "<br>" +
        "<strong>Perfil:</strong> " + escapeHtml(profile) + "</p>" +
        "<p>Adjuntamos tu <strong>CV gerencial</strong> con el resultado de tu recorrido.</p>" +
        "<p>¡Gracias por participar!</p>" +
        "</body></html>",
      attachments: [
        {
          filename,
          content: Buffer.from(pdfBase64, "base64"),
          contentType: "application/pdf"
        }
      ]
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Brevo SMTP error:", error);
    return res.status(502).json({
      ok: false,
      error: "Brevo SMTP rechazó el envío o la autenticación."
    });
  }
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, function (char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char];
  });
}

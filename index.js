const express = require("express");

async function startServer() {
  // Cargar lowdb y abrir o crear la base de datos
  const { JSONFilePreset } = await import("lowdb/node");
  const db = await JSONFilePreset("db.json", { sentences: [] });

  const app = express();

  // Permitir que el servidor reciba datos JSON
  app.use(express.json());

  // Mostrar los archivos de la página
  app.use(express.static("public"));

  // Enviar las frases guardadas al navegador
  app.get("/story", (request, response) => {
    response.json(db.data);
  });

  // Recibir y guardar una nueva frase
  app.post("/new-sentence", async (request, response) => {
    const sentence = request.body?.sentence;

    if (typeof sentence !== "string" || !sentence.trim()) {
      return response.status(400).json({
        error: "Please write a sentence."
      });
    }

    if (sentence.trim().length > 500) {
      return response.status(400).json({
        error: "Please use 500 characters or fewer."
      });
    }

    db.data.sentences.push(sentence.trim());
    await db.write();

    response.status(201).json(db.data);
  });

  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer().catch(console.error);
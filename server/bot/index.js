import "dotenv/config";
import express from "express";
import { telegramHttpsAgent, fetchRetry } from "./net.js";
import { Bot } from "grammy";

const token = process.env.BOT_TOKEN;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;
const appUrl = process.env.APP_URL;

console.log("Environment variables:");
console.log("BOT_TOKEN:", token ? "SET (hidden)" : "MISSING");
console.log("SUPABASE_URL:", supabaseUrl);
console.log("SUPABASE_KEY:", supabaseKey ? "SET (hidden)" : "MISSING");
console.log("APP_URL:", appUrl);

if (!token || !supabaseUrl || !supabaseKey) {
  console.error("Заполни BOT_TOKEN, SUPABASE_URL и SUPABASE_KEY в server/.env");
  process.exit(1);
}

console.log("Initializing bot...");
const bot = new Bot(token, {
  client: { baseFetchConfig: { agent: telegramHttpsAgent } },
});
await bot.init();
console.log("Bot initialized successfully");

async function consumeLinkToken({ linkToken, telegramId, telegramUsername }) {
  const res = await fetchRetry(
    `${supabaseUrl}/rest/v1/rpc/consume_link_token`,
    {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_token: linkToken,
        p_telegram_id: telegramId,
        p_telegram_username: telegramUsername,
      }),
    },
  );
  if (!res.ok) return false;
  return res.json();
}

async function wantsNotification(telegramId, column) {
  try {
    const res = await fetchRetry(
      `${supabaseUrl}/rest/v1/profiles?telegram_id=eq.${telegramId}&select=${column}`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      },
    );
    if (!res.ok) return true;
    const rows = await res.json();
    return rows[0]?.[column] !== false;
  } catch {
    return true;
  }
}

function trackBotUser(from) {
  fetchRetry(`${supabaseUrl}/rest/v1/rpc/track_bot_user`, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      p_telegram_id: from.id,
      p_username: from.username ?? null,
      p_first_name: from.first_name ?? null,
    }),
  }).catch((err) => console.error("track_bot_user:", err));
}

bot.use(async (ctx, next) => {
  if (ctx.from) trackBotUser(ctx.from);
  await next();
});

async function sendLoginLink(ctx) {
  try {
    if (!appUrl) {
      await ctx.reply(
        "Вход через Telegram пока не настроен (нет APP_URL на сервере).",
      );
      return;
    }
    const emailRes = await fetchRetry(
      `${supabaseUrl}/rest/v1/rpc/get_login_email`,
      {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ p_telegram_id: ctx.from.id }),
      },
    );
    const email = emailRes.ok ? await emailRes.json() : null;
    if (!email) {
      await ctx.reply(
        "Этот Telegram не привязан ни к одному аккаунту SubManager.\\n\\nСначала привяжи: приложение → Профиль → «Привязать Telegram».",
      );
      return;
    }
    const linkRes = await fetchRetry(
      `${supabaseUrl}/auth/v1/admin/generate_link`,
      {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "magiclink",
          email,
          options: { redirectTo: appUrl },
        }),
      },
    );
    const data = await linkRes.json().catch(() => null);
    const actionLink = data?.properties?.action_link || data?.action_link;
    if (!linkRes.ok || !actionLink) {
      console.error("generate_link:", linkRes.status, data);
      await ctx.reply(
        "Не получилось создать ссылку для входа. Попробуй позже.",
      );
      return;
    }
    await ctx.reply(
      "Жми кнопку — откроется SubManager, и ты сразу окажешься внутри. Ссылка одноразовая и живёт недолго.",
      {
        reply_markup: {
          inline_keyboard: [[{ text: "Открыть SubManager", url: actionLink }]],
        },
      },
    );
  } catch (err) {
    console.error(err);
    await ctx.reply("Что-то пошло не так. Попробуй ещё раз чуть позже.");
  }
}

bot.command("login", async (ctx) => {
  console.log(
    "Command /login received from:",
    ctx.from?.id,
    ctx.from?.username,
  );
  try {
    await sendLoginLink(ctx);
  } catch (err) {
    console.error("Error in /login:", err);
  }
});

bot.command("start", async (ctx) => {
  console.log(
    "Command /start received from:",
    ctx.from?.id,
    ctx.from?.username,
  );
  const payload = ctx.match?.trim();
  console.log("PAYLOAD:", JSON.stringify(payload));
  if (!payload) {
    const text = [
      "👋 Привет! Это SubManager — все твои подписки в одном месте.",
      "",
      "Что он умеет:",
      "• 💳 считает, сколько уходит на подписки в месяц и в год;",
      "• ⏰ напоминает здесь о предстоящих списаниях и просрочках;",
      "• 💸 делит оплату с друзьями: каждый видит свою долю, а я напомню о переводе;",
      "• 📅 показывает календарь списаний и аналитику по категориям;",
      "📱 устанавливается на экран «Домой» и работает даже без интернета.",
      "",
      "Войти в приложение без пароля — команда /login.",
    ].join("\n");
    try {
      await ctx.reply(text, {
        reply_markup: appUrl
          ? {
              inline_keyboard: [
                [{ text: "Открыть SubManager", web_app: { url: appUrl } }],
              ],
            }
          : undefined,
      });
      console.log("Start message sent successfully");
    } catch (err) {
      console.error("Error sending start message:", err);
    }
    return;
  }
  if (payload === "login") {
    await sendLoginLink(ctx);
    return;
  }
  try {
    const ok = await consumeLinkToken({
      linkToken: payload,
      telegramId: ctx.from.id,
      telegramUsername: ctx.from.username ?? null,
    });
    if (ok) {
      await ctx.reply(
        "Telegram привязан ✅\n\nВернись в SubManager — там уже всё обновилось. Теперь я смогу напоминать о списаниях и переводах друзей.",
      );
    } else {
      await ctx.reply(
        "Эта ссылка недействительна или уже истекла.\n\nСгенерируй новую: SubManager → Профиль → «Привязать Telegram».",
      );
    }
  } catch (err) {
    console.error(err);
    await ctx.reply("Что-то пошло не так. Попробуй ещё раз чуть позже.");
  }
});

bot.callbackQuery(/^pay:(.+)$/, async (ctx) => {
  console.log(
    "Callback query pay received from:",
    ctx.from?.id,
    ctx.from?.username,
  );
  const splitId = ctx.match[1];
  try {
    const res = await fetchRetry(
      `${supabaseUrl}/rest/v1/rpc/pay_split_by_debtor`,
      {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          p_split_id: splitId,
          p_telegram_id: ctx.from.id,
        }),
      },
    );
    const rows = res.ok ? await res.json() : [];
    const row = rows[0];
    if (!row || row.result === "not_found") {
      await ctx.answerCallbackQuery("Доля не найдена");
      return;
    }
    if (row.result === "not_yours") {
      await ctx.answerCallbackQuery("Эта кнопка не для тебя");
      return;
    }
    if (row.result === "already_paid") {
      await ctx.answerCallbackQuery("Уже отмечено оплаченным");
      return;
    }
    const notifyOwner = row.owner_telegram_id
      ? await wantsNotification(
          row.owner_telegram_id,
          "notify_payments_received",
        )
      : false;
    await ctx.answerCallbackQuery(
      notifyOwner ? "Принято! Владельцу улетело уведомление ✅" : "Принято! ✅",
    );
    const keyboard =
      ctx.callbackQuery.message?.reply_markup?.inline_keyboard ?? [];
    const remaining = keyboard.filter(
      (btnRow) => !btnRow.some((b) => b.callback_data === `pay:${splitId}`),
    );
    await ctx.editMessageReplyMarkup({
      reply_markup: { inline_keyboard: remaining },
    });
    if (notifyOwner) {
      const n = Number(row.amount);
      const value = Number.isInteger(n) ? String(n) : n.toFixed(2);
      const sum = `${value} ${row.currency === "RUB" ? "₽" : row.currency}`;
      await ctx.api.sendMessage(
        row.owner_telegram_id,
        `💰 @${row.debtor_username} перевёл(а) ${sum} за «${row.subscription_title}». Split закрыт.`,
      );
    }
  } catch (err) {
    console.error(err);
    await ctx.answerCallbackQuery("Ошибка, попробуй позже");
  }
});

bot.catch((err) => {
  console.error("Bot error:", err);
  if (err.error_code === 403) {
    console.error("Bot was blocked by user or not started");
  } else if (err.error_code === 401) {
    console.error("Invalid bot token");
  } else if (err.error_code === 429) {
    console.error("Telegram API rate limit exceeded");
  }
});

// Express app for webhook
const app = express();
app.use(express.json());

const corsHeaders = (res) => {
  res.set("Access-Control-Allow-Origin", (appUrl || "*").replace(/\/+$/, ""));
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
};

app.options("/api/remind", (req, res) => {
  corsHeaders(res);
  res.sendStatus(204);
});

app.post("/api/remind", async (req, res) => {
  corsHeaders(res);
  try {
    const userToken = req.headers.authorization?.replace("Bearer ", "");
    if (!userToken) return res.status(401).json({ error: "no_token" });

    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${userToken}` },
    });
    if (!userRes.ok) return res.status(401).json({ error: "bad_token" });
    const user = await userRes.json();

    const splitRes = await fetch(
      `${supabaseUrl}/rest/v1/splits?id=eq.${req.body.split_id}&select=*`,
      {
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
      },
    );
    const split = (await splitRes.json())?.[0];
    if (!split) return res.status(404).json({ error: "split_not_found" });

    const subRes = await fetch(
      `${supabaseUrl}/rest/v1/subscriptions?id=eq.${split.subscription_id}&select=user_id,title`,
      {
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
      },
    );
    const sub = (await subRes.json())?.[0];
    if (!sub || sub.user_id !== user.id)
      return res.status(403).json({ error: "not_yours" });

    if (
      split.last_reminded_at &&
      Date.now() - new Date(split.last_reminded_at).getTime() <
        4 * 60 * 60 * 1000
    ) {
      return res.status(429).json({ error: "too_often" });
    }

    const debtorRes = await fetch(
      `${supabaseUrl}/rest/v1/profiles?telegram_username=eq.${encodeURIComponent(split.debtor_username.replace(/^@/, ""))}&select=telegram_id`,
      {
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
      },
    );
    const debtor = (await debtorRes.json())?.[0];
    if (!debtor?.telegram_id)
      return res.status(404).json({ error: "debtor_no_telegram" });

    const ownerRes = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}&select=telegram_username,name`,
      {
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
      },
    );
    const owner = (await ownerRes.json())?.[0];
    const ownerLabel = owner?.telegram_username
      ? `@${owner.telegram_username}`
      : owner?.name || "Друг";

    await bot.api.sendMessage(
      debtor.telegram_id,
      `💸 ${ownerLabel} напоминает о доле: ${split.amount} ₽ за «${sub.title}». Закинь, когда будет минутка.`,
    );

    await fetch(`${supabaseUrl}/rest/v1/splits?id=eq.${split.id}`, {
      method: "PATCH",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ last_reminded_at: new Date().toISOString() }),
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("remind:", err);
    res.status(500).json({ error: "server_error" });
  }
});

app.post("/webhook", async (req, res) => {
  try {
    await bot.handleUpdate(req.body);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error handling update:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.json({ status: "SubManager bot is running" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Webhook server listening on port ${port}`);

  // Set up webhook if RENDER_EXTERNAL_URL is available
  const renderUrl = process.env.RENDER_EXTERNAL_URL;
  if (renderUrl) {
    // Remove https:// if it exists, then add it back properly
    const cleanUrl = renderUrl.replace(/^https?:\/\//, "");
    const webhookUrl = `https://${cleanUrl}/webhook`;
    console.log("Setting up webhook:", webhookUrl);
    bot.api
      .setWebhook(webhookUrl)
      .then(() => console.log("Webhook set successfully"))
      .catch((err) => console.error("Failed to set webhook:", err));
  }
});

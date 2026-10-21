import { notFound } from "next/navigation";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/db";
import { integrations } from "@/lib/integrations";
import { AdminCard, Badge } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { testTelegramAction } from "../../actions";
import { formatDateTime } from "@/lib/format";
import { STATUS_TONE } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getDictionary(locale);
  const l = (ru: string, kz: string) => (locale === "kz" ? kz : ru);

  const logs = await prisma.integrationLog.findMany({ orderBy: { createdAt: "desc" }, take: 25 });
  const errorCount = await prisma.integrationLog.count({ where: { status: "error" } });

  const channels = [
    {
      key: "telegram",
      title: "Telegram Bot",
      on: integrations.telegram,
      hint: t.admin.telegramHint,
      vars: "TELEGRAM_BOT_TOKEN · TELEGRAM_CHAT_ID · TELEGRAM_WEBHOOK_SECRET",
    },
    {
      key: "whatsapp",
      title: "WhatsApp",
      on: integrations.whatsapp,
      hint: t.admin.waHint,
      vars: "ссылка wa.me (без ключей)",
    },
    {
      key: "crm",
      title: "CRM webhook",
      on: integrations.crm,
      hint: t.admin.crmHint,
      vars: "CRM_WEBHOOK_URL · CRM_WEBHOOK_SECRET",
    },
    {
      key: "email",
      title: "Email (SMTP)",
      on: integrations.email,
      hint: l(
        "Уведомление администратору на ADMIN_EMAIL. Клиенту письмо не отправляется: форма не собирает email.",
        "Әкімшіге ADMIN_EMAIL-ға хабарлама. Клиентке хат жіберілмейді: форма email жинамайды.",
      ),
      vars: "SMTP_HOST · SMTP_PORT · SMTP_USER · SMTP_PASS · ADMIN_EMAIL",
    },
    {
      key: "ai",
      title: "AI-консультант",
      on: integrations.ai,
      hint: t.admin.aiHint,
      vars: "AI_API_KEY · AI_BASE_URL · AI_MODEL · AI_DAILY_MESSAGE_LIMIT",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display-m text-[1.5rem]">{t.admin.integrations}</h1>
        <p className="mt-1 max-w-[52rem] text-[0.8rem] leading-relaxed text-[var(--color-faint)]">
          {l(
            "Ключи хранятся только в переменных окружения сервера и никогда не попадают в клиентский код. Если канал не настроен, заявка всё равно сохраняется в базе.",
            "Кілттер тек сервердің орта айнымалыларында сақталады және клиент кодына ешқашан түспейді. Арна конфигурацияланбаса, өтінім бәрібір дерекқорда сақталады.",
          )}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {channels.map((channel) => (
          <div key={channel.key} className="rounded-[10px] border border-[var(--color-line)] bg-[rgba(255,255,255,0.02)] p-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-[0.9rem] font-semibold">{channel.title}</h2>
              <Badge tone={channel.on ? STATUS_TONE.scheduled : STATUS_TONE.spam}>
                {channel.on ? t.admin.configured : t.admin.notConfigured}
              </Badge>
            </div>
            <p className="mt-2 text-[0.75rem] leading-relaxed text-[var(--color-muted)]">{channel.hint}</p>
            <p className="mt-2 break-all rounded-[4px] bg-[rgba(255,255,255,0.03)] px-2 py-1.5 font-mono text-[0.66rem] text-[var(--color-faint)]">
              {channel.vars}
            </p>
            {channel.key === "telegram" && channel.on ? (
              <form action={testTelegramAction} className="mt-3">
                <input type="hidden" name="locale" value={locale} />
                <SubmitButton className="btn btn-ghost btn-sm w-full">
                  {l("Отправить тестовое сообщение", "Сынақ хабарламасын жіберу")}
                </SubmitButton>
              </form>
            ) : null}
          </div>
        ))}
      </div>

      <AdminCard
        title={t.admin.integrationErrors}
        description={`${errorCount} ${l("ошибок всего", "қате барлығы")}`}
      >
        {logs.length === 0 ? (
          <p className="text-[0.8rem] text-[var(--color-faint)]">{t.admin.noErrors}</p>
        ) : (
          <div className="-mx-4 overflow-x-auto sm:mx-0">
            <table className="admin-table min-w-[680px]">
              <thead>
                <tr>
                  <th scope="col">{t.admin.when}</th>
                  <th scope="col">{t.admin.channel}</th>
                  <th scope="col">{t.admin.status}</th>
                  <th scope="col">{t.admin.message}</th>
                  <th scope="col">{t.admin.attempts}</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap text-[0.72rem] text-[var(--color-faint)]">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="text-[var(--color-muted)]">{log.channel}</td>
                    <td>
                      <Badge
                        tone={
                          log.status === "error"
                            ? STATUS_TONE.spam
                            : log.status === "success"
                              ? STATUS_TONE.scheduled
                              : undefined
                        }
                      >
                        {log.status}
                      </Badge>
                    </td>
                    <td className="max-w-[420px] break-words text-[0.72rem] text-[var(--color-faint)]">
                      {log.message ?? "—"}
                    </td>
                    <td className="tabular text-[var(--color-faint)]">{log.attempts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      <AdminCard title={l("Webhook Telegram", "Telegram Webhook")}>
        <p className="text-[0.78rem] leading-relaxed text-[var(--color-muted)]">
          {l(
            "Установите webhook на адрес /api/telegram/webhook с secret_token:",
            "Webhook-ты /api/telegram/webhook мекенжайына secret_token-пен орнатыңыз:",
          )}
        </p>
        <pre className="mt-2 overflow-x-auto rounded-[6px] bg-[rgba(255,255,255,0.04)] p-3 font-mono text-[0.7rem] text-[var(--color-muted)]">
{`curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \\
  -d "url=$NEXT_PUBLIC_SITE_URL/api/telegram/webhook" \\
  -d "secret_token=$TELEGRAM_WEBHOOK_SECRET"`}
        </pre>
        <p className="mt-2 text-[0.72rem] text-[var(--color-faint)]">
          {l(
            "Без этого кнопки «В работе» и «Обработана» в Telegram не будут менять статус заявки.",
            "Онсыз Telegram-дағы «В работе» және «Обработана» батырмалары өтінім мәртебесін өзгертпейді.",
          )}
        </p>
      </AdminCard>
    </div>
  );
}

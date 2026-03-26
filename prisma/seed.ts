import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean existing data
  await prisma.note.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.client.deleteMany();

  // ── Clients ──────────────────────────────────────────

  const clientsData = [
    { id: "c1", name: "Алексей Морозов", company: "ТехноСтрой", email: "morozov@technostroy.ru", phone: "+7 (495) 123-45-67", status: "active" },
    { id: "c2", name: "Елена Волкова", company: "ДизайнПро", email: "volkova@designpro.ru", phone: "+7 (495) 234-56-78", status: "active" },
    { id: "c3", name: "Дмитрий Козлов", company: "ИнфоСистемы", email: "kozlov@infosys.ru", phone: "+7 (812) 345-67-89", status: "active" },
    { id: "c4", name: "Анна Соколова", company: "МедиаГрупп", email: "sokolova@mediagroup.ru", phone: "+7 (495) 456-78-90", status: "lead" },
    { id: "c5", name: "Игорь Новиков", company: "СтальМаш", email: "novikov@stalmash.ru", phone: "+7 (343) 567-89-01", status: "active" },
    { id: "c6", name: "Мария Лебедева", company: "ФинКонсалт", email: "lebedeva@finconsult.ru", phone: "+7 (495) 678-90-12", status: "active" },
    { id: "c7", name: "Сергей Петров", company: "ЛогиТранс", email: "petrov@logitrans.ru", phone: "+7 (863) 789-01-23", status: "inactive" },
    { id: "c8", name: "Ольга Федорова", company: "ЭкоПак", email: "fedorova@ecopak.ru", phone: "+7 (495) 890-12-34", status: "active" },
    { id: "c9", name: "Владимир Кузнецов", company: "АвтоДилер", email: "kuznetsov@avtodealer.ru", phone: "+7 (383) 901-23-45", status: "lead" },
    { id: "c10", name: "Наталья Попова", company: "СмартОфис", email: "popova@smartoffice.ru", phone: "+7 (495) 012-34-56", status: "active" },
    { id: "c11", name: "Андрей Васильев", company: "СтройАльянс", email: "vasiliev@stroyalliance.ru", phone: "+7 (846) 123-45-00", status: "active" },
    { id: "c12", name: "Татьяна Михайлова", company: "КлинСервис", email: "mikhailova@cleanservice.ru", phone: "+7 (495) 234-00-11", status: "lead" },
    { id: "c13", name: "Павел Орлов", company: "НефтьГаз", email: "orlov@neftgaz.ru", phone: "+7 (3452) 345-00-22", status: "active" },
    { id: "c14", name: "Ирина Белова", company: "ФудМаркет", email: "belova@foodmarket.ru", phone: "+7 (495) 456-00-33", status: "active" },
    { id: "c15", name: "Максим Зайцев", company: "ВебДев", email: "zaytsev@webdev.ru", phone: "+7 (495) 567-00-44", status: "inactive" },
    { id: "c16", name: "Юлия Романова", company: "ФармаПлюс", email: "romanova@farmaplus.ru", phone: "+7 (495) 678-00-55", status: "active" },
    { id: "c17", name: "Артём Григорьев", company: "ТурАгент", email: "grigoriev@turagent.ru", phone: "+7 (861) 789-00-66", status: "lead" },
    { id: "c18", name: "Виктория Чернова", company: "ПринтМастер", email: "chernova@printmaster.ru", phone: "+7 (495) 890-00-77", status: "active" },
    { id: "c19", name: "Роман Семёнов", company: "ТелекомСити", email: "semenov@telecomcity.ru", phone: "+7 (495) 901-00-88", status: "active" },
    { id: "c20", name: "Екатерина Данилова", company: "ЮрСервис", email: "danilova@jurservice.ru", phone: "+7 (495) 012-00-99", status: "inactive" },
  ];

  for (const c of clientsData) {
    await prisma.client.create({ data: c });
  }

  console.log(`✓ Seeded ${clientsData.length} clients`);

  // ── Deals ────────────────────────────────────────────

  const dealsData = [
    { id: "d1", clientId: "c1", title: "Внедрение ERP-системы", value: 2_500_000, stage: "closed-won", createdAt: new Date("2025-10-01"), closedAt: new Date("2026-01-15") },
    { id: "d2", clientId: "c1", title: "Обновление серверного оборудования", value: 1_200_000, stage: "negotiation", createdAt: new Date("2026-02-10"), closedAt: null },
    { id: "d3", clientId: "c2", title: "Редизайн корпоративного сайта", value: 800_000, stage: "proposal", createdAt: new Date("2026-03-01"), closedAt: null },
    { id: "d4", clientId: "c3", title: "Миграция в облако", value: 3_200_000, stage: "closed-won", createdAt: new Date("2025-09-15"), closedAt: new Date("2025-12-20") },
    { id: "d5", clientId: "c3", title: "Аудит информационной безопасности", value: 950_000, stage: "closed-won", createdAt: new Date("2026-01-10"), closedAt: new Date("2026-02-28") },
    { id: "d6", clientId: "c5", title: "Автоматизация производства", value: 1_800_000, stage: "negotiation", createdAt: new Date("2026-02-20"), closedAt: null },
    { id: "d7", clientId: "c6", title: "Разработка финансовой платформы", value: 2_800_000, stage: "proposal", createdAt: new Date("2026-03-05"), closedAt: null },
    { id: "d8", clientId: "c6", title: "Консалтинг по налогообложению", value: 640_000, stage: "closed-won", createdAt: new Date("2025-11-01"), closedAt: new Date("2025-12-15") },
    { id: "d9", clientId: "c7", title: "Оптимизация логистики", value: 980_000, stage: "closed-lost", createdAt: new Date("2025-10-15"), closedAt: new Date("2026-01-10") },
    { id: "d10", clientId: "c8", title: "Поставка упаковочной линии", value: 1_750_000, stage: "closed-won", createdAt: new Date("2025-12-01"), closedAt: new Date("2026-02-15") },
    { id: "d11", clientId: "c9", title: "CRM для автосалона", value: 450_000, stage: "lead", createdAt: new Date("2026-03-10"), closedAt: null },
    { id: "d12", clientId: "c10", title: "Умный офис: IoT решение", value: 3_500_000, stage: "negotiation", createdAt: new Date("2026-02-15"), closedAt: null },
    { id: "d13", clientId: "c10", title: "Система видеоконференцсвязи", value: 1_200_000, stage: "closed-won", createdAt: new Date("2025-11-10"), closedAt: new Date("2026-01-20") },
    { id: "d14", clientId: "c11", title: "Проектирование склада", value: 2_100_000, stage: "proposal", createdAt: new Date("2026-03-08"), closedAt: null },
    { id: "d15", clientId: "c13", title: "Модернизация SCADA-системы", value: 4_500_000, stage: "negotiation", createdAt: new Date("2026-01-20"), closedAt: null },
    { id: "d16", clientId: "c13", title: "Поставка датчиков давления", value: 2_300_000, stage: "closed-won", createdAt: new Date("2025-08-01"), closedAt: new Date("2025-10-30") },
    { id: "d17", clientId: "c14", title: "Система учёта товаров", value: 650_000, stage: "lead", createdAt: new Date("2026-03-15"), closedAt: null },
    { id: "d18", clientId: "c16", title: "Автоматизация аптечной сети", value: 2_200_000, stage: "closed-won", createdAt: new Date("2025-09-01"), closedAt: new Date("2025-12-01") },
    { id: "d19", clientId: "c16", title: "Мобильное приложение для клиентов", value: 1_900_000, stage: "proposal", createdAt: new Date("2026-03-12"), closedAt: null },
    { id: "d20", clientId: "c18", title: "Обновление печатного оборудования", value: 1_100_000, stage: "closed-won", createdAt: new Date("2025-11-20"), closedAt: new Date("2026-02-01") },
    { id: "d21", clientId: "c19", title: "5G инфраструктура", value: 5_800_000, stage: "negotiation", createdAt: new Date("2026-01-05"), closedAt: null },
    { id: "d22", clientId: "c3", title: "Обучение сотрудников", value: 320_000, stage: "closed-won", createdAt: new Date("2026-02-01"), closedAt: new Date("2026-03-10") },
    { id: "d23", clientId: "c4", title: "Рекламная кампания", value: 750_000, stage: "lead", createdAt: new Date("2026-03-20"), closedAt: null },
    { id: "d24", clientId: "c1", title: "Техподдержка 24/7", value: 480_000, stage: "closed-won", createdAt: new Date("2025-07-01"), closedAt: new Date("2025-08-15") },
    { id: "d25", clientId: "c5", title: "Замена конвейерной ленты", value: 900_000, stage: "closed-won", createdAt: new Date("2025-10-10"), closedAt: new Date("2025-11-25") },
    { id: "d26", clientId: "c11", title: "Монтаж вентиляции", value: 1_000_000, stage: "closed-lost", createdAt: new Date("2025-12-15"), closedAt: new Date("2026-02-10") },
    { id: "d27", clientId: "c19", title: "Контракт на обслуживание", value: 1_400_000, stage: "closed-won", createdAt: new Date("2025-09-20"), closedAt: new Date("2025-11-30") },
    { id: "d28", clientId: "c17", title: "Сайт для турагентства", value: 380_000, stage: "lead", createdAt: new Date("2026-03-22"), closedAt: null },
    { id: "d29", clientId: "c12", title: "Аутсорсинг клининга", value: 560_000, stage: "lead", createdAt: new Date("2026-03-18"), closedAt: null },
    { id: "d30", clientId: "c20", title: "Юридический аудит", value: 520_000, stage: "closed-lost", createdAt: new Date("2025-11-01"), closedAt: new Date("2026-01-25") },
  ];

  for (const d of dealsData) {
    await prisma.deal.create({
      data: {
        id: d.id,
        title: d.title,
        value: d.value,
        stage: d.stage,
        clientId: d.clientId,
        createdAt: d.createdAt,
        closedAt: d.closedAt,
      },
    });
  }

  console.log(`✓ Seeded ${dealsData.length} deals`);

  // ── Notes ────────────────────────────────────────────

  const notesData = [
    { clientId: "c1", text: "Клиент заинтересован в расширении сотрудничества. Обсудить возможности на следующей встрече.", author: "Алихан Веров", createdAt: new Date("2026-03-26") },
    { clientId: "c1", text: "Предпочитает общение через email. Звонить только по срочным вопросам в рабочее время (10:00–18:00).", author: "Алихан Веров", createdAt: new Date("2026-03-20") },
    { clientId: "c1", text: "Бюджет на Q2 утверждён. Можно предложить дополнительные услуги.", author: "Мария Лебедева", createdAt: new Date("2026-03-13") },
    { clientId: "c3", text: "Очень доволен миграцией в облако. Рекомендует нас партнёрам.", author: "Алихан Веров", createdAt: new Date("2026-03-25") },
    { clientId: "c3", text: "Обучение сотрудников прошло успешно. Планируют новый проект в Q3.", author: "Алихан Веров", createdAt: new Date("2026-03-12") },
    { clientId: "c6", text: "Ключевое контактное лицо — Мария. Принимает решения по закупкам самостоятельно.", author: "Алихан Веров", createdAt: new Date("2026-02-15") },
    { clientId: "c6", text: "Финансовая платформа — приоритетный проект. Нужна демонстрация до конца марта.", author: "Мария Лебедева", createdAt: new Date("2026-03-10") },
    { clientId: "c10", text: "Интересуется IoT-решениями для всех офисов сети. Потенциально крупный контракт.", author: "Алихан Веров", createdAt: new Date("2026-03-24") },
    { clientId: "c13", text: "Работает в нефтегазовом секторе. Высокие требования к безопасности и сертификации.", author: "Алихан Веров", createdAt: new Date("2026-02-20") },
    { clientId: "c13", text: "SCADA-проект требует выезда специалистов. Согласовать даты с технической командой.", author: "Мария Лебедева", createdAt: new Date("2026-03-15") },
    { clientId: "c19", text: "5G инфраструктура — долгосрочный проект. Этапы поставки растянуты на год.", author: "Алихан Веров", createdAt: new Date("2026-03-22") },
    { clientId: "c4", text: "Новый лид. Пришла по рекомендации от ТехноСтрой. Первый звонок запланирован.", author: "Алихан Веров", createdAt: new Date("2026-03-20") },
  ];

  for (const n of notesData) {
    await prisma.note.create({ data: n });
  }

  console.log(`✓ Seeded ${notesData.length} notes`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

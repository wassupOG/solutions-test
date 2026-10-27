import { profileDataSchema } from './profile-data.schema.js';

export const profileData = profileDataSchema.parse({
  id: 'ilya-naumov',
  name: 'Наумов Илья Дмитриевич',
  headline:
    'Senior Fullstack Developer · TypeScript / React / Node.js / NestJS',
  description:
    'Senior Fullstack разработчик с 8+ годами опыта в веб-разработке: fintech, корпоративные B2B/B2E-продукты и EdTech. Работаю со сквозными продуктовыми сценариями: пользовательский интерфейс, API, серверная бизнес-логика и данные. Основной стек — TypeScript, React, Next.js, Node.js, NestJS и PostgreSQL.',
  links: [
    { id: 'github', label: 'GitHub', url: 'https://github.com/wassupOG' },
    { id: 'telegram', label: 'Telegram', url: 'https://t.me/wassup21' },
  ],
  skills: [
    { id: 'typescript', name: 'TypeScript', category: 'Language' },
    { id: 'javascript', name: 'JavaScript', category: 'Language' },
    { id: 'nodejs', name: 'Node.js', category: 'Backend' },
    { id: 'nestjs', name: 'NestJS', category: 'Backend' },
    { id: 'graphql', name: 'GraphQL', category: 'Backend' },
    { id: 'rest', name: 'REST API', category: 'Backend' },
    { id: 'postgresql', name: 'PostgreSQL', category: 'Data' },
    { id: 'prisma', name: 'Prisma', category: 'Data' },
    { id: 'sql', name: 'SQL', category: 'Data' },
    { id: 'mysql', name: 'MySQL', category: 'Data' },
    { id: 'react', name: 'React', category: 'Frontend' },
    { id: 'nextjs', name: 'Next.js', category: 'Frontend' },
    { id: 'tanstack-query', name: 'TanStack Query', category: 'Frontend' },
    { id: 'redux', name: 'Redux', category: 'Frontend' },
    { id: 'zustand', name: 'Zustand', category: 'Frontend' },
    { id: 'tailwind', name: 'Tailwind CSS', category: 'Frontend' },
    { id: 'pwa', name: 'PWA', category: 'Frontend' },
    { id: 'python', name: 'Python', category: 'Backend' },
    { id: 'django', name: 'Django', category: 'Backend' },
    { id: 'docker', name: 'Docker', category: 'Infrastructure' },
    { id: 'git', name: 'Git', category: 'Infrastructure' },
    { id: 'jest', name: 'Jest', category: 'Testing' },
    { id: 'playwright', name: 'Playwright', category: 'Testing' },
  ],
  experience: [
    {
      id: 'wiam',
      company: 'WIAM',
      position:
        'Senior Fullstack разработчик (React / PostgreSQL / Node.js / Next.js / PWA)',
      startMonth: '2025-11',
      endMonth: null,
      description:
        'Развитие B2C-платформ онлайн-кредитования LendSwap, VayVnd и Lendao для международных рынков; frontend и отдельный backend-сервис атрибуции партнёрского трафика.',
      achievements: [
        'Реализовал backend-сервис на Node.js / PostgreSQL, связывающий партнёрский трафик с подтверждёнными конверсиями из PHP-платформы.',
        'Обеспечил отслеживание доставки конверсий: статусы и ошибки, повторную отправку после временных сбоев и защиту от повторной регистрации событий.',
        'Создал с нуля фронтенд-основу кредитной платформы для рынка Индии на React / Next.js.',
        'Внедрил клиентскую продуктовую аналитику в трёх продуктах и перестроил техническую SEO-инфраструктуру для четырёх рынков.',
      ],
    },
    {
      id: 'tokl',
      company: 'Токл Девелопмент',
      position:
        'Senior Fullstack разработчик (React / PostgreSQL / Node.js / Next.js / PWA)',
      startMonth: '2024-08',
      endMonth: '2025-10',
      description:
        'Корпоративные B2E/B2B-продукты для Газстройпрома: платформа для 10 000+ пользователей и SaaS-платформа мероприятий «Ивентум».',
      achievements: [
        'Реализовал API участия в мероприятиях: программа, доступные места, регистрация, статус и отмена участия.',
        'Обеспечил согласованность регистраций с помощью транзакций и ограничений PostgreSQL, включая защиту от превышения лимита мест.',
        'Сократил время первоначальной загрузки приложений в 4 раза.',
        'Сократил количество избыточных рендеров в среднем в 2,5 раза в основных пользовательских сценариях.',
      ],
    },
    {
      id: 'axitech',
      company: 'АКСИТЕХ',
      position:
        'Senior Fullstack разработчик (React / Vite / Node.js / NestJS / PostgreSQL)',
      startMonth: '2023-11',
      endMonth: '2024-08',
      description:
        'Внутренняя B2E-платформа автоматизации бизнес-процессов для 1000+ пользователей. NestJS, GraphQL, PostgreSQL / Prisma и React / TypeScript.',
      achievements: [
        'Сократил время отклика наиболее востребованных backend-эндпоинтов почти в 4 раза.',
        'Ускорил загрузку часто используемых разделов на 40% за счёт оптимизации GraphQL-запросов.',
        'Стандартизировал организацию frontend- и backend-кода; провёл рефакторинг и миграцию legacy на TypeScript.',
        'Внедрил автоматические проверки, linting и pre-commit-хуки для команды из 5 разработчиков.',
      ],
    },
    {
      id: 'englishful',
      company: 'Онлайн-школа английского языка englishful',
      position:
        'Senior Fullstack разработчик (React / Vite / Node.js / NestJS / MySQL)',
      startMonth: '2018-09',
      endMonth: '2023-12',
      description:
        'Разработка B2C/B2E-платформы обучения: кабинеты учеников и преподавателей, подготовка к экзаменам, самостоятельная практика и учебный прогресс.',
      achievements: [
        'Автоматизировал цикл работы с тестовыми заданиями и пробными экзаменами: создание, прохождение, проверку и сохранение результатов.',
        'Связал индивидуальные учебные планы, результаты занятий и мониторинг успеваемости.',
        'Реализовал интерактивный словарь с озвучкой и тренировками, тесты с автопроверкой и сохранением результатов.',
      ],
    },
  ],
  projects: [
    {
      id: 'vayvnd',
      name: 'VayVnd',
      description:
        'B2C-платформа онлайн-кредитования международной финтех-группы WIAM.',
      contribution:
        'Frontend и backend атрибуции: REST API и webhooks, схема PostgreSQL, идемпотентность событий, транзакционное сохранение события и задания доставки, повторные попытки отправки в партнёрские API.',
      url: 'https://vayvnd.net/',
      skillIds: ['typescript', 'react', 'nodejs', 'postgresql', 'sql', 'rest'],
    },
    {
      id: 'lendswap',
      name: 'LendSwap',
      description: 'Кредитный B2C-продукт международной финтех-группы WIAM.',
      contribution:
        'Разработка frontend кредитной платформы в рамках работы над продуктами WIAM: пользовательские сценарии, интеграция с серверным API и развитие интерфейсов.',
      url: 'https://lendswap.com/',
      skillIds: ['typescript', 'react'],
    },
    {
      id: 'lendao',
      name: 'Lendao',
      description: 'Кредитный B2C-продукт международной финтех-группы WIAM.',
      contribution:
        'Разработка frontend кредитной платформы в рамках работы над продуктами WIAM: пользовательские сценарии, интеграция с серверным API и развитие интерфейсов.',
      url: 'https://lendao.com/',
      skillIds: ['typescript', 'react'],
    },
  ],
});

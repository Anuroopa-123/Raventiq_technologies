// Raventiq.tech Configuration - Full Stack Engineering & Intelligent Systems
export const GOOGLE_CLIENT_ID = '';

export const SITE = {
  name: 'Raventiq.tech',
  short: 'Raventiq',
  tagline: 'Full-Stack Engineering & Intelligent Systems',
  email: 'hello@raventiq.tech',
  phone: '+91 00000 00000',
  whatsapp: '910000000000',
  instagram: 'https://instagram.com/',
  linkedin: 'https://linkedin.com/',
  github: 'https://github.com/',
  twitter: 'https://x.com/',
  location: 'Tamil Nadu, India',
  description: 'Raventiq.tech is an advanced engineering studio specializing in high-performance Full-Stack platforms (React, Angular, Node.js, Python, FastAPI, PostgreSQL, MySQL), practical AI integration, and production-grade internships for college students.',
  principles: [
    { title: 'Full-Stack Mastery', tag: 'END-TO-END', desc: 'Crafting responsive client apps and high-performance server APIs with zero tech debt.' },
    { title: 'Continuous Growth', tag: 'MENTORSHIP', desc: 'Empowering ambitious student engineers through real-world production mentorship.' },
  ],
};

export const SECTIONS = [
  { id: 'home', nav: 'Home', time: '01', mood: 'Hero' },
  { id: 'solutions', nav: 'Full Stack', time: '02', mood: 'Core Services' },
  { id: 'capabilities', nav: 'Tech Stack', time: '03', mood: 'Technologies' },
  { id: 'internships', nav: 'Internships', time: '04', mood: 'For Students' },
  { id: 'projects', nav: 'Projects', time: '05', mood: 'Selected Work' },
  { id: 'about', nav: 'About', time: '06', mood: 'Our Thinking' },
  { id: 'process', nav: 'Process', time: '07', mood: 'How We Work' },
  { id: 'faq', nav: 'FAQ', time: '08', mood: 'Questions' },
  { id: 'contact', nav: 'Contact', time: '09', mood: 'Let’s Build' },
];

export const SOLUTIONS = [
  {
    number: '01',
    id: 'frontend-engineering',
    title: 'Modern Frontend Engineering',
    subtitle: 'React & Angular architecture with TypeScript and high-speed UX',
    description: 'We build ultra-fast, responsive web interfaces using React and Angular. From complex enterprise dashboards to high-conversion product platforms, we engineer clean component systems with silky 60fps animations and instant interactions.',
    features: [
      'Production React 19 & Angular 20 signal architecture',
      'TypeScript strict typing & modular component systems',
      'Tailwind CSS, responsive design & mobile-first UX',
      'Zero layout shifts, sub-second TTFB & Core Web Vitals 100'
    ],
    badge: 'Frontend Mastery',
    highlighted: true,
  },
  {
    number: '02',
    id: 'backend-apis',
    title: 'Scalable Backend & Cloud APIs',
    subtitle: 'Node.js, Python & FastAPI for high-concurrency microservices',
    description: 'Engineered for resilience and speed. We design asynchronous backend architectures using Node.js and Python (FastAPI), providing real-time WebSockets, REST/GraphQL APIs, enterprise auth, and automated task queues.',
    features: [
      'High-throughput Python FastAPI async microservices',
      'Node.js & Express / NestJS event-driven backends',
      'JWT, OAuth2, role-based access control & API security',
      'Dockerized deployments, automated CI/CD & cloud scaling'
    ],
    badge: 'Backend Power',
    highlighted: false,
  },
  {
    number: '03',
    id: 'databases-data',
    title: 'Relational Data Architecture',
    subtitle: 'High-reliability PostgreSQL & MySQL data engineering',
    description: 'Data integrity and ultra-fast queries at any scale. We architect robust database schemas in PostgreSQL and MySQL with ACID compliance, optimized indexing, connection pooling, and seamless ORM integration.',
    features: [
      'PostgreSQL & MySQL performance tuning & indexing',
      'Prisma, Drizzle & SQLAlchemy type-safe ORM pipelines',
      'Transactional integrity, automated backups & replication',
      'Complex query optimization & real-time analytics schemas'
    ],
    badge: 'Data Integrity',
    highlighted: false,
  },
  {
    number: '04',
    id: 'smart-ai-integration',
    title: 'Smart AI & Automation Integration',
    subtitle: 'Practical intelligent features seamlessly wired into your stack',
    description: 'We don’t add AI for the sake of buzzwords. We integrate practical AI features—intelligent search, document data extraction, automated workflows, and smart copilots—directly into your React, Angular, and FastAPI applications.',
    features: [
      'Custom LLM APIs & enterprise semantic search',
      'Automated background data extraction pipelines',
      'Intelligent workflow automation & business triggers',
      'Cost-controlled inference with secure private data handling'
    ],
    badge: 'Smart Capabilities',
    highlighted: false,
  },
];

export const CAPABILITIES = [
  {
    id: 'frontend-stack',
    number: '01',
    title: 'Frontend Development (React & Angular)',
    subtitle: 'Interactive, responsive web experiences crafted for speed and elegance',
    description: 'We master both React and Angular ecosystems to construct resilient single-page applications and enterprise software. With TypeScript, modular state management, and modern styling, your users experience instantaneous responses and fluid motion.',
    metrics: [
      { label: 'Core Web Vitals', value: '100 / 100' },
      { label: 'Type Safety', value: '100% Strict TypeScript' },
      { label: 'Frame Rate', value: 'Silky 60 FPS' }
    ],
    stack: ['React 19', 'Angular 20', 'TypeScript', 'Tailwind CSS', 'Vite', 'Three.js'],
    highlights: [
      'Signals & reactive state architectures in Angular 20 and React hooks',
      'Custom reusable design systems with dark/light themes',
      'Optimistic UI mutations for zero perceived server latency',
      'Accessibility built to WCAG 2.1 AA specifications'
    ],
    architectureNote: 'Clean domain-driven separation between UI presentation, state signals, and API transport layers.'
  },
  {
    id: 'backend-stack',
    number: '02',
    title: 'Backend Engineering (Node.js, Python & FastAPI)',
    subtitle: 'Asynchronous, high-throughput backend services and APIs',
    description: 'We architect lightning-fast REST and WebSocket APIs using Python FastAPI and Node.js. Designed for high concurrency, low memory footprint, and bulletproof reliability under heavy traffic.',
    metrics: [
      { label: 'Response Latency', value: '<25ms P99' },
      { label: 'Concurrent Conns', value: '10k+ Req/Sec' },
      { label: 'API Standards', value: 'OpenAPI / Swagger' }
    ],
    stack: ['Python 3.12', 'FastAPI', 'Node.js', 'Express', 'Pydantic', 'Docker'],
    highlights: [
      'Async event loop handling high-concurrency requests seamlessly',
      'Automatic OpenAPI interactive documentation & schema validation',
      'Secure authentication with JWT, OAuth2, and rate limiting',
      'Background worker queues for asynchronous email and batch jobs'
    ],
    architectureNote: 'Stateless microservice design with containerized Docker runners ready for effortless cloud scale.'
  },
  {
    id: 'database-stack',
    number: '03',
    title: 'Database Systems (PostgreSQL & MySQL)',
    subtitle: 'Robust relational schemas, ACID transactions, and query speed',
    description: 'Databases are the foundation of every critical application. We design, optimize, and maintain PostgreSQL and MySQL databases, ensuring zero data loss, rock-solid foreign keys, and microsecond query times.',
    metrics: [
      { label: 'Data Integrity', value: '100% ACID Compliant' },
      { label: 'Query Latency', value: 'Sub-5ms Indexed' },
      { label: 'Uptime Reliability', value: '99.99%' }
    ],
    stack: ['PostgreSQL', 'MySQL', 'Prisma', 'SQLAlchemy', 'Redis', 'Alembic'],
    highlights: [
      'Normalized schema architecture with strict relational constraints',
      'Optimized B-tree and composite indexing strategies',
      'Connection pooling and caching layers with Redis',
      'Automated schema migration scripts with zero-downtime rollouts'
    ],
    architectureNote: 'Master-replica configurations and automated backup routines guarantee high availability.'
  },
  {
    id: 'ai-integration',
    number: '04',
    title: 'Smart AI & Automation Integration',
    subtitle: 'Pragmatic AI enhancements that elevate full-stack applications',
    description: 'Rather than standalone experiments, we embed AI directly into production full-stack systems. From automated customer support assistants and semantic search to intelligent data extraction from documents.',
    metrics: [
      { label: 'Integration Speed', value: 'Turnkey APIs' },
      { label: 'Accuracy Benchmark', value: '99.4% Extraction' },
      { label: 'Data Privacy', value: 'Zero Data Leaks' }
    ],
    stack: ['OpenAI / Gemini', 'LangChain', 'FastAPI', 'pgvector', 'Hugging Face'],
    highlights: [
      'Document and receipt parsing with structured JSON outputs',
      'Semantic vector search built inside PostgreSQL (pgvector)',
      'Automated business workflow triggers reducing manual tasks',
      'Cost-conscious caching preventing unnecessary token consumption'
    ],
    architectureNote: 'Inference gateway dynamically routes queries to specialized local models or cloud endpoints.'
  },
  {
    id: 'student-internships',
    number: '05',
    title: 'College Student Internship Program',
    subtitle: 'Real-world software engineering mentorship for aspiring developers',
    description: 'We believe in nurturing the next generation of engineers. Our internship program immerses college students in real-world production codebases, teaching React, Angular, Node.js, Python, FastAPI, and database engineering.',
    metrics: [
      { label: 'Mentorship', value: '1-on-1 Senior Guidance' },
      { label: 'Projects', value: 'Live Production Work' },
      { label: 'Certification', value: 'Verified Credential' }
    ],
    stack: ['React', 'Angular', 'Node.js', 'Python', 'FastAPI', 'PostgreSQL', 'Git / GitHub'],
    highlights: [
      'Live code reviews and real industry engineering standards',
      'Flexible internship windows (Summer, Winter, Semester-long)',
      'Official Certificate of Completion & Letter of Recommendation',
      'Fast-track interview for full-time junior developer roles (PPO)'
    ],
    architectureNote: 'Hands-on sprint cycles with GitHub pull requests, CI/CD pipelines, and agile scrum meetings.'
  }
];

export interface InternshipTrack {
  id: string;
  badge: string;
  title: string;
  duration: string;
  mode: string;
  description: string;
  skills: string[];
  perks: string[];
  curriculum: string[];
}

export const INTERNSHIP_TRACKS: InternshipTrack[] = [
  {
    id: 'fullstack-track',
    badge: 'POPULAR · COMPREHENSIVE',
    title: 'Full-Stack Web Development Track',
    duration: '2 - 3 Months',
    mode: 'Remote / Hybrid',
    description: 'Master complete end-to-end web engineering. Build responsive frontend applications using React or Angular and connect them to scalable backends with Node.js/Python and PostgreSQL/MySQL databases.',
    skills: ['React', 'Angular', 'Node.js', 'PostgreSQL', 'TypeScript', 'REST APIs'],
    perks: ['Verified Internship Certificate', '1-on-1 Code Reviews', 'Letter of Recommendation', 'PPO Opportunity'],
    curriculum: [
      'Modern UI components & state management (React / Angular)',
      'RESTful API development with Node.js & Express',
      'Relational database modeling with PostgreSQL',
      'Git workflows, GitHub Pull Requests & Cloud Deployment'
    ]
  },
  {
    id: 'backend-track',
    badge: 'HIGH DEMAND · SYSTEMS',
    title: 'Python & FastAPI Backend Track',
    duration: '2 - 3 Months',
    mode: 'Remote / Hybrid',
    description: 'Dive deep into high-performance API engineering, async programming with Python 3.12 and FastAPI, database architecture with MySQL/PostgreSQL, and Docker containerization.',
    skills: ['Python 3.12', 'FastAPI', 'PostgreSQL', 'MySQL', 'Docker', 'JWT Auth'],
    perks: ['Live Server Deployment', 'Senior Architect Mentorship', 'Verified Credential', 'Career Counseling'],
    curriculum: [
      'Async Python concepts & FastAPI framework design',
      'Database schemas, SQLAlchemy / Prisma & indexing',
      'Authentication, role-based access & API rate limiting',
      'Containerization with Docker & CI/CD pipeline automation'
    ]
  },
  {
    id: 'frontend-track',
    badge: 'UI / UX CRAFT',
    title: 'Modern Frontend & UI Engineering',
    duration: '2 Months',
    mode: 'Remote / Hybrid',
    description: 'Learn modern UI/UX engineering, animations, responsive design, and state architecture using React 19 or Angular 20 with Tailwind CSS and TypeScript.',
    skills: ['React 19', 'Angular 20', 'Tailwind CSS', 'TypeScript', 'Motion', 'Vite'],
    perks: ['Portfolio Website Ready', 'Direct Code Feedback', 'Certificate of Completion', 'Mock Interviews'],
    curriculum: [
      'Component-driven architecture & reusable UI libraries',
      'Responsive mobile-first layouts & Tailwind mastery',
      'State management with Angular Signals or React State',
      'Smooth animations, Web Vitals & Core performance optimization'
    ]
  }
];

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export const FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'Full Stack & Technology',
    question: 'What core full-stack technologies does Raventiq specialize in?',
    answer: 'We specialize in modern, high-performance web and software platforms. Our primary frontend stacks are React (including Next.js and Vite) and Angular (including Angular 20 with signals). Our backend engineering focuses on Node.js and Python (specifically FastAPI for high-concurrency async APIs). For data persistence, we rely on battle-tested relational databases: PostgreSQL and MySQL, backed by Redis for caching.',
  },
  {
    id: 'faq-2',
    category: 'Full Stack & Technology',
    question: 'Do you build custom full-stack solutions or use pre-made templates?',
    answer: 'Every project is architected from scratch according to your specific business requirements. We design clean, maintainable modular systems with custom UI/UX, strongly typed schemas, and scalable cloud deployments—never rigid off-the-shelf templates.',
  },
  {
    id: 'faq-3',
    category: 'Full Stack & Technology',
    question: 'Can you build applications using either React or Angular?',
    answer: 'Yes! We choose the right tool based on your project requirements and team preferences. For consumer-facing apps, fast-paced MVPs, and rich component ecosystems, React with TypeScript is often ideal. For complex enterprise dashboards, strict architectural modularity, and large-scale applications, Angular’s built-in dependency injection and signal architecture excel. We are equally proficient in both.',
  },
  {
    id: 'faq-4',
    category: 'Backend & Databases',
    question: 'Why do you choose Python FastAPI and Node.js for backend systems?',
    answer: 'Python with FastAPI provides blazing-fast asynchronous performance comparable to Go and NodeJS, automated OpenAPI/Swagger documentation, strict type validation via Pydantic, and native support for data processing and AI libraries. Node.js offers an immense ecosystem, non-blocking I/O, and the benefit of shared TypeScript models between frontend and backend.',
  },
  {
    id: 'faq-5',
    category: 'Backend & Databases',
    question: 'How do you decide between PostgreSQL and MySQL for database architecture?',
    answer: 'Both are outstanding, enterprise-grade relational databases. We generally recommend PostgreSQL when complex analytical queries, JSONB document storage, GIS/spatial data, or vector search (pgvector) are needed. We leverage MySQL for traditional high-read web architectures and established enterprise ecosystems. In all cases, we enforce strict schema designs, relational integrity, and optimized indexing.',
  },
  {
    id: 'faq-6',
    category: 'AI Capabilities',
    question: 'How do you incorporate AI without overwhelming the application with unnecessary complexity?',
    answer: 'We view AI as an intelligent capability that powers practical features—not a gimmick. We integrate targeted AI services directly into your full-stack app: smart search, automated document ingestion, real-time summarization, customer assistant chatbots, or intelligent recommendation workflows. All AI components communicate securely with your FastAPI or Node.js backend with strict privacy and cost controls.',
  },
  {
    id: 'faq-7',
    category: 'College Internships',
    question: 'What is the College Student Internship Program and who is eligible?',
    answer: 'Our internship program is designed for college and university students (B.E., B.Tech, BCA, MCA, B.Sc CS/IT) who want to bridge the gap between academic theory and real-world software engineering. Students work on live production codebases alongside experienced engineers, learning React, Angular, Node.js, Python, FastAPI, and PostgreSQL/MySQL. Interns receive mentorship, code reviews, verified certificates of completion, and potential Pre-Placement Offers (PPOs).',
  },
  {
    id: 'faq-8',
    category: 'College Internships',
    question: 'How can college students apply for an internship with Raventiq?',
    answer: 'Students can apply directly through our website by selecting "College Internship Program" on the contact form, or by emailing us at hello@raventiq.tech. Please include your name, college, year of study, GitHub/LinkedIn links, and your preferred track (Frontend, Backend, or Full-Stack). We review applications on a rolling basis for Summer, Winter, and Semester periods.',
  },
  {
    id: 'faq-9',
    category: 'Process & Delivery',
    question: 'What is your typical project delivery process and turnaround time?',
    answer: 'We operate in clear, collaborative 2-week agile sprints: Discovery & Architecture Blueprinting -> Rapid Iterative Build -> Continuous Staging Deployments -> QA & Production Launch. MVP web applications typically ship in 3 to 6 weeks, while large enterprise platforms take 2 to 4 months. You have direct access to our engineering team with weekly demos and continuous progress tracking.',
  },
];

export const PROJECTS = [
  {
    number: '01',
    id: 'enterprise-fullstack-platform',
    title: 'Enterprise Full-Stack Cloud Platform',
    subtitle: 'Angular 20 & Python FastAPI platform with real-time PostgreSQL replication',
    description: 'A mission-critical enterprise portal unifying live operations, inventory metrics, role-based permissions, and high-concurrency background queues with sub-50ms API response latency.',
    tags: ['Angular 20', 'Python FastAPI', 'PostgreSQL', 'Docker', 'Tailwind CSS'],
    theme: 'navy',
    metrics: [
      { label: 'API Response', value: '<35ms' },
      { label: 'Concurrency', value: '10k+ Req/s' },
      { label: 'Uptime SLA', value: '99.99%' }
    ]
  },
  {
    number: '02',
    id: 'react-node-analytics-suite',
    title: 'Real-Time Analytics & Collaboration Suite',
    subtitle: 'React 19, Node.js & MySQL architecture with WebSocket synchronization',
    description: 'A dynamic multi-tenant SaaS dashboard featuring collaborative team workspaces, instant data filtering, automated reporting pipelines, and optimized MySQL relational indexing.',
    tags: ['React 19', 'Node.js', 'MySQL', 'WebSockets', 'TypeScript'],
    theme: 'cobalt',
    metrics: [
      { label: 'Sync Latency', value: '<20ms' },
      { label: 'Data Accuracy', value: '100% ACID' },
      { label: 'Lighthouse', value: '100 / 100' }
    ]
  },
  {
    number: '03',
    id: 'intelligent-automation-portal',
    title: 'Intelligent Commerce & Workflow Portal',
    subtitle: 'Next-gen web application with smart AI recommendation & automated pipelines',
    description: 'A high-converting web platform engineered for speed, combining responsive React interfaces, asynchronous FastAPI backend microservices, and practical AI automated workflows.',
    tags: ['React', 'FastAPI', 'PostgreSQL', 'Smart AI', 'Tailwind'],
    theme: 'offwhite',
    metrics: [
      { label: 'Conversion Lift', value: '+42%' },
      { label: 'TTFB Edge', value: '28ms' },
      { label: 'CLS Score', value: '0.000' }
    ]
  }
];

export const PROCESS_STAGES = [
  {
    step: '01',
    badge: 'PHASE 01 · STRATEGY',
    title: 'Discover',
    subtitle: 'Deep architectural discovery & requirements',
    description: 'We analyze your business goals, user personas, technical constraints, and data flows to construct a comprehensive full-stack roadmap.',
    tags: ['Architecture Audit', 'Schema Planning', 'Tech Stack Selection'],
    stat: { value: '100%', label: 'Architectural Clarity' },
    accent: 'lime',
  },
  {
    step: '02',
    badge: 'PHASE 02 · BLUEPRINTS',
    title: 'Design',
    subtitle: 'UI/UX craft & database schema design',
    description: 'We craft intuitive responsive interfaces in Figma, map database relational schemas (PostgreSQL/MySQL), and specify typed API endpoints.',
    tags: ['UI/UX Wireframes', 'ER Diagrams', 'OpenAPI Specs'],
    stat: { value: '<50ms', label: 'UI Response Target' },
    accent: 'cobalt',
  },
  {
    step: '03',
    badge: 'PHASE 03 · VELOCITY',
    title: 'Build',
    subtitle: 'Full-stack engineering & agile sprints',
    description: 'We code with strict TypeScript, clean architecture in React/Angular, asynchronous FastAPI/Node.js microservices, and automated tests.',
    tags: ['Type-Safe CI/CD', 'Automated Testing', 'Docker Containers'],
    stat: { value: '0 Defect', label: 'Type-Safe Quality' },
    accent: 'lime',
  },
  {
    step: '04',
    badge: 'PHASE 04 · DEPLOY',
    title: 'Deploy & Evolve',
    subtitle: 'Production launch & ongoing optimization',
    description: 'We configure zero-downtime cloud deployments, real-time logging, query caching, and continuous feature evolutions.',
    tags: ['Cloud Hosting', 'Database Backups', 'Performance Telemetry'],
    stat: { value: '99.99%', label: 'Production SLA' },
    accent: 'cyan',
  }
];

export const INSIGHTS = [
  {
    id: 'react-vs-angular-2026',
    category: 'Frontend Engineering',
    title: 'React vs Angular in 2026: Choosing the Right Framework for Your Enterprise',
    excerpt: 'An architectural comparison of React 19 concurrent features versus Angular 20 signals, zoneless change detection, and enterprise maintainability.',
    readTime: '6 min read',
    date: 'October 2026',
    author: 'Raventiq Engineering Lab'
  },
  {
    id: 'fastapi-nodejs-benchmarks',
    category: 'Backend Architecture',
    title: 'FastAPI and Node.js: Designing Asynchronous Microservices That Scale',
    excerpt: 'How Python FastAPI and Node.js complement each other in modern distributed architectures for ultra-low latency and developer velocity.',
    readTime: '7 min read',
    date: 'October 2026',
    author: 'Backend Guild'
  },
  {
    id: 'postgresql-mysql-optimization',
    category: 'Database Engineering',
    title: 'PostgreSQL vs MySQL: Practical Schema Design, Indexing, and Performance',
    excerpt: 'A comprehensive guide to relational database modeling, composite indexing strategies, and connection pooling for mission-critical web applications.',
    readTime: '5 min read',
    date: 'October 2026',
    author: 'Data Systems Team'
  }
];

// Compatibility alias for contact form and other components
export const SERVICES = [
  ...SOLUTIONS.map(s => ({
    icon: s.number === '01' ? '⚡' : s.number === '02' ? '🛠️' : s.number === '03' ? '💾' : '🧠',
    color: s.number === '01' ? 'cobalt' : s.number === '02' ? 'lime' : s.number === '03' ? 'navy' : 'cobalt',
    title: s.title,
    text: s.description,
  })),
  {
    icon: '🎓',
    color: 'lime',
    title: 'College Student Internship Program',
    text: 'Hands-on software development internships in Full Stack (React, Angular, Node.js, Python, FastAPI, PostgreSQL, MySQL) with real production projects and 1-on-1 mentorship.',
  }
];

export const WORDS = [
  'FULL-STACK ENGINEERING',
  'REACT & ANGULAR',
  'PYTHON & FASTAPI',
  'NODE.JS & APIS',
  'POSTGRESQL & MYSQL',
  'SMART AI INTEGRATION',
  'COLLEGE INTERNSHIPS',
  'BUILD WITH PURPOSE'
];

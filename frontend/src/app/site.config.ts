// Raventiq.tech Configuration
export const GOOGLE_CLIENT_ID = '';

export const SITE = {
  name: 'Raventiq.tech',
  short: 'Raventiq',
  tagline: 'Intelligence Meets Innovation',
  email: 'hello@raventiq.tech',
  phone: '+91 00000 00000',
  whatsapp: '910000000000',
  instagram: 'https://instagram.com/',
  linkedin: 'https://linkedin.com/',
  github: 'https://github.com/',
  twitter: 'https://x.com/',
  location: 'Tamil Nadu, India',
  description: 'Raventiq.tech is an advanced technology engineering studio specializing in cognitive AI, multi-agent autonomous workflows, and modern high-performance digital platforms.',
  // founders: [
  //   { name: 'Anuroopa', role: 'Co-Founder & AI Systems Lead', initial: 'A', blurb: 'Leads cognitive architecture, model evaluations, and multimodal engineering delivery.' },
  //   { name: 'Dinesh', role: 'Co-Founder & Systems Architect', initial: 'D', blurb: 'Leads full-stack platform engineering, event-driven infrastructure, and autonomous agent orchestration.' },
  // ],
};

export const SECTIONS = [
  { id: 'home', nav: 'Home', time: '01', mood: 'Hero' },
  { id: 'solutions', nav: 'Solutions', time: '02', mood: 'What We Do' },
  { id: 'capabilities', nav: 'AI & Automation', time: '03', mood: 'Capabilities' },
  { id: 'projects', nav: 'Projects', time: '04', mood: 'Selected Work' },
  { id: 'about', nav: 'About', time: '05', mood: 'Our Thinking' },
  { id: 'process', nav: 'Process', time: '06', mood: 'How We Work' },
  { id: 'insights', nav: 'Insights', time: '07', mood: 'Ideas in Motion' },
  { id: 'contact', nav: 'Contact', time: '08', mood: 'Let’s Build' },
];

export const SOLUTIONS = [
  {
    number: '01',
    id: 'ai-intelligent-systems',
    title: 'AI & Intelligent Systems',
    subtitle: 'Foundation models, custom fine-tuning & multimodal intelligence',
    description: 'Transform ideas and information into intelligent experiences with AI-powered applications, cognitive retrieval systems, and multimodal sensory pipelines.',
    features: [
      'Custom LLM orchestration & structured reasoning',
      'Multimodal document & media processing pipelines',
      'Private enterprise RAG with semantic search',
      'Continuous evaluation & guardrail telemetry'
    ],
    badge: 'Core Intelligence',
    highlighted: true,
  },
  {
    number: '02',
    id: 'automation-ai-agents',
    title: 'Automation & AI Agents',
    subtitle: 'Autonomous workflows & event-driven multi-agent systems',
    description: 'Connect tools, streamline repetitive work, and build intelligent autonomous agent workflows that help teams accomplish exponentially more with complete traceability.',
    features: [
      'Autonomous multi-agent task execution',
      'API-first integrations with enterprise CRMs & ERPs',
      'Human-in-the-loop approval checkpoints',
      'Self-healing automated pipeline monitoring'
    ],
    badge: 'Scale & Efficiency',
    highlighted: false,
  },
  {
    number: '03',
    id: 'digital-product-engineering',
    title: 'Digital Product Engineering',
    subtitle: 'Next-gen web applications, interfaces & cloud platforms',
    description: 'Design and develop scalable web applications, intuitive interfaces, and dependable digital platforms engineered for ultra-fast latency, resilience, and elegance.',
    features: [
      'High-performance React & Angular architectures',
      'Reactive microservices & real-time WebSockets',
      'Edge compute deployment & distributed caching',
      'Design systems with pixel-perfect craft'
    ],
    badge: 'Craft & Speed',
    highlighted: false,
  },
];

export const CAPABILITIES = [
  {
    id: 'ai-dev',
    number: '01',
    title: 'AI Development',
    subtitle: 'Bespoke AI solutions with surgical precision and production stability',
    description: 'We build proprietary AI systems that solve genuine operational bottlenecks. From fine-tuned domain models to complex retrieval-augmented generation (RAG), our systems are architected for enterprise uptime, auditability, and measurable ROI.',
    metrics: [
      { label: 'Model Optimization', value: 'Quantized 4-bit / 8-bit' },
      { label: 'Response Latency', value: '<250ms Streaming' },
      { label: 'Evaluation Metrics', value: 'Automated Ragas & G-Eval' }
    ],
    stack: ['PyTorch', 'Hugging Face', 'vLLM', 'LangChain', 'LlamaIndex', 'Ollama'],
    highlights: [
      'Custom fine-tuning on proprietary datasets',
      'Private cloud or on-prem air-gapped deployments',
      'Rigorous evaluation benchmarks against hallucinations',
      'Cost-optimized inference routing across multi-model tiers'
    ],
    architectureNote: 'Inference gateway dynamically routes queries to specialized local SLMs or frontier models based on task complexity.'
  },
  {
    id: 'ai-agents',
    number: '02',
    title: 'AI Agents & Automation',
    subtitle: 'Autonomous actors that reason, plan, execute, and collaborate',
    description: 'Move beyond rigid scripts to dynamic AI agents capable of planning multi-step actions, querying internal tools, cross-checking findings, and escalating decisions with transparent audit trails.',
    metrics: [
      { label: 'Task Autonomy', value: 'Multi-step Planning' },
      { label: 'Tool Connectivity', value: 'REST, GraphQL, SQL' },
      { label: 'Safety Guardrails', value: 'Human-in-the-Loop' }
    ],
    stack: ['LangGraph', 'CrewAI', 'FastAPI', 'Redis', 'PostgreSQL', 'Temporal'],
    highlights: [
      'Stateful agent graphs with deterministic rollback states',
      'Self-reflective validation loops before committing actions',
      'Standardized schema tool-use (Function Calling & OpenAPI)',
      'Granular permission scopes preventing unintended mutations'
    ],
    architectureNote: 'State machines ensure every agent decision is persisted in write-ahead logs, enabling replayable debugging.'
  },
  {
    id: 'web-app',
    number: '03',
    title: 'Web Application Development',
    subtitle: 'Industrial-grade web applications crafted for speed and elegance',
    description: 'We engineer modern web experiences that balance aesthetic perfection with resilient architecture. Delivering silky 60fps animations, zero layout shifts, and instant response times.',
    metrics: [
      { label: 'Performance', value: '100 Core Web Vitals' },
      { label: 'Code Quality', value: '100% Typed TypeScript' },
      { label: 'Scalability', value: 'High Concurrency' }
    ],
    stack: ['Angular 20', 'TypeScript', 'FastAPI', 'Three.js', 'PostgreSQL', 'Vite'],
    highlights: [
      'Modular component libraries with rigorous visual testing',
      'Real-time collaborative features using WebSockets and state sync',
      'Optimistic UI mutations for zero perceived server latency',
      'Accessibility built to WCAG 2.1 AA specifications'
    ],
    architectureNote: 'Clean domain-driven separation between UI presentation, state signals, and API transport layers.'
  },
  {
    id: 'multimodal',
    number: '04',
    title: 'Multimodal AI',
    subtitle: 'Fusing vision, speech, code, and structured documents',
    description: 'Break out of text-only boundaries. We construct multimodal systems that process technical drawings, extract structured data from dense scans, transcribe polyphonic audio, and synthesize rich visual artifacts.',
    metrics: [
      { label: 'Data Ingestion', value: 'Audio, PDF, Images, Video' },
      { label: 'Extraction Precision', value: '99.4% Field Accuracy' },
      { label: 'Processing Speed', value: 'Sub-second OCR & Vector' }
    ],
    stack: ['Whisper', 'Gemini Vision', 'CLIP', 'OpenCV', 'FFmpeg', 'Unstructured.io'],
    highlights: [
      'Complex spatial document intelligence (CAD, PDFs, forms)',
      'Real-time streaming speech-to-text with speaker diarization',
      'Visual anomaly detection for industrial inspection',
      'Unified multimodal embeddings for cross-media retrieval'
    ],
    architectureNote: 'Parallelized sensory pipelines extract structural vector embeddings concurrently across GPU worker nodes.'
  },
  {
    id: 'api-sys',
    number: '05',
    title: 'API & System Integration',
    subtitle: 'Connecting disparate enterprise silos into a synchronized fabric',
    description: 'No modern tool exists in isolation. We architect bulletproof middleware, event meshes, and secure APIs that bind legacy databases, cloud platforms, payment gateways, and custom AI services into a coherent ecosystem.',
    metrics: [
      { label: 'Uptime SLA', value: '99.99%' },
      { label: 'Throughput', value: '10k+ Req/Sec' },
      { label: 'Data Consistency', value: 'ACID / Eventual' }
    ],
    stack: ['FastAPI', 'Go', 'GraphQL', 'Kafka', 'Docker', 'PostgreSQL'],
    highlights: [
      'Event-driven architectures with idempotent message consumers',
      'Automated bidirectional sync between SaaS platforms',
      'Zero-trust API security with JWT, OAuth2, and rate limiting',
      'Real-time observability via OpenTelemetry & Prometheus'
    ],
    architectureNote: 'High-throughput async event bus with dead-letter queues ensures zero data loss during external vendor outages.'
  }
];

export const PROJECTS = [
  {
    number: '01',
    id: 'multimodal-ai-workspace',
    title: 'Multimodal AI Workspace',
    subtitle: 'Collaborative sensory canvas powered by real-time speech and vision models',
    description: 'An intelligent studio platform where distributed engineering teams ingest architectural blueprints, audio transcripts, and tabular data into a unified reasoning graph.',
    tags: ['Multimodal LLMs', 'Real-time Audio', 'Vector DB', 'WebSockets', 'Canvas UI'],
    theme: 'navy',
    metrics: [
      { label: 'Latency', value: '<120ms' },
      { label: 'Formats', value: '40+' },
      { label: 'Context', value: '1M Tokens' }
    ]
  },
  {
    number: '02',
    id: 'intelligent-workflow-automation',
    title: 'Intelligent Workflow Automation',
    subtitle: 'Autonomous multi-agent orchestration for enterprise operations',
    description: 'A proactive automation backbone that monitors distributed systems, reconciles financial settlements, generates executive briefs, and flags anomalies before incidents escalate.',
    tags: ['Agent Orchestration', 'Event-Driven', 'FastAPI', 'Kafka', 'PostgreSQL'],
    theme: 'cobalt',
    metrics: [
      { label: 'Time Saved', value: '84%' },
      { label: 'Accuracy', value: '99.8%' },
      { label: 'Throughput', value: '1,400 msg/s' }
    ]
  },
  {
    number: '03',
    id: 'next-gen-web-applications',
    title: 'Next-Generation Web Platform',
    subtitle: 'Ultra-low latency digital flagship with microsecond UI responsiveness',
    description: 'A hyper-responsive digital platform combining editorial typography, reactive 3D visualizers, server-driven UI, and zero-layout-shift performance on every global edge.',
    tags: ['Angular 20', 'TypeScript', 'Tailwind', 'Three.js', 'FastAPI'],
    theme: 'offwhite',
    metrics: [
      { label: 'Lighthouse', value: '100' },
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
    subtitle: 'Deep architectural discovery & strategy',
    description: 'Understand the problem, users, goals, and opportunities. We dissect technical architecture and pinpoint where intelligent technology provides an unfair advantage.',
    tags: ['Architecture Audit', 'Domain Ingestion', 'Risk Modeling'],
    stat: { value: '100%', label: 'Architectural Clarity' },
    accent: 'lime',
  },
  {
    step: '02',
    badge: 'PHASE 02 · BLUEPRINTS',
    title: 'Design',
    subtitle: 'System blueprints & interaction craft',
    description: 'Develop a thoughtful solution, system architecture, and user experience. Every micro-interaction is mapped for speed, reliability, and human clarity.',
    tags: ['System Schematics', 'Interaction Craft', 'Event Topology'],
    stat: { value: '<50ms', label: 'UI Response Target' },
    accent: 'cobalt',
  },
  {
    step: '03',
    badge: 'PHASE 03 · VELOCITY',
    title: 'Build',
    subtitle: 'Rigorous engineering & iterative velocity',
    description: 'Engineer the product, integrate relevant technologies, and test thoroughly. Clean, typed code with automated continuous integration and testing.',
    tags: ['Type-Safe CI/CD', 'Automated Gates', 'Edge Workers'],
    stat: { value: '0 Defect', label: 'Type-Safe Quality' },
    accent: 'lime',
  },
  {
    step: '04',
    badge: 'PHASE 04 · EVOLUTION',
    title: 'Evolve',
    subtitle: 'Production launch & continuous optimization',
    description: 'Deploy, measure performance, refine the solution, and improve continuously. Wire up real-time telemetry and optimize system latency and accuracy.',
    tags: ['Telemetry Mesh', 'Latency Tuning', 'Self-Healing SLA'],
    stat: { value: '99.99%', label: 'Production Uptime' },
    accent: 'cyan',
  }
];

export const INSIGHTS = [
  {
    id: 'practical-ai-agents',
    category: 'Autonomous Systems',
    title: 'Practical applications of AI agents in modern enterprises',
    excerpt: 'Why most autonomous agent demos fail in production, and how stateful graph architectures bring deterministic reliability to real-world workflows.',
    readTime: '6 min read',
    date: 'October 2026',
    author: 'Raventiq Engineering Lab'
  },
  {
    id: 'multimodal-ai-systems',
    category: 'Cognitive Computing',
    title: 'Building useful multimodal AI systems that actually deliver value',
    excerpt: 'Fusing speech, vision, and tabular data into a unified reasoning graph without exponential latency or runaway token costs.',
    readTime: '8 min read',
    date: 'October 2026',
    author: 'AI Research Team'
  },
  {
    id: 'intelligent-automation-playbook',
    category: 'Product Engineering',
    title: 'Automating workflows with intelligent technology without breaking operations',
    excerpt: 'A blueprint for engineering event-driven automation pipelines with zero data loss, idempotent retries, and complete audit compliance.',
    readTime: '5 min read',
    date: 'October 2026',
    author: 'Architecture Guild'
  }
];

// Compatibility alias for existing components
export const SERVICES = SOLUTIONS.map(s => ({
  icon: s.number === '01' ? '🧠' : s.number === '02' ? '⚡' : '🚀',
  color: s.number === '01' ? 'cobalt' : s.number === '02' ? 'lime' : 'navy',
  title: s.title,
  text: s.description,
}));

export const WORDS = [
  'THINK INTELLIGENTLY',
  'BUILD BOLDLY',
  'AUTOMATE WHAT’S NEXT',
  'MOVES THE FUTURE FORWARD',
  'AI SYSTEMS',
  'PRODUCT CRAFT'
];

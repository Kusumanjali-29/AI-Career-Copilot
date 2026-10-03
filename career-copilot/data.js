// ============================================================
// AI-Powered Student Academic & Career Copilot — Data Layer
// ============================================================

const CAREER_PROFILES = {
  "Data Scientist": {
    icon: "🔬",
    color: "#7c3aed",
    gradient: "linear-gradient(135deg, #7c3aed, #a855f7)",
    description: "Extract insights from complex datasets using statistics, ML, and storytelling to drive data-driven decisions.",
    avgSalary: "$115,000",
    jobGrowth: "36%",
    demandLevel: "Very High",
    requiredSkills: [
      { name: "Python", level: 90, category: "Programming" },
      { name: "Statistics & Probability", level: 85, category: "Math" },
      { name: "Machine Learning", level: 80, category: "AI/ML" },
      { name: "Data Visualization", level: 75, category: "Analytics" },
      { name: "SQL", level: 70, category: "Data" },
      { name: "Deep Learning", level: 65, category: "AI/ML" },
      { name: "Feature Engineering", level: 70, category: "AI/ML" },
      { name: "A/B Testing", level: 60, category: "Analytics" },
    ],
    tools: ["Jupyter Notebook", "Pandas", "NumPy", "Scikit-learn", "TensorFlow", "Matplotlib", "Seaborn", "Tableau"],
    topCompanies: ["Google", "Meta", "Netflix", "Airbnb", "Spotify"],
    roadmap: [
      { phase: "Foundation", duration: "2–3 months", topics: ["Python Basics", "Statistics", "Linear Algebra", "SQL Fundamentals"] },
      { phase: "Core Skills", duration: "3–4 months", topics: ["Data Wrangling with Pandas", "Data Visualization", "Exploratory Data Analysis", "Probability Theory"] },
      { phase: "Machine Learning", duration: "4–5 months", topics: ["Supervised Learning", "Unsupervised Learning", "Model Evaluation", "Feature Engineering"] },
      { phase: "Advanced Topics", duration: "3–4 months", topics: ["Deep Learning Basics", "NLP Introduction", "Time Series Analysis", "Big Data (Spark)"] },
      { phase: "Portfolio & Jobs", duration: "2–3 months", topics: ["Capstone Projects", "Kaggle Competitions", "Portfolio Website", "Interview Prep"] },
    ],
    projects: [
      { name: "Customer Churn Prediction", difficulty: "Intermediate", tech: "Python, Scikit-learn, Pandas", description: "Build a model to predict which customers are likely to leave a subscription service." },
      { name: "Sales Forecasting Dashboard", difficulty: "Intermediate", tech: "Python, Prophet, Plotly", description: "Create a time-series model to forecast monthly sales with an interactive dashboard." },
      { name: "Sentiment Analysis Engine", difficulty: "Advanced", tech: "Python, NLTK, BERT", description: "Analyze social media sentiment about a brand using NLP techniques." },
    ],
  },

  "Machine Learning Engineer": {
    icon: "⚙️",
    color: "#0891b2",
    gradient: "linear-gradient(135deg, #0891b2, #06b6d4)",
    description: "Design, build, and deploy ML systems at scale — bridging the gap between research and production.",
    avgSalary: "$130,000",
    jobGrowth: "40%",
    demandLevel: "Very High",
    requiredSkills: [
      { name: "Python", level: 95, category: "Programming" },
      { name: "Machine Learning", level: 90, category: "AI/ML" },
      { name: "Deep Learning", level: 85, category: "AI/ML" },
      { name: "MLOps & Deployment", level: 80, category: "DevOps" },
      { name: "System Design", level: 75, category: "Engineering" },
      { name: "Data Pipelines", level: 70, category: "Data" },
      { name: "Cloud Platforms", level: 70, category: "DevOps" },
      { name: "C++ / Java", level: 60, category: "Programming" },
    ],
    tools: ["PyTorch", "TensorFlow", "Docker", "Kubernetes", "MLflow", "Airflow", "AWS SageMaker", "FastAPI"],
    topCompanies: ["OpenAI", "DeepMind", "Nvidia", "Tesla", "Microsoft"],
    roadmap: [
      { phase: "Foundation", duration: "2–3 months", topics: ["Advanced Python", "Data Structures & Algorithms", "Linear Algebra", "Calculus for ML"] },
      { phase: "ML Core", duration: "3–4 months", topics: ["Classical ML Algorithms", "Model Optimization", "Regularization Techniques", "Ensemble Methods"] },
      { phase: "Deep Learning", duration: "4–5 months", topics: ["Neural Networks", "CNNs, RNNs, Transformers", "PyTorch / TensorFlow", "Research Papers"] },
      { phase: "MLOps", duration: "3–4 months", topics: ["Docker & Kubernetes", "CI/CD for ML", "Model Monitoring", "Cloud Deployment (AWS/GCP)"] },
      { phase: "Specialization", duration: "3–4 months", topics: ["Large Language Models", "Reinforcement Learning", "Distributed Training", "System Design for ML"] },
    ],
    projects: [
      { name: "Real-time Object Detection API", difficulty: "Advanced", tech: "PyTorch, FastAPI, Docker", description: "Deploy a YOLO-based object detection model as a scalable REST API." },
      { name: "Recommendation System", difficulty: "Intermediate", tech: "Python, Collaborative Filtering, Redis", description: "Build a Netflix-style recommendation engine with real-time serving." },
      { name: "MLOps Pipeline", difficulty: "Advanced", tech: "MLflow, Airflow, AWS", description: "Create an end-to-end ML pipeline with automated retraining and A/B deployment." },
    ],
  },

  "AI Engineer": {
    icon: "🤖",
    color: "#dc2626",
    gradient: "linear-gradient(135deg, #dc2626, #f97316)",
    description: "Build intelligent AI products and integrate cutting-edge models (LLMs, vision, speech) into real-world applications.",
    avgSalary: "$145,000",
    jobGrowth: "45%",
    demandLevel: "Extremely High",
    requiredSkills: [
      { name: "Python", level: 90, category: "Programming" },
      { name: "Large Language Models", level: 85, category: "AI/ML" },
      { name: "Prompt Engineering", level: 85, category: "AI/ML" },
      { name: "API Integration", level: 80, category: "Engineering" },
      { name: "Vector Databases", level: 75, category: "Data" },
      { name: "RAG Systems", level: 75, category: "AI/ML" },
      { name: "Cloud Platforms", level: 70, category: "DevOps" },
      { name: "LangChain / LlamaIndex", level: 70, category: "AI/ML" },
    ],
    tools: ["OpenAI API", "LangChain", "LlamaIndex", "Pinecone", "Weaviate", "FastAPI", "Streamlit", "Hugging Face"],
    topCompanies: ["OpenAI", "Anthropic", "Cohere", "Scale AI", "Inflection AI"],
    roadmap: [
      { phase: "Foundation", duration: "2–3 months", topics: ["Python & APIs", "AI/ML Fundamentals", "Transformers Architecture", "Prompt Engineering Basics"] },
      { phase: "LLM Mastery", duration: "3–4 months", topics: ["Fine-tuning LLMs", "RAG Systems", "Vector Databases", "Embeddings & Semantic Search"] },
      { phase: "AI Applications", duration: "3–4 months", topics: ["LangChain/LlamaIndex", "AI Agents & Tools", "Multi-modal AI", "Chatbot Development"] },
      { phase: "Production AI", duration: "3–4 months", topics: ["AI Safety & Alignment", "Cost Optimization", "Latency & Caching", "Evaluation Frameworks"] },
      { phase: "Advanced", duration: "2–3 months", topics: ["Custom Model Training", "RLHF", "Multi-agent Systems", "AI Product Strategy"] },
    ],
    projects: [
      { name: "RAG-Powered Knowledge Base", difficulty: "Intermediate", tech: "LangChain, Pinecone, OpenAI, Streamlit", description: "Build a chatbot that answers questions from your own documents using RAG." },
      { name: "AI Code Review Assistant", difficulty: "Advanced", tech: "GPT-4, GitHub API, FastAPI", description: "Create an AI agent that automatically reviews pull requests and suggests improvements." },
      { name: "Multi-modal AI App", difficulty: "Advanced", tech: "GPT-4V, Whisper, React", description: "Build an app that understands images, audio, and text simultaneously." },
    ],
  },

  "Data Analyst": {
    icon: "📊",
    color: "#059669",
    gradient: "linear-gradient(135deg, #059669, #10b981)",
    description: "Transform raw data into clear business insights using visualization, statistical analysis, and reporting.",
    avgSalary: "$85,000",
    jobGrowth: "23%",
    demandLevel: "High",
    requiredSkills: [
      { name: "SQL", level: 95, category: "Data" },
      { name: "Excel / Google Sheets", level: 85, category: "Analytics" },
      { name: "Data Visualization", level: 85, category: "Analytics" },
      { name: "Python / R", level: 70, category: "Programming" },
      { name: "Statistics", level: 75, category: "Math" },
      { name: "Business Acumen", level: 80, category: "Business" },
      { name: "Storytelling with Data", level: 80, category: "Communication" },
      { name: "Dashboard Design", level: 70, category: "Analytics" },
    ],
    tools: ["Tableau", "Power BI", "Google Looker", "Python Pandas", "SQL (PostgreSQL)", "Excel", "Google Analytics", "dbt"],
    topCompanies: ["McKinsey", "Deloitte", "Walmart", "JPMorgan", "Salesforce"],
    roadmap: [
      { phase: "Foundation", duration: "1–2 months", topics: ["SQL Fundamentals", "Excel Mastery", "Basic Statistics", "Data Types & Structures"] },
      { phase: "Core Tools", duration: "2–3 months", topics: ["Advanced SQL", "Python with Pandas", "Tableau / Power BI", "Statistical Analysis"] },
      { phase: "Analytics Skills", duration: "2–3 months", topics: ["Data Cleaning & ETL", "EDA Techniques", "KPI Definition", "Report Automation"] },
      { phase: "Business Intelligence", duration: "2–3 months", topics: ["Dashboard Design", "A/B Testing Analysis", "Predictive Analytics Basics", "Data Storytelling"] },
      { phase: "Career Growth", duration: "2 months", topics: ["Portfolio Projects", "Business Case Studies", "Communication Skills", "Interview Preparation"] },
    ],
    projects: [
      { name: "Sales Performance Dashboard", difficulty: "Beginner", tech: "Tableau, SQL, Excel", description: "Create an executive dashboard tracking KPIs, revenue trends, and regional performance." },
      { name: "Customer Segmentation Analysis", difficulty: "Intermediate", tech: "Python, K-Means, Seaborn", description: "Segment customers by behavior patterns to inform marketing strategy." },
      { name: "E-commerce Funnel Analysis", difficulty: "Intermediate", tech: "SQL, Python, Looker", description: "Analyze drop-off rates at each stage of the purchase funnel and recommend improvements." },
    ],
  },

  "Software Developer": {
    icon: "💻",
    color: "#d97706",
    gradient: "linear-gradient(135deg, #d97706, #f59e0b)",
    description: "Design and build scalable software systems, web/mobile apps, and APIs that power modern products.",
    avgSalary: "$110,000",
    jobGrowth: "25%",
    demandLevel: "High",
    requiredSkills: [
      { name: "JavaScript / TypeScript", level: 90, category: "Programming" },
      { name: "Data Structures & Algorithms", level: 85, category: "CS Fundamentals" },
      { name: "System Design", level: 75, category: "Engineering" },
      { name: "React / Vue / Angular", level: 80, category: "Frontend" },
      { name: "Node.js / Backend", level: 75, category: "Backend" },
      { name: "Databases (SQL + NoSQL)", level: 70, category: "Data" },
      { name: "Git & Version Control", level: 85, category: "DevOps" },
      { name: "Testing & CI/CD", level: 65, category: "DevOps" },
    ],
    tools: ["React", "Node.js", "PostgreSQL", "MongoDB", "Docker", "Git", "REST APIs / GraphQL", "TypeScript"],
    topCompanies: ["Amazon", "Apple", "Microsoft", "Stripe", "Shopify"],
    roadmap: [
      { phase: "Foundation", duration: "2–3 months", topics: ["HTML, CSS, JavaScript", "Programming Logic", "Git Basics", "Computer Science Fundamentals"] },
      { phase: "Frontend", duration: "3–4 months", topics: ["React.js", "TypeScript", "State Management", "Responsive Design"] },
      { phase: "Backend", duration: "3–4 months", topics: ["Node.js & Express", "SQL & NoSQL Databases", "REST API Design", "Authentication & Security"] },
      { phase: "Advanced", duration: "3–4 months", topics: ["System Design", "Data Structures & Algorithms", "Microservices", "Cloud (AWS/GCP/Azure)"] },
      { phase: "Job Ready", duration: "2–3 months", topics: ["LeetCode Practice", "Portfolio Projects", "Open Source Contributions", "Behavioral Interviews"] },
    ],
    projects: [
      { name: "Full-Stack Social Media App", difficulty: "Intermediate", tech: "React, Node.js, MongoDB, Socket.io", description: "Build a Twitter-like app with real-time updates, authentication, and media uploads." },
      { name: "E-commerce Platform", difficulty: "Advanced", tech: "Next.js, Stripe, PostgreSQL, Redis", description: "Create a production-ready online store with payments, inventory, and admin dashboard." },
      { name: "DevOps Dashboard", difficulty: "Advanced", tech: "React, Docker, Kubernetes, Prometheus", description: "Monitor microservices health with real-time metrics, logs, and alerting." },
    ],
  },
};

const ALL_SKILLS = [
  // Programming
  { name: "Python", category: "Programming" },
  { name: "JavaScript / TypeScript", category: "Programming" },
  { name: "Java", category: "Programming" },
  { name: "C++", category: "Programming" },
  { name: "R", category: "Programming" },
  // AI / ML
  { name: "Machine Learning", category: "AI/ML" },
  { name: "Deep Learning", category: "AI/ML" },
  { name: "Large Language Models", category: "AI/ML" },
  { name: "Prompt Engineering", category: "AI/ML" },
  { name: "RAG Systems", category: "AI/ML" },
  { name: "Computer Vision", category: "AI/ML" },
  { name: "NLP", category: "AI/ML" },
  // Data
  { name: "SQL", category: "Data" },
  { name: "Data Visualization", category: "Data" },
  { name: "Data Wrangling", category: "Data" },
  { name: "Feature Engineering", category: "Data" },
  { name: "Statistics & Probability", category: "Math" },
  // Tools / DevOps
  { name: "Docker & Kubernetes", category: "DevOps" },
  { name: "Cloud Platforms (AWS/GCP)", category: "DevOps" },
  { name: "Git & Version Control", category: "DevOps" },
  { name: "CI/CD", category: "DevOps" },
  // Frontend / Backend
  { name: "React / Vue / Angular", category: "Frontend" },
  { name: "Node.js / Backend", category: "Backend" },
  { name: "REST API Design", category: "Backend" },
  { name: "System Design", category: "Engineering" },
  // Business
  { name: "Business Acumen", category: "Business" },
  { name: "Storytelling with Data", category: "Communication" },
  { name: "A/B Testing", category: "Analytics" },
  { name: "Dashboard Design", category: "Analytics" },
];

const ALL_INTERESTS = [
  "Artificial Intelligence", "Machine Learning", "Data Science",
  "Web Development", "Mobile Development", "Cloud Computing",
  "Cybersecurity", "Robotics", "Computer Vision", "Natural Language Processing",
  "Quantitative Finance", "Healthcare Tech", "EdTech", "Game Development",
  "DevOps & Platform Engineering", "Open Source", "Research & Academia",
  "Product Management", "Entrepreneurship / Startups",
];

const EDUCATION_LEVELS = ["Freshman (1st Year)", "Sophomore (2nd Year)", "Junior (3rd Year)", "Senior (4th Year)", "Graduate Student", "Bootcamp Student"];
const MAJORS = ["Computer Science", "Data Science", "Statistics", "Mathematics", "Electrical Engineering", "Information Technology", "Business Analytics", "Other"];

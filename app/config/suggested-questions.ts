// 推荐问题配置文件
// 支持不同agent的个性化推荐问题

export interface QuestionConfig {
  id: string; // 问题的唯一标识符，用于缓存管理、点击追踪和去重
  text: string; // 问题的显示文本
  text_en?: string; // 英文版问题的显示文本
}

export interface AgentQuestionsConfig {
  agentType: string;
  agentName: string;
  agentName_en?: string;
  defaultQuestions: QuestionConfig[];
  description?: string;
  description_en?: string;
}

// 默认通用推荐问题
const DEFAULT_QUESTIONS: QuestionConfig[] = [
  {
    id: "default-ai-1",
    text: "请详细介绍AI技术在教育、医疗、交通三个领域的具体应用和影响",
    text_en:
      "Please detail the specific applications and impact of AI technology in education, healthcare, and transportation",
  },
  {
    id: "default-productivity-1",
    text: "请推荐5个提高工作效率的具体方法，包括时间管理和学习技巧",
    text_en:
      "Please recommend 5 specific methods to improve work efficiency, including time management and learning techniques",
  },
  {
    id: "default-life-1",
    text: "分享10个日常生活中实用的小技巧，涵盖健康、整理和省钱方面",
    text_en:
      "Share 10 practical life tips covering health, organization, and money-saving",
  },
];

// 不同agent的推荐问题配置
export const AGENT_QUESTIONS_CONFIG: AgentQuestionsConfig[] = [
  {
    agentType: "general",
    agentName: "智能伙伴小鱼",
    agentName_en: "Smart Partner Fish",
    defaultQuestions: DEFAULT_QUESTIONS,
    description:
      "你的贴心智能伙伴，能聊天解答、搜索信息、查地图路线，就像身边的万能助手！",
    description_en:
      "Your caring smart partner, capable of chatting, searching information, looking up maps, just like a versatile assistant!",
  },
  {
    agentType: "coding",
    agentName: "编程助手",
    agentName_en: "Coding Assistant",
    defaultQuestions: [
      {
        id: "coding-basics-1",
        text: "对比Python、JavaScript、Java三种编程语言的特点，推荐初学者最适合的选择",
        text_en:
          "Compare Python, JavaScript, and Java programming languages, and recommend the best choice for beginners",
      },
      {
        id: "coding-practice-1",
        text: "列出5个提高编程技能的具体实践项目，从简单到复杂逐步进阶",
        text_en:
          "List 5 practical projects to improve programming skills, progressing from beginner to advanced",
      },
      {
        id: "coding-debug-1",
        text: "详细说明代码调试的完整流程和5个常用调试技巧，附带实例演示",
        text_en:
          "Explain the complete code debugging process and 5 common debugging techniques with examples",
      },
    ],
    description: "专注于编程、开发和技术相关问题",
    description_en:
      "Focused on programming, development, and technical questions",
  },
  {
    agentType: "writing",
    agentName: "写作助手",
    agentName_en: "Writing Assistant",
    defaultQuestions: [
      {
        id: "writing-improve-1",
        text: "提供7个具体的写作技巧来提升文章质量，包括词汇选择、句式变化和逻辑表达",
        text_en:
          "Provide 7 specific writing techniques to improve article quality, including vocabulary, sentence variety, and logical expression",
      },
      {
        id: "writing-structure-1",
        text: "详细介绍议论文、说明文、记叙文三种文体的标准结构模板和写作要点",
        text_en:
          "Detail the standard structure templates and writing tips for argumentative, expository, and narrative essays",
      },
      {
        id: "writing-creativity-1",
        text: "分享6种激发写作灵感的实用方法，包括观察技巧、思维导图和素材积累",
        text_en:
          "Share 6 practical methods to spark writing inspiration, including observation techniques, mind maps, and material collection",
      },
    ],
    description: "专注于写作、文案和内容创作",
    description_en: "Focused on writing, copywriting, and content creation",
  },
  {
    agentType: "business",
    agentName: "商业顾问",
    agentName_en: "Business Consultant",
    defaultQuestions: [
      {
        id: "business-strategy-1",
        text: "详细介绍SWOT分析法制定商业策略的完整步骤，并提供一个实际案例分析",
        text_en:
          "Detail the complete steps of SWOT analysis for business strategy with a real case study",
      },
      {
        id: "business-marketing-1",
        text: "列出8种低成本高效果的数字营销方法，包括社交媒体、内容营销和SEO策略",
        text_en:
          "List 8 low-cost, high-impact digital marketing methods including social media, content marketing, and SEO strategies",
      },
      {
        id: "business-management-1",
        text: "提供团队管理的5个核心原则和10个具体实施技巧，提升团队协作效率",
        text_en:
          "Provide 5 core principles and 10 practical techniques for team management to improve collaboration efficiency",
      },
    ],
    description: "专注于商业、管理和创业相关问题",
    description_en: "Focused on business, management, and entrepreneurship",
  },
  {
    agentType: "education",
    agentName: "教育助手",
    agentName_en: "Education Assistant",
    defaultQuestions: [
      {
        id: "education-method-1",
        text: "详细介绍费曼学习法、番茄工作法、间隔重复法等6种科学学习方法的具体操作步骤",
        text_en:
          "Detail 6 scientific learning methods including the Feynman Technique, Pomodoro Technique, and Spaced Repetition with step-by-step instructions",
      },
      {
        id: "education-plan-1",
        text: "提供一个完整的个人学习计划模板，包括目标设定、时间分配和进度跟踪方法",
        text_en:
          "Provide a complete personal study plan template including goal setting, time allocation, and progress tracking",
      },
      {
        id: "education-motivation-1",
        text: "分享8个保持长期学习动力的心理技巧和实用方法，克服学习倦怠",
        text_en:
          "Share 8 psychological tips and practical methods to maintain long-term learning motivation and overcome burnout",
      },
    ],
    description: "专注于教育、学习和技能发展",
    description_en: "Focused on education, learning, and skill development",
  },
  {
    agentType: "chatbi",
    agentName: "ChatBI助手",
    agentName_en: "ChatBI Assistant",
    defaultQuestions: [
      {
        id: "chatbi-stock-compare-1",
        text: "对比2024年贵州茅台和五粮液的股价表现",
        text_en:
          "Compare the stock performance of Kweichow Moutai and Wuliangye in 2024",
      },
      {
        id: "chatbi-stock-arima-1",
        text: "预测贵州茅台未来7天的收盘价",
        text_en:
          "Predict the closing price of Kweichow Moutai for the next 7 days",
      },
      {
        id: "chatbi-stock-prophet-1",
        text: "分析国泰君安近一年的周期性规律",
        text_en:
          "Analyze the cyclical patterns of Guotai Junan Securities over the past year",
      },
    ],
    description:
      "专业的股票数据分析助手🐟，专注于股票分析（贵州茅台、五粮液、国泰君安、中芯国际），提供SQL查询、数据可视化、股票预测和技术分析！",
    description_en:
      "Professional stock data analysis assistant 🐟, specializing in stock analysis with SQL queries, data visualization, stock prediction, and technical analysis!",
  },
  {
    agentType: "text_to_image",
    agentName: "AI文生图助手",
    agentName_en: "AI Image Generator",
    defaultQuestions: [
      {
        id: "text-to-image-landscape-1",
        text: "请生成一幅夕阳下的海滩场景：金色沙滩、椰子树剪影、海浪轻拍，动漫风格，色彩温暖",
        text_en:
          "Generate a sunset beach scene: golden sand, coconut tree silhouettes, gentle waves, anime style, warm colors",
      },
      {
        id: "text-to-image-character-1",
        text: "创作可爱机器人角色：圆润外形、蓝白配色、大眼睛、友善表情，卡通风格，适合儿童",
        text_en:
          "Create a cute robot character: rounded shape, blue-white color scheme, big eyes, friendly expression, cartoon style, suitable for children",
      },
      {
        id: "text-to-image-abstract-1",
        text: "设计抽象艺术作品表达快乐：明亮色彩、流动线条、阳光元素、温暖色调，现代艺术风格",
        text_en:
          "Design an abstract artwork expressing joy: bright colors, flowing lines, sun elements, warm tones, modern art style",
      },
    ],
    description:
      "创意无限的AI绘画师小鱼🐟，能根据你的文字描述生成精美图像，让想象变成现实！",
    description_en:
      "Creative AI painter 🐟, generating stunning images from your text descriptions, turning imagination into reality!",
  },
  {
    agentType: "food_recommendation",
    agentName: "美食推荐助手",
    agentName_en: "Food Recommendation Assistant",
    defaultQuestions: [
      {
        id: "food-local-1",
        text: "推荐北京3家适合商务宴请的餐厅",
        text_en:
          "Recommend 3 restaurants in Beijing suitable for business dinners",
      },
      {
        id: "food-romantic-1",
        text: "推荐成都3家适合约会的浪漫西餐厅",
        text_en:
          "Recommend 3 romantic Western restaurants in Chengdu perfect for dates",
      },
      {
        id: "food-gathering-1",
        text: "推荐上海2家适合朋友聚会的热闹火锅店",
        text_en:
          "Recommend 2 lively hot pot restaurants in Shanghai for group gatherings",
      },
    ],
    description:
      "贴心的美食向导小鱼🐟，精通各地美食文化，为你推荐最适合的餐厅和美味！",
    description_en:
      "Caring food guide 🐟, well-versed in culinary cultures, recommending the best restaurants and delicious food for you!",
  },
  {
    agentType: "train_ticket",
    agentName: "火车票查询助手",
    agentName_en: "Train Ticket Assistant",
    defaultQuestions: [
      {
        id: "train-ticket-query-1",
        text: "查询今日北京到上海的所有高铁班次，显示发车时间、到达时间、历时和票价信息",
        text_en:
          "Search all high-speed trains from Beijing to Shanghai today, showing departure time, arrival time, duration, and fare",
      },
      {
        id: "train-ticket-schedule-1",
        text: "提供G1次列车的完整时刻表，包括所有停靠站点、到发时间和停车时长",
        text_en:
          "Provide the complete timetable for train G1, including all stops, arrival/departure times, and stop duration",
      },
      {
        id: "train-ticket-station-1",
        text: "查询北京南站今日所有出发车次，按时间排序显示目的地、车次号和余票情况",
        text_en:
          "Search all departing trains from Beijing South Station today, sorted by time with destinations, train numbers, and availability",
      },
    ],
    description:
      "专业的火车票查询助手🚄，基于12306官方数据，为您提供准确可靠的火车出行信息！",
    description_en:
      "Professional train ticket assistant 🚄, providing accurate and reliable train travel information based on official data!",
  },
  {
    agentType: "fortune_teller",
    agentName: "算命先生",
    agentName_en: "Fortune Teller",
    defaultQuestions: [
      {
        id: "fortune-teller-bazi-1",
        text: "详细解释八字命理的基本原理，包括天干地支、五行相生相克和命盘分析方法",
        text_en:
          "Explain the basic principles of BaZi (Eight Characters) fortune-telling, including Heavenly Stems, Earthly Branches, and the Five Elements",
      },
      {
        id: "fortune-teller-career-1",
        text: "分析不同五行属性的人适合的职业方向，以及如何根据八字选择最佳发展时机",
        text_en:
          "Analyze suitable career directions based on the Five Elements, and how to choose optimal development timing using BaZi",
      },
      {
        id: "fortune-teller-love-1",
        text: "解读传统命理中的桃花运概念，包括桃花星的含义和如何通过八字看婚姻缘分",
        text_en:
          "Interpret the concept of Peach Blossom Luck in traditional fortune-telling, including its meaning and how to read marriage prospects through BaZi",
      },
    ],
    description:
      "精通传统命理学的算命先生🔮，擅长八字分析、运势预测，为您指点人生迷津！",
    description_en:
      "Master of traditional Chinese fortune-telling 🔮, skilled in BaZi analysis and destiny prediction, guiding you through life!",
  },
];

// 根据agent类型获取推荐问题
export function getQuestionsByAgentType(
  agentType?: string,
  lang?: string,
): QuestionConfig[] {
  const questions = getRawQuestionsByAgentType(agentType);
  if (lang === "en") {
    return questions.map((q) => ({
      ...q,
      text: q.text_en || q.text,
    }));
  }
  return questions;
}

function getRawQuestionsByAgentType(agentType?: string): QuestionConfig[] {
  if (!agentType) {
    return DEFAULT_QUESTIONS;
  }

  const config = AGENT_QUESTIONS_CONFIG.find(
    (config) => config.agentType === agentType,
  );
  return config ? config.defaultQuestions : DEFAULT_QUESTIONS;
}

// 获取所有可用的agent类型
export function getAvailableAgentTypes(): string[] {
  return AGENT_QUESTIONS_CONFIG.map((config) => config.agentType);
}

// 根据agent类型获取agent名称
export function getAgentName(agentType?: string, lang?: string): string {
  if (!agentType) {
    return lang === "en" ? "Smart Partner Fish" : "智能伙伴小鱼";
  }

  const config = AGENT_QUESTIONS_CONFIG.find(
    (config) => config.agentType === agentType,
  );
  if (!config) {
    return lang === "en" ? "Smart Partner Fish" : "智能伙伴小鱼";
  }
  return lang === "en" && config.agentName_en
    ? config.agentName_en
    : config.agentName;
}

// 获取agent描述
export function getAgentDescription(agentType?: string, lang?: string): string {
  if (!agentType) {
    return lang === "en"
      ? "Your caring smart partner, capable of chatting, answering questions, searching for information, looking up maps, just like a versatile assistant!"
      : "你的贴心智能伙伴，能聊天解答、搜索信息、查地图路线，就像身边的万能助手！";
  }

  const config = AGENT_QUESTIONS_CONFIG.find(
    (config) => config.agentType === agentType,
  );
  if (!config) {
    return lang === "en"
      ? "Your caring smart partner, capable of chatting, answering questions, searching for information, looking up maps, just like a versatile assistant!"
      : "你的贴心智能伙伴，能聊天解答、搜索信息、查地图路线，就像身边的万能助手！";
  }
  return lang === "en" && config.description_en
    ? config.description_en
    : config.description || "";
}

// 验证问题配置的有效性
export function validateQuestionConfig(config: AgentQuestionsConfig): boolean {
  if (!config.agentType || !config.agentName || !config.defaultQuestions) {
    return false;
  }

  if (
    !Array.isArray(config.defaultQuestions) ||
    config.defaultQuestions.length === 0
  ) {
    return false;
  }

  return config.defaultQuestions.every(
    (q) => q.id && q.text && q.text.trim().length > 0,
  );
}

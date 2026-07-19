(function () {
  var root = document.getElementById("portfolioAi");
  if (!root) return;

  var messagesEl = document.getElementById("portfolioAiMessages");
  var form = document.getElementById("portfolioAiForm");
  var input = document.getElementById("portfolioAiInput");
  var prompts = document.getElementById("portfolioAiPrompts");
  var resetBtn = document.getElementById("portfolioAiReset");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var busy = false;

  var KB = {
    name: "Brielle Picard",
    shortName: "Brielle",
    tagline:
      "AI-fluent digital builder — websites, products, content systems, measurable outcomes. Open across industries.",
    school: "Penn State — College of Information Sciences and Technology",
    degree: "B.S. Human-Centered Design and Development (HCDD)",
    grad: "Expected May 2027",
    focus: "Social Media Trends and Analytics",
    gpa: "3.47",
    deans: "Dean’s List Fall 2024 and Spring 2025",
    email: "briellepicard@icloud.com",
    phone: "(978) 337-0817",
    linkedin: "https://www.linkedin.com/in/brielle-picard-4519b7318",
    resume: "assets/resume.pdf",
    contact: "contact.html",
    about: "about.html",
    work: "work.html",
    portfolioCase: "project-portfolio.html",
    salesCase: "project-sales-gauge.html",
    afaCase: "project-afa.html",
    genaiCase: "project-genai.html",
    olderPortfolio: "https://bop5188-web.github.io/Portfolio/#/",
    tradeTable: "https://github.com/bop5188-web/SalesGaugeTradeTable",
    salesSite: "https://www.sales-gauge.com/",
    skills: {
      design: [
        "Wireframing",
        "Prototyping",
        "Website design",
        "Figma",
        "Usability testing",
      ],
      technical: [
        "JavaScript",
        "HTML",
        "CSS",
        "Python",
        "SQL",
        "API integration",
        "MongoDB basics",
      ],
      ai: [
        "Prompt engineering",
        "LangChain / OpenAI",
        "ChatGPT / Claude / Gemini",
        "Cursor",
        "LLM conversation UX",
        "Responsible AI use",
      ],
      analytics: [
        "Google Analytics (certified)",
        "Social media analytics",
        "SEO / content strategy",
      ],
      professional: [
        "Client collaboration",
        "Project coordination",
        "Stakeholder communication",
      ],
    },
  };

  function answerFor(raw) {
    var q = (raw || "").toLowerCase().trim();
    if (!q) {
      return {
        text: "Ask about Brielle’s experience, AI skills, projects, education, or how to get in touch.",
        links: [],
      };
    }

    if (/(hello|hi\b|hey|who are you|what are you)/.test(q)) {
      return {
        text:
          "I’m BrieBot — a guide to Brielle Picard’s work. Ask about Sales Gauge, AFA, generative AI, skills, or contact details.",
        links: [
          { href: KB.about, label: "About" },
          { href: KB.resume, label: "Resume PDF" },
        ],
      };
    }

    if (/(elevator|pitch|introduce|summary|tl;?dr|who is brielle|about brielle|tell me about)/.test(q)) {
      return {
        text:
          "30-second pitch: Brielle Picard is a Penn State IST senior (HCDD, expected May 2027; GPA 3.47) seeking her first full-time role. She’s an AI-fluent digital builder — websites, product prototypes, content systems, and measurable growth. At Sales Gauge she helped drive +162% monthly users / +156% engagement and built a High Value Trade Table web app to replace Excel. She also consults with AFA Women’s Health on branding and podcast production. Open across industries.",
        links: [
          { href: KB.resume, label: "Download resume" },
          { href: "mailto:" + KB.email, label: "Email Brielle" },
        ],
      };
    }

    if (/(sales gauge|squarespace|pipeline|trade table|hvt|\+162|162%|engagement|spaice)/.test(q)) {
      return {
        text:
          "At Sales Gauge (Dec 2024–present, working with the founder), Brielle led website redesign/build work tied to +162% monthly users and +156% engagement. She proposed and built a High Value Trade Table web product (auth, MongoDB, share links) to replace Excel negotiation workflows, and used AI tools for research/social drafts while supporting AI product surfaces like $pAIce.",
        links: [
          { href: KB.salesCase, label: "Sales Gauge case study" },
          { href: KB.tradeTable, label: "Trade Table repo", external: true },
          { href: KB.salesSite, label: "Live site", external: true },
        ],
      };
    }

    if (/(emerson|obgyn|hospital|podcast|patient|afa|women.?s health|late period)/.test(q)) {
      return {
        text:
          "With AFA Women’s Health (independent contractor), Brielle supported branding, podcast production ops, and digital experience — including shoot-day scheduling and episode frameworks for “The Late Period.” She used AI for outlines/content drafts, then edited for brand and sensitivity. Public metrics aren’t released yet.",
        links: [
          { href: KB.afaCase, label: "AFA case study" },
          { href: KB.resume, label: "Resume" },
        ],
      };
    }

    if (/(genai|generative|langchain|openai|chatgpt|claude|gemini|cursor|prompt|llm|ai\b|art gallery|chatbot|ist 402)/.test(q)) {
      return {
        text:
          "AI is a core part of Brielle’s profile: (1) Built an Art Gallery chatbot with Streamlit + LangChain + OpenAI; (2) Completed IST 402 Applied Generative AI (models, multimodal apps, ethics); (3) Uses Claude, Gemini, ChatGPT, and Cursor daily for research, drafts, and coding — with review, not blind trust.",
        links: [
          { href: KB.genaiCase, label: "Applied GenAI case study" },
          { href: "#portfolio-ai", label: "You’re talking to BrieBot" },
        ],
      };
    }

    if (/(experience|work history|job|role|intern|associate|consultant)/.test(q)) {
      return {
        text:
          "Recent experience:\n\n1) Sales Gauge — Product Design & Digital Experience Associate (website + Trade Table product; +162% users).\n\n2) AFA Women’s Health — UX Strategy & Digital Marketing Consultant (brand, podcast ops, AI-assisted content).\n\nEducation: Penn State HCDD + Applied Generative AI coursework, expected May 2027.",
        links: [
          { href: "#experience", label: "See timeline" },
          { href: KB.work, label: "Projects" },
        ],
      };
    }

    if (/(skill|strength|tools|figma|python|sql|analytics|certif|google analytics|bootstrap|wireframe)/.test(q)) {
      return {
        text:
          "Skill groups:\n\n• Design & UX — " +
          KB.skills.design.join("; ") +
          "\n• Technical — " +
          KB.skills.technical.join("; ") +
          "\n• Generative AI — " +
          KB.skills.ai.join("; ") +
          "\n• Analytics & marketing — " +
          KB.skills.analytics.join("; ") +
          "\n• Professional — " +
          KB.skills.professional.join("; ") +
          "\n\nGoogle Analytics certified.",
        links: [
          { href: "#skills", label: "Skills on home" },
          { href: KB.genaiCase, label: "AI case study" },
        ],
      };
    }

    if (/(school|penn|education|student|major|degree|ist|gradu|gpa|dean)/.test(q)) {
      return {
        text:
          "Education: " +
          KB.degree +
          " at " +
          KB.school +
          " (" +
          KB.grad +
          "). Focus: " +
          KB.focus +
          ". GPA " +
          KB.gpa +
          ". " +
          KB.deans +
          ". Also completed IST 402 Applied Generative AI.",
        links: [{ href: KB.about, label: "About" }],
      };
    }

    if (/(hiring|fit|recruit|available|opportun|looking for)/.test(q)) {
      return {
        text:
          "Brielle is seeking her first full-time role (also open to strong internships). She’s industry-flexible — digital experience, product, marketing, ops, analytics, AI-adjacent, coordinator, or similar junior roles. The portfolio is written for broad employers, not only design titles.",
        links: [
          { href: "mailto:" + KB.email, label: "Email Brielle" },
          { href: KB.resume, label: "Resume" },
        ],
      };
    }

    if (/(project|case study|portfolio|which.*first)/.test(q)) {
      return {
        text:
          "Start with Sales Gauge (impact + Trade Table), then Applied Generative AI, then AFA Women’s Health. “This portfolio” is the craft/shipping story. Older class demos live in an archive linked from About.",
        links: [
          { href: KB.salesCase, label: "Sales Gauge" },
          { href: KB.genaiCase, label: "GenAI" },
          { href: KB.work, label: "All projects" },
        ],
      };
    }

    if (/(interview|questions|prep|ask me)/.test(q)) {
      return {
        text:
          "Strong interview prompts:\n\n1. Walk through Sales Gauge — how did website work connect to +162% / +156%?\n2. How did you turn an Excel High Value Trade workflow into a web product?\n3. How do you use AI day-to-day without shipping unchecked output?\n4. Describe coordinating AFA branding/podcast production with clinical stakeholders.",
        links: [
          { href: KB.salesCase, label: "Sales Gauge" },
          { href: KB.genaiCase, label: "GenAI" },
        ],
      };
    }

    if (/(contact|email|phone|linkedin|reach|hire|connect|resume)/.test(q)) {
      return {
        text:
          "Reach Brielle at:\n\n• Email — " +
          KB.email +
          "\n• Phone — " +
          KB.phone +
          "\n• LinkedIn — brielle-picard\n• Resume PDF on this site",
        links: [
          { href: KB.contact, label: "Contact page" },
          { href: "mailto:" + KB.email, label: "Email" },
          { href: KB.linkedin, label: "LinkedIn", external: true },
          { href: KB.resume, label: "Resume PDF" },
        ],
      };
    }

    if (/(differentiator|unique|why brielle|stand out)/.test(q)) {
      return {
        text:
          "Differentiator: measurable business outcomes (Sales Gauge growth), product thinking (Excel → web tool), and real AI fluency — built apps, coursework, and daily tool use — not buzzwords alone.",
        links: [{ href: KB.resume, label: "Resume" }],
      };
    }

    return {
      text:
        "Try asking about Sales Gauge, AFA, generative AI, skills, education, interview prep, or contact/resume.",
      links: [
        { href: KB.work, label: "Projects" },
        { href: "#skills", label: "Skills" },
        { href: KB.resume, label: "Resume" },
      ],
    };
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function appendMessage(role, payload) {
    var row = el("div", "portfolio-ai__msg portfolio-ai__msg--" + role);
    var bubble = el("div", "portfolio-ai__bubble");

    if (typeof payload === "string") {
      bubble.textContent = payload;
    } else {
      var parts = (payload.text || "").split("\n");
      parts.forEach(function (line, idx) {
        if (!line && idx < parts.length - 1) {
          bubble.appendChild(document.createElement("br"));
          return;
        }
        if (idx) bubble.appendChild(document.createElement("br"));
        bubble.appendChild(document.createTextNode(line));
      });

      if (payload.links && payload.links.length) {
        var links = el("div", "portfolio-ai__links");
        payload.links.forEach(function (l) {
          var a = el("a", "portfolio-ai__link", l.label);
          a.href = l.href;
          if (l.external) {
            a.target = "_blank";
            a.rel = "noopener noreferrer";
          }
          links.appendChild(a);
        });
        bubble.appendChild(links);
      }
    }

    row.appendChild(bubble);
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return bubble;
  }

  function showTyping() {
    var row = el("div", "portfolio-ai__msg portfolio-ai__msg--bot portfolio-ai__msg--typing");
    var bubble = el("div", "portfolio-ai__bubble portfolio-ai__bubble--typing");
    bubble.innerHTML = "<span></span><span></span><span></span>";
    bubble.setAttribute("aria-label", "BrieBot is thinking");
    row.appendChild(bubble);
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return row;
  }

  function typeInto(bubble, answer) {
    return new Promise(function (resolve) {
      if (reduceMotion) {
        bubble.textContent = "";
        var parts = answer.text.split("\n");
        parts.forEach(function (line, idx) {
          if (idx) bubble.appendChild(document.createElement("br"));
          bubble.appendChild(document.createTextNode(line));
        });
        if (answer.links && answer.links.length) {
          var links = el("div", "portfolio-ai__links");
          answer.links.forEach(function (l) {
            var a = el("a", "portfolio-ai__link", l.label);
            a.href = l.href;
            if (l.external) {
              a.target = "_blank";
              a.rel = "noopener noreferrer";
            }
            links.appendChild(a);
          });
          bubble.appendChild(links);
        }
        resolve();
        return;
      }

      var full = answer.text;
      var i = 0;
      bubble.textContent = "";

      function tick() {
        i += 1 + (i % 3 === 0 ? 1 : 0);
        var slice = full.slice(0, i);
        bubble.textContent = "";
        slice.split("\n").forEach(function (line, idx) {
          if (idx) bubble.appendChild(document.createElement("br"));
          bubble.appendChild(document.createTextNode(line));
        });
        messagesEl.scrollTop = messagesEl.scrollHeight;
        if (i < full.length) {
          window.setTimeout(tick, 12);
        } else {
          if (answer.links && answer.links.length) {
            var links = el("div", "portfolio-ai__links");
            answer.links.forEach(function (l) {
              var a = el("a", "portfolio-ai__link", l.label);
              a.href = l.href;
              if (l.external) {
                a.target = "_blank";
                a.rel = "noopener noreferrer";
              }
              links.appendChild(a);
            });
            bubble.appendChild(links);
          }
          resolve();
        }
      }
      tick();
    });
  }

  function ask(question) {
    if (busy || !question) return;
    busy = true;
    appendMessage("user", question);
    var typing = showTyping();
    var answer = answerFor(question);

    window.setTimeout(function () {
      typing.remove();
      var bubble = appendMessage("bot", "");
      bubble.textContent = "";
      typeInto(bubble, answer).then(function () {
        busy = false;
        messagesEl.scrollTop = messagesEl.scrollHeight;
      });
    }, reduceMotion ? 80 : 420);
  }

  function resetChat(opts) {
    var shouldFocus = !opts || opts.focus !== false;
    messagesEl.innerHTML = "";
    busy = false;
    appendMessage("bot", {
      text:
        "Hi — I’m BrieBot. Ask about Sales Gauge, AFA, generative AI, skills, or how to reach Brielle.",
      links: [
        { href: "#experience", label: "Experience" },
        { href: KB.resume, label: "Resume" },
      ],
    });
    if (shouldFocus && input) input.focus();
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = (input.value || "").trim();
      if (!q) return;
      input.value = "";
      ask(q);
    });
  }

  if (prompts) {
    prompts.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-prompt]");
      if (!btn) return;
      ask(btn.getAttribute("data-prompt"));
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      resetChat({ focus: true });
    });
  }

  /* Don’t autofocus on load — that scrolls the homepage to the AI section */
  resetChat({ focus: false });
})();

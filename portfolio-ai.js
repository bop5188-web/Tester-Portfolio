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
    tagline: "Design that makes things clearer and kinder for real people.",
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
    about: "about.html",
    work: "work.html",
    portfolioCase: "work/project-portfolio.html",
    olderPortfolio: "https://bop5188-web.github.io/Portfolio/#/",
    skills: {
      design: [
        "Wireframing",
        "Prototyping (low & high fidelity)",
        "Personas & scenarios",
        "Accessibility-focused design",
        "Usability testing / interviews / surveys",
        "Website design",
        "Figma",
        "Adobe Photoshop / Illustrator / Lightroom",
      ],
      technical: [
        "JavaScript",
        "HTML",
        "CSS",
        "Bootstrap",
        "Python",
        "SQL",
        "API integration",
        "AI prompt engineering",
        "IntelliJ IDEA",
        "Wireshark",
        "Microsoft Excel / Word / PowerPoint",
        "Canva",
      ],
      analytics: [
        "Google Analytics (certified)",
        "Social media analytics",
        "Data visualization",
        "SEO / content strategy",
        "Social media management",
        "AI-assisted tools",
      ],
      professional: [
        "Client collaboration",
        "Agile problem-solving",
        "Leadership",
        "Teamwork",
      ],
    },
    roles: [
      {
        org: "Sales Gauge",
        title: "Product Design & Digital Experience Associate",
        bullets: [
          "Led end-to-end website redesign/implementation (Squarespace + front-end customization) with the founder over a 3-week cycle; +162% monthly users.",
          "Redesigned structure, navigation, and content hierarchy; +156% user engagement.",
          "Designed/built a B2B sales pipeline to replace Excel-based deal tracking.",
          "Improved digital presence supporting leads, acquisition, and client growth.",
        ],
      },
      {
        org: "Emerson Hospital – AFA OBGYN",
        title: "UX Strategy & Digital Marketing Consultant",
        bullets: [
          "Led digital experience and marketing initiatives to improve patient engagement and brand presence.",
          "Defined UX strategy for a commercial podcast (content structure, episode frameworks).",
          "Coordinated media production (photoshoots, video, host selection, logistics).",
          "Redesigned website UX in Figma — IA, SEO, and content structure for better patient navigation.",
        ],
      },
    ],
  };

  function answerFor(raw) {
    var q = (raw || "").toLowerCase().trim();
    if (!q) {
      return {
        text: "Ask about Brielle’s experience, skills, education, or how to get in touch.",
        links: [],
      };
    }

    if (/(hello|hi\b|hey|who are you|what are you)/.test(q)) {
      return {
        text:
          "I’m BrieBot — a guide to Brielle Picard’s portfolio and resume. Ask about roles at Sales Gauge or Emerson, her skill groups, Penn State HCDD, or contact details.",
        links: [
          { href: KB.about, label: "About" },
          { href: KB.resume, label: "Resume PDF" },
        ],
      };
    }

    if (/(elevator|pitch|introduce|summary|tl;?dr|who is brielle|about brielle|tell me about)/.test(q)) {
      return {
        text:
          "30-second pitch: Brielle Picard is a Penn State IST student pursuing a B.S. in Human-Centered Design & Development (expected May 2027; GPA 3.47, Dean’s List). She designs clearer digital experiences across product and marketing — recently as Product Design & Digital Experience Associate at Sales Gauge (website redesign driving +162% monthly users) and as UX Strategy & Digital Marketing Consultant for Emerson Hospital’s AFA OBGYN. Toolkit spans Figma/UX research, front-end (HTML/CSS/JS), and analytics (Google Analytics certified).",
        links: [
          { href: KB.resume, label: "Download resume" },
          { href: "mailto:" + KB.email, label: "Email Brielle" },
        ],
      };
    }

    if (/(sales gauge|squarespace|pipeline|\+162|162%|engagement)/.test(q)) {
      return {
        text:
          "At Sales Gauge (Product Design & Digital Experience Associate), Brielle led a founder-partnered website redesign/build, improving IA and usability — results included +162% monthly users and +156% engagement. She also designed a B2B sales pipeline system to replace Excel-based tracking and support scalable deal workflows.",
        links: [
          { href: "#experience", label: "Experience on home" },
          { href: KB.resume, label: "Resume" },
        ],
      };
    }

    if (/(emerson|obgyn|hospital|podcast|patient)/.test(q)) {
      return {
        text:
          "At Emerson Hospital – AFA OBGYN (UX Strategy & Digital Marketing Consultant), Brielle led digital experience and marketing work: Figma website UX/SEO redesign, podcast content frameworks for audience growth, media production logistics, and cohesive branding across web and social for stronger patient engagement.",
        links: [
          { href: "#experience", label: "Experience on home" },
          { href: KB.resume, label: "Resume" },
        ],
      };
    }

    if (/(experience|work history|job|role|intern|associate|consultant)/.test(q)) {
      return {
        text:
          "Recent experience:\n\n1) Sales Gauge — Product Design & Digital Experience Associate (website redesign, IA, sales pipeline system; +162% monthly users).\n\n2) Emerson Hospital – AFA OBGYN — UX Strategy & Digital Marketing Consultant (Figma UX, podcast strategy, campaigns, branding).\n\nEducation: Penn State HCDD, expected May 2027.",
        links: [
          { href: "#experience", label: "See timeline" },
          { href: KB.resume, label: "Full resume" },
        ],
      };
    }

    if (/(skill|strength|tools|figma|python|sql|analytics|certif|google analytics|bootstrap|wireframe)/.test(q)) {
      return {
        text:
          "Skill groups from her resume:\n\n• Design & UX — " +
          KB.skills.design.slice(0, 6).join("; ") +
          "\n• Technical — " +
          KB.skills.technical.slice(0, 7).join("; ") +
          "\n• Analytics & marketing — " +
          KB.skills.analytics.join("; ") +
          "\n• Professional — " +
          KB.skills.professional.join("; ") +
          "\n\nShe’s Google Analytics certified. Hover experience ↔ skills on the homepage to see how they connect.",
        links: [
          { href: "#skills", label: "Skills on home" },
          { href: "#experience", label: "Experience" },
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
          "). Focus area: " +
          KB.focus +
          ". GPA " +
          KB.gpa +
          ". " +
          KB.deans +
          ".",
        links: [{ href: KB.about, label: "About" }],
      };
    }

    if (/(intern|job|hiring|role|fit|recruit|available|opportun)/.test(q)) {
      return {
        text:
          "Brielle is an HCDD student open to showcasing skills across UX/UI, product design, digital experience, and marketing analytics. Her recent work mixes research-informed design, front-end implementation, and measurable growth outcomes. Best fits: UX/UI, product design, digital marketing with a UX lens, or design-adjacent internships.",
        links: [
          { href: "mailto:" + KB.email, label: "Email Brielle" },
          { href: KB.resume, label: "Resume" },
        ],
      };
    }

    if (/(project|case study|portfolio|which.*first)/.test(q)) {
      return {
        text:
          "On this site, start with the “This portfolio” case study. Her resume highlights Sales Gauge (website + pipeline) and Emerson AFA OBGYN (healthcare UX + marketing) as primary professional work. There’s also an older project archive linked from About.",
        links: [
          { href: KB.portfolioCase, label: "Portfolio case study" },
          { href: KB.work, label: "All projects" },
        ],
      };
    }

    if (/(interview|questions|prep|ask me)/.test(q)) {
      return {
        text:
          "Strong interview prompts for Brielle:\n\n1. Walk through the Sales Gauge redesign — how did you validate IA decisions and ship in three weeks?\n2. How did you approach healthcare UX/SEO for Emerson AFA OBGYN with clinical stakeholders?\n3. You proposed replacing Excel with a B2B pipeline — how did you define requirements and scope?\n4. How do analytics (Google Analytics / social) inform your design choices?",
        links: [
          { href: "#experience", label: "Experience" },
          { href: KB.resume, label: "Resume" },
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
          "\n• LinkedIn — brielle-picard\n• Resume PDF available on this site",
        links: [
          { href: "mailto:" + KB.email, label: "Email" },
          { href: KB.linkedin, label: "LinkedIn", external: true },
          { href: KB.resume, label: "Resume PDF" },
        ],
      };
    }

    if (/(differentiator|unique|why brielle|stand out)/.test(q)) {
      return {
        text:
          "Differentiator: she pairs human-centered UX craft with measurable digital outcomes (e.g. Sales Gauge traffic/engagement lifts) and can move from Figma strategy into front-end implementation and analytics. Useful design first — cool when it earns it.",
        links: [{ href: KB.resume, label: "Resume" }],
      };
    }

    return {
      text:
        "Try asking about Sales Gauge, Emerson AFA OBGYN, skills/tools, education, interview prep, or contact/resume.",
      links: [
        { href: "#experience", label: "Experience" },
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

  function resetChat() {
    messagesEl.innerHTML = "";
    busy = false;
    appendMessage("bot", {
      text:
        "Hi — I’m BrieBot. Ask anything about Brielle’s experience, skills, education, or how to reach her.",
      links: [
        { href: "#experience", label: "Experience" },
        { href: KB.resume, label: "Resume" },
      ],
    });
    if (input) input.focus();
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
    resetBtn.addEventListener("click", resetChat);
  }

  resetChat();
})();

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
    school: "Penn State (IST)",
    degree: "B.S. in Human-Centered Design & Development",
    role: "IST student · designer–builder · digital marketing & UI/UX intern",
    email: "briellepicard@icloud.com",
    phone: "(978) 337-0817",
    linkedin: "https://www.linkedin.com/in/brielle-picard-4519b7318",
    olderPortfolio: "https://bop5188-web.github.io/Portfolio/#/",
    about: "about.html",
    work: "work.html",
    portfolioCase: "work/project-portfolio.html",
    skills: {
      people: ["User interviews & surveys", "Usability testing", "Personas & scenarios"],
      craft: ["Wireframes & flows", "Figma prototypes", "Accessible, logical layouts"],
      build: ["HTML, CSS & JavaScript", "Responsive front-end", "Learning React"],
      bridge: [
        "Clear handoffs & documentation",
        "Collaboration & feedback loops",
        "Data-informed tweaks (analytics)",
      ],
    },
  };

  function linkify(html) {
    return html;
  }

  function answerFor(raw) {
    var q = (raw || "").toLowerCase().trim();
    if (!q) {
      return {
        text:
          "Ask me anything about Brielle — background, skills, projects, interview prep, or how to reach her.",
        links: [],
      };
    }

    if (/(hello|hi\b|hey|who are you|what are you)/.test(q)) {
      return {
        text:
          "I’m BrieBot — a guide for Brielle Picard’s portfolio. I know her bio, skills, schooling, and the work on this site. Recruiters often start with an elevator pitch, skills fit, or which project to open first.",
        links: [
          { href: KB.about, label: "About" },
          { href: KB.work, label: "All projects" },
        ],
      };
    }

    if (/(elevator|pitch|introduce|summary|tl;?dr|who is brielle|about brielle|tell me about)/.test(q)) {
      return {
        text:
          "30-second pitch: Brielle Picard is a Penn State IST student pursuing a B.S. in Human-Centered Design & Development. She designs to make products clearer and kinder — pairing research (interviews, usability, personas) with Figma prototyping and front-end build skills (HTML/CSS/JS, learning React). She’s interning in digital marketing & UI/UX, and this site is both her portfolio and a living case study of iteration. She’s looking for teams that value useful craft over decoration.",
        links: [
          { href: KB.about, label: "Full about page" },
          { href: "mailto:" + KB.email, label: "Email Brielle" },
        ],
      };
    }

    if (/(skill|strength|what can she|tools|figma|research|ux|ui|frontend|front-end|code|react)/.test(q)) {
      return {
        text:
          "Brielle plugs into product and design teams across four lanes:\n\n• Understand people — " +
          KB.skills.people.join("; ") +
          "\n• Shape the experience — " +
          KB.skills.craft.join("; ") +
          "\n• Build & iterate — " +
          KB.skills.build.join("; ") +
          "\n• Bridge teams — " +
          KB.skills.bridge.join("; ") +
          "\n\nShe’s especially strong when a role needs research empathy plus enough code to ship interactive ideas.",
        links: [
          { href: KB.about, label: "Skills on About" },
          { href: KB.work, label: "See projects" },
        ],
      };
    }

    if (/(school|penn|education|student|major|degree|ist|gradu)/.test(q)) {
      return {
        text:
          "Education: Brielle is pursuing a B.S. in Human-Centered Design & Development at Penn State (IST). She balances coursework with an internship in digital marketing & UI/UX and self-initiated portfolio builds like this site.",
        links: [{ href: KB.about, label: "About" }],
      };
    }

    if (/(intern|job|experience|work experience|hiring|role|fit|recruit)/.test(q)) {
      return {
        text:
          "Current: interning in digital marketing & UI/UX while studying HCDD at Penn State. Best-fit roles tend to sit at the design–product edge — UX/UI, product design, design systems, or design-engineer adjacent internships — where research, Figma, and front-end chops all matter. She thrives when the brief is “make it clearer for real people,” not decoration for its own sake.",
        links: [
          { href: KB.about, label: "About" },
          { href: "mailto:" + KB.email, label: "Reach out" },
        ],
      };
    }

    if (/(project|case study|portfolio|work|alpha|beta|gamma|delta|epsilon|which.*first|best project)/.test(q)) {
      return {
        text:
          "Start with “This portfolio” — it’s the only fully written case study on the site right now, and it’s meta on purpose: three renderings of the live site, from proof-of-concept to design system to Spline + neon interaction. Projects Alpha–Epsilon are placeholders reserved for upcoming write-ups. There’s also an older portfolio of prior experiments linked from About.",
        links: [
          { href: KB.portfolioCase, label: "This portfolio case study" },
          { href: KB.work, label: "All projects" },
          { href: KB.olderPortfolio, label: "Older portfolio", external: true },
        ],
      };
    }

    if (/(interview|questions|prep|ask me)/.test(q)) {
      return {
        text:
          "Three interview angles Brielle should be ready for (and that you can ask her):\n\n1. Walk me through a time you iterated based on feedback or usability findings — ideally using this portfolio’s three renderings.\n2. How do you decide when research is “enough” before shipping a prototype?\n3. You’re learning React — how do you balance design craft with growing engineering fluency?\n\nBonus: “Show me a layout choice you made for accessibility or clarity.”",
        links: [
          { href: KB.portfolioCase, label: "Portfolio process" },
          { href: KB.about, label: "Skills context" },
        ],
      };
    }

    if (/(contact|email|phone|linkedin|reach|hire|connect)/.test(q)) {
      return {
        text:
          "Happy to connect you:\n\n• Email — " +
          KB.email +
          "\n• Phone — " +
          KB.phone +
          "\n• LinkedIn — brielle-picard\n\nShe’s open to hearing about roles, collaborations, and feedback on the work.",
        links: [
          { href: "mailto:" + KB.email, label: "Email" },
          { href: KB.linkedin, label: "LinkedIn", external: true },
          { href: "tel:+19783370817", label: "Call" },
        ],
      };
    }

    if (/(available|open to|looking for|opportunity)/.test(q)) {
      return {
        text:
          "Brielle is building in public with this portfolio and balancing school + internship. If your team values human-centered craft, clear communication, and someone who can move from research into Figma and light front-end, she’d love to hear from you.",
        links: [{ href: "mailto:" + KB.email, label: "Email Brielle" }],
      };
    }

    if (/(differentiator|unique|why brielle|why her|stand out)/.test(q)) {
      return {
        text:
          "Differentiator: she treats this portfolio as process, not just a gallery — three explicit renderings, shared systems, accessibility focus, and enough code to make motion and interaction real. Pair that with a clear stance: useful first, cool second — never decoration for its own sake.",
        links: [{ href: KB.portfolioCase, label: "Read the case study" }],
      };
    }

    return {
      text:
        "I can help with Brielle’s background, skills, schooling, internship focus, which project to open first, interview prep questions, or contact info. Try one of the chips above, or ask something like “Would she fit a UX internship?”",
      links: [
        { href: KB.about, label: "About" },
        { href: KB.work, label: "Projects" },
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
        "Hi — I’m BrieBot. Ask me anything about Brielle’s experience, skills, projects, or how to get in touch.",
      links: [
        { href: KB.about, label: "About" },
        { href: KB.work, label: "Projects" },
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

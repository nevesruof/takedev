import{Mb as e,Nb as t}from"./i4hv75y0pok2g.olqfze.x.js";
import{s as projects}from"./sph866vka5urq.ckz5pp.x.js";
import{groups as stackGroups}from"./stack-tab.js?v=3";

const FRONTEND_SINCE = 2020;
const FULL_STACK_SINCE = 2023;

const links = {
  github: "https://github.com/iTakeDev",
  discord: "https://discord.com/users/1239908273885286546",
  telegram: "https://t.me/nevesruof",
};

const currentYear = new Date().getFullYear();

const numbers = [
  { label: "years on the frontend", value: currentYear - FRONTEND_SINCE, suffix: "" },
  { label: "years full stack", value: currentYear - FULL_STACK_SINCE, suffix: "" },
  { label: "commissions", value: 20, suffix: "+" },
  { label: "projects shipped", value: projects.length, suffix: "" },
];

const years = [...new Set(projects.map((project) => project.year))].sort().reverse();

const commands = ["help", "whoami", "now", "stack", "projects", "open", "contact", "theme", "date", "clear"];

function animateNumbers(root) {
  const nodes = root.querySelectorAll("[data-count]");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const duration = 1100;
  const start = performance.now();

  function frame(now) {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 4);
    for (const node of nodes) {
      node.textContent = String(Math.round(Number(node.dataset.count) * eased));
    }
    if (progress < 1) requestAnimationFrame(frame);
  }

  if (reduced) {
    for (const node of nodes) node.textContent = node.dataset.count;
    return;
  }

  requestAnimationFrame(frame);
}

function mountTerminal(root) {
  const screen = root.querySelector(".nw-screen");
  const form = root.querySelector(".nw-form");
  const input = root.querySelector(".nw-input");
  const history = [];
  let cursor = 0;

  function print(text, className = "") {
    const line = document.createElement("div");
    line.className = "nw-line " + className;
    line.textContent = text;
    screen.append(line);
    screen.scrollTop = screen.scrollHeight;
    return line;
  }

  function printLink(label, href) {
    const line = document.createElement("div");
    line.className = "nw-line";
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
    anchor.textContent = href;
    line.append(label.padEnd(10, " "), anchor);
    screen.append(line);
    screen.scrollTop = screen.scrollHeight;
  }

  const handlers = {
    help() {
      print("commands:", "nw-muted");
      print("  whoami      who is this");
      print("  now         what is going on right now");
      print("  stack       the technologies, grouped");
      print("  projects    everything shipped so far");
      print("  open <name> open a project's site");
      print("  contact     where to find me");
      print("  theme       switch between black and white");
      print("  date        current date");
      print("  clear       clear the screen");
    },
    whoami() {
      print("iTake (@cheatinformer)");
      print("full-stack dev shipping bots, web apps, and products.", "nw-muted");
      print("frontend since " + FRONTEND_SINCE + ", full stack since " + FULL_STACK_SINCE + ".", "nw-muted");
    },
    now() {
      print("status    no longer part of new projects");
      print("building  Larp Client, a Minecraft client");
      print("          visuals, HUD and modules", "nw-muted");
    },
    stack(args) {
      const query = args.join(" ").toLowerCase();
      const matches = stackGroups.filter((group) => !query || group.title.includes(query));
      if (!matches.length) {
        print("no group called '" + query + "'. try: " + stackGroups.map((group) => group.title).join(", "), "nw-muted");
        return;
      }
      for (const group of matches) {
        print(group.title.padEnd(10, " ") + group.items.map((item) => item[0]).join(", "));
      }
    },
    projects() {
      for (const project of projects) {
        const role = project.detail ? "  " + project.detail.role : "";
        print(project.year + "  " + project.name.padEnd(10, " ") + role);
      }
    },
    open(args) {
      const query = args.join(" ").toLowerCase();
      const project = projects.find((item) => item.name.toLowerCase() === query || item.id === query);
      if (!project) {
        print(query ? "no project called '" + query + "'." : "usage: open <project>", "nw-muted");
        return;
      }
      print("opening " + project.href + " ...", "nw-muted");
      window.open(project.href, "_blank", "noopener");
    },
    contact() {
      printLink("github", links.github);
      printLink("discord", links.discord);
      printLink("telegram", links.telegram);
    },
    theme() {
      const toggle = document.querySelector('button[aria-label="Toggle theme"]');
      if (!toggle) return;
      const box = root.getBoundingClientRect();
      toggle.dispatchEvent(
        new MouseEvent("click", { bubbles: true, clientX: box.left + box.width / 2, clientY: box.top + box.height / 2 }),
      );
      print("theme switched.", "nw-muted");
    },
    date() {
      print(new Date().toString());
    },
    clear() {
      screen.textContent = "";
    },
  };

  function run(raw) {
    const text = raw.trim();
    const echo = document.createElement("div");
    echo.className = "nw-line nw-echo";
    echo.textContent = "$ " + text;
    screen.append(echo);

    if (!text) return;
    history.push(text);
    cursor = history.length;

    const [name, ...args] = text.split(/\s+/);
    const handler = handlers[name.toLowerCase()];

    if (handler) handler(args);
    else if (name === "sudo") print("nice try.", "nw-muted");
    else print("command not found: " + name + ". type 'help'.", "nw-muted");

    screen.scrollTop = screen.scrollHeight;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    run(input.value);
    input.value = "";
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (cursor > 0) cursor -= 1;
      input.value = history[cursor] ?? "";
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (cursor < history.length) cursor += 1;
      input.value = history[cursor] ?? "";
    } else if (event.key === "Tab") {
      event.preventDefault();
      const typed = input.value.trim().toLowerCase();
      const match = typed && commands.find((command) => command.startsWith(typed));
      if (match) input.value = match;
    } else if (event.key === "l" && event.ctrlKey) {
      event.preventDefault();
      handlers.clear();
    }
  });

  root.addEventListener("click", (event) => {
    if (!window.getSelection()?.toString() && !event.target.closest("a")) input.focus({ preventScroll: true });
  });

  print("type 'help' to see what this can do.", "nw-muted");
}

function setup(root) {
  if (!root || root.dataset.ready) return;
  root.dataset.ready = "true";
  animateNumbers(root);
  mountTerminal(root.querySelector(".nw-terminal"));
}

function Stat({ item }) {
  return t("li", {
    className: "nw-number",
    children: [
      t("span", {
        className: "nw-value",
        children: [e("span", { "data-count": item.value, children: "0" }), item.suffix],
      }),
      e("span", { className: "nw-caption", children: item.label }),
    ],
  });
}

function Year({ year }) {
  const items = projects.filter((project) => project.year === year);

  return t("li", {
    className: "nw-year",
    children: [
      e("span", { className: "nw-year-label", children: year }),
      e("ul", {
        className: "nw-year-items",
        children: items.map((project) =>
          e(
            "li",
            {
              children: t("a", {
                href: project.href,
                target: "_blank",
                rel: "noreferrer",
                children: [project.name, project.detail ? e("small", { children: project.detail.role }) : null],
              }),
            },
            project.id,
          ),
        ),
      }),
    ],
  });
}

function Now() {
  return t("div", {
    className: "nw",
    ref: setup,
    children: [
      t("section", {
        className: "nw-section",
        children: [
          t("span", { className: "nw-label", children: [e("i", { className: "nw-pulse", "aria-hidden": true }), "now"] }),
          t("div", {
            className: "nw-status",
            children: [
              e("strong", { children: "no longer part of new projects" }),
              e("span", { children: "past work stays online, everything new is on hold." }),
            ],
          }),
          t("div", {
            className: "nw-build",
            children: [
              t("div", {
                className: "nw-build-head",
                children: [e("span", { className: "nw-build-name", children: "Larp Client" }), e("span", { className: "nw-tag", children: "in progress" })],
              }),
              e("p", { children: "a Minecraft client with visuals, a HUD and a module system." }),
            ],
          }),
        ],
      }),
      t("section", {
        className: "nw-section",
        children: [
          e("span", { className: "nw-label", children: "numbers" }),
          e("ul", { className: "nw-numbers", children: numbers.map((item) => e(Stat, { item }, item.label)) }),
        ],
      }),
      t("section", {
        className: "nw-section",
        children: [
          e("span", { className: "nw-label", children: "shipped" }),
          e("ol", { className: "nw-years", children: years.map((year) => e(Year, { year }, year)) }),
        ],
      }),
      t("section", {
        className: "nw-section",
        children: [
          e("span", { className: "nw-label", children: "terminal" }),
          t("div", {
            className: "nw-terminal",
            children: [
              e("div", { className: "nw-screen", "aria-live": "polite" }),
              t("form", {
                className: "nw-form",
                autoComplete: "off",
                children: [
                  e("span", { className: "nw-prompt", children: "$" }),
                  e("input", {
                    className: "nw-input",
                    type: "text",
                    spellCheck: false,
                    autoCapitalize: "off",
                    autoCorrect: "off",
                    "aria-label": "Terminal command",
                    placeholder: "help",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

export { Now as default };

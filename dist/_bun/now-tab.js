import{Mb as e,Nb as t}from"./i4hv75y0pok2g.olqfze.x.js";
import{s as projects}from"./sph866vka5urq.ckz5pp.x.js";
import{groups as stackGroups}from"./stack-tab.js?v=3";

const FRONTEND_SINCE = 2020;
const FULL_STACK_SINCE = 2023;
const USER = "guest";
const HOST = "itake";

const links = {
  github: "https://github.com/iTakeDev",
  discord: "https://discord.com/users/1239908273885286546",
  telegram: "https://t.me/nevesruof",
};

const currentYear = new Date().getFullYear();
const stackTotal = stackGroups.reduce((sum, group) => sum + group.items.length, 0);

const numbers = [
  { label: "years on the frontend", value: currentYear - FRONTEND_SINCE, suffix: "" },
  { label: "years full stack", value: currentYear - FULL_STACK_SINCE, suffix: "" },
  { label: "commissions", value: 20, suffix: "+" },
  { label: "projects shipped", value: projects.length, suffix: "" },
];

function projectsOf(year) {
  return projects.filter((project) => project.year === String(year));
}

const milestones = [
  { year: String(FRONTEND_SINCE), title: "frontend", text: "where it started: building interfaces." },
  { year: String(FULL_STACK_SINCE), title: "full stack", text: "moved past the frontend into bots, apps and products." },
  ...[2024, 2025, 2026].map((year) => ({
    year: String(year),
    title: projectsOf(year).length + " projects shipped",
    projects: projectsOf(year),
  })),
  { year: "now", title: "Larp Client", text: "building a Minecraft client. no longer part of new projects.", live: true },
];

const logo = [
  "    .--.    ",
  "   |o_o |   ",
  "   |:_/ |   ",
  "  //   \\ \\  ",
  " (|     | ) ",
  "/'\\_   _/`\\ ",
  "\\___)=(___/ ",
];

const commandNames = [
  "help", "ls", "cd", "pwd", "cat", "neofetch", "whoami", "hostname", "uname", "uptime", "date", "echo",
  "history", "sudo", "su", "now", "stack", "projects", "open", "contact", "about", "theme", "clear", "exit",
];

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

function revealTimeline(root) {
  const items = root.querySelectorAll(".nw-tl-item");
  if (!("IntersectionObserver" in window)) return;

  root.classList.add("is-scripted");
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.25 },
  );

  for (const item of items) observer.observe(item);
}

function projectLines(project) {
  const lines = [project.name + " (" + project.year + ")", project.desc, project.href];
  if (project.detail) {
    lines.push("role     " + project.detail.role);
    lines.push("stack    " + project.detail.stack.map((item) => item.title).join(", "));
    lines.push("stats    " + project.detail.stats.join(", "));
  }
  return lines;
}

function createFileSystem() {
  const dir = (children) => ({ children });
  const file = (read) => ({ read });

  return dir({
    "about.md": file(() => [
      "# iTake (@cheatinformer)",
      "",
      "full-stack dev shipping bots, web apps, and products.",
      "frontend since " + FRONTEND_SINCE + ", full stack since " + FULL_STACK_SINCE + ".",
      "20+ commissions, products with hundreds of thousands of users.",
    ]),
    "now.md": file(() => [
      "# now",
      "",
      "status    no longer part of new projects",
      "building  Larp Client, a Minecraft client",
      "          visuals, HUD and modules",
    ]),
    "contact.txt": file(() => [
      "github    " + links.github,
      "discord   " + links.discord,
      "telegram  " + links.telegram,
    ]),
    projects: dir(Object.fromEntries(projects.map((project) => [project.id + ".md", file(() => projectLines(project))]))),
    stack: dir(
      Object.fromEntries(
        stackGroups.map((group) => [group.title + ".txt", file(() => [group.items.map((item) => item[0]).join(", ")])]),
      ),
    ),
  });
}

function mountTerminal(root) {
  const screen = root.querySelector(".nw-screen");
  const form = root.querySelector(".nw-form");
  const input = root.querySelector(".nw-input");
  const promptLabel = root.querySelector(".nw-prompt");
  const title = root.querySelector(".nw-title");
  const fileSystem = createFileSystem();
  const history = [];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let cwd = [];
  let cursor = 0;
  let pendingPassword = null;
  let busy = false;

  function pathLabel() {
    return cwd.length ? "~/" + cwd.join("/") : "~";
  }

  function promptNode() {
    const wrap = document.createElement("span");
    wrap.className = "nw-ps1";
    const who = document.createElement("b");
    who.textContent = USER + "@" + HOST;
    const where = document.createElement("span");
    where.textContent = ":" + pathLabel();
    wrap.append(who, where, "$ ");
    return wrap;
  }

  function refreshPrompt() {
    promptLabel.replaceChildren(promptNode());
    title.textContent = USER + "@" + HOST + ": " + pathLabel();
  }

  function scrollDown() {
    screen.scrollTop = screen.scrollHeight;
  }

  function append(node) {
    screen.append(node);
    scrollDown();
    return node;
  }

  function linkify(parent, text) {
    const pattern = /(https?:\/\/[^\s]+)/g;
    for (const part of text.split(pattern)) {
      if (/^https?:\/\//.test(part)) {
        const anchor = document.createElement("a");
        anchor.href = part;
        anchor.target = "_blank";
        anchor.rel = "noreferrer";
        anchor.textContent = part;
        parent.append(anchor);
      } else if (part) {
        parent.append(part);
      }
    }
  }

  function print(text = "", className = "") {
    const line = document.createElement("div");
    line.className = "nw-line " + className;
    linkify(line, text);
    return append(line);
  }

  function printAll(lines, className = "") {
    for (const line of lines) print(line, className);
  }

  function resolve(raw) {
    const text = raw.trim();
    const rooted = text === "" ? false : /^(~|\/home\/guest|\/)/.test(text);
    const segments = rooted ? [] : [...cwd];
    const body = text.replace(/^(~|\/home\/guest|\/)/, "");

    for (const part of body.split("/")) {
      if (part === "" || part === ".") continue;
      if (part === "..") {
        segments.pop();
        continue;
      }
      segments.push(part);
    }

    let node = fileSystem;
    for (const part of segments) {
      node = node.children?.[part];
      if (!node) return { segments, node: null };
    }
    return { segments, node };
  }

  function listing(node) {
    return Object.keys(node.children)
      .sort()
      .map((name) => (node.children[name].children ? name + "/" : name));
  }

  function neofetch() {
    const rows = [
      [USER + "@" + HOST, ""],
      ["-".repeat((USER + "@" + HOST).length), ""],
      ["OS", "iTake Linux x86_64"],
      ["Host", "portfolio"],
      ["Uptime", currentYear - FRONTEND_SINCE + " years"],
      ["Packages", stackTotal + " (stack)"],
      ["Shell", "itsh"],
      ["Role", "full-stack dev"],
      ["Languages", stackGroups[0].items.slice(0, 4).map((item) => item[0]).join(", ")],
      ["Shipped", projects.length + " projects"],
      ["Status", "no longer part of new projects"],
    ];

    const box = document.createElement("div");
    box.className = "nw-fetch";

    const art = document.createElement("pre");
    art.className = "nw-logo";
    art.textContent = logo.join("\n");

    const info = document.createElement("div");
    info.className = "nw-info";

    rows.forEach(([key, value], index) => {
      const row = document.createElement("div");
      if (index === 0) row.className = "nw-info-title";
      const label = document.createElement("b");
      label.textContent = key;
      row.append(label);
      if (value) row.append("  " + value);
      info.append(row);
    });

    const swatches = document.createElement("div");
    swatches.className = "nw-swatches";
    for (let i = 0; i < 8; i += 1) {
      const swatch = document.createElement("i");
      swatch.style.opacity = String(0.12 + i * 0.12);
      swatches.append(swatch);
    }
    info.append(swatches);

    box.append(art, info);
    append(box);
  }

  function askPassword(label, onDone) {
    print(label);
    pendingPassword = onDone;
    input.type = "password";
    input.placeholder = "";
    input.focus({ preventScroll: true });
  }

  const handlers = {
    help() {
      printAll([
        "iTake shell, version 1.0",
        "",
        "  ls [-l] [dir]   list files",
        "  cd <dir>        change directory",
        "  pwd             print working directory",
        "  cat <file>      read a file",
        "  neofetch        system information",
        "  about           who is this",
        "  now             what is going on right now",
        "  stack [group]   the technologies, grouped",
        "  projects        everything shipped so far",
        "  open <name>     open a project's site",
        "  contact         where to find me",
        "  theme           switch between black and white",
        "  uname, uptime, hostname, whoami, date, echo, history",
        "  sudo, su, clear, exit",
      ]);
    },
    ls(args) {
      const flags = args.filter((arg) => arg.startsWith("-"));
      const target = args.find((arg) => !arg.startsWith("-"));
      const { node } = resolve(target ?? "");
      if (!node) return print("ls: cannot access '" + target + "': No such file or directory");
      if (!node.children) return print(target);

      const names = listing(node);
      if (flags.some((flag) => flag.includes("l"))) {
        print("total " + names.length);
        for (const name of names) {
          const isDir = name.endsWith("/");
          print((isDir ? "drwxr-xr-x" : "-rw-r--r--") + "  " + USER + "  " + USER + "  " + name);
        }
        return;
      }
      print(names.join("  "));
    },
    cd(args) {
      const target = args[0];
      if (!target || target === "~") {
        cwd = [];
        return refreshPrompt();
      }
      const { segments, node } = resolve(target);
      if (!node) return print("cd: " + target + ": No such file or directory");
      if (!node.children) return print("cd: " + target + ": Not a directory");
      cwd = segments;
      refreshPrompt();
    },
    pwd() {
      print("/home/" + USER + (cwd.length ? "/" + cwd.join("/") : ""));
    },
    cat(args) {
      if (!args.length) return print("usage: cat <file>");
      for (const target of args) {
        const { node } = resolve(target);
        if (!node) print("cat: " + target + ": No such file or directory");
        else if (node.children) print("cat: " + target + ": Is a directory");
        else printAll(node.read());
      }
    },
    neofetch,
    about() {
      printAll(fileSystem.children["about.md"].read());
    },
    now() {
      printAll(fileSystem.children["now.md"].read());
    },
    whoami() {
      print(USER);
    },
    hostname() {
      print(HOST);
    },
    uname(args) {
      print(args.includes("-a") ? "Linux " + HOST + " 6.1.0-take #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux" : "Linux");
    },
    uptime() {
      const clock = new Date().toTimeString().slice(0, 8);
      print(" " + clock + " up " + (currentYear - FRONTEND_SINCE) + " years,  1 user,  load average: 0.08, 0.04, 0.01");
    },
    date() {
      print(new Date().toString());
    },
    echo(args) {
      print(args.join(" ").replace(/\$USER/g, USER).replace(/\$HOME/g, "/home/" + USER).replace(/\$HOSTNAME/g, HOST));
    },
    history() {
      history.forEach((entry, index) => print(String(index + 1).padStart(4, " ") + "  " + entry));
    },
    stack(args) {
      const query = args.join(" ").toLowerCase();
      const matches = stackGroups.filter((group) => !query || group.title.includes(query));
      if (!matches.length) {
        return print("no group called '" + query + "'. try: " + stackGroups.map((group) => group.title).join(", "));
      }
      for (const group of matches) print(group.title.padEnd(10, " ") + group.items.map((item) => item[0]).join(", "));
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
      if (!project) return print(query ? "open: no project called '" + query + "'" : "usage: open <project>");
      print("opening " + project.href + " ...", "nw-muted");
      window.open(project.href, "_blank", "noopener");
    },
    contact() {
      printAll(fileSystem.children["contact.txt"].read());
    },
    theme() {
      const toggle = document.querySelector('button[aria-label="Toggle theme"]');
      if (!toggle) return;
      const box = root.getBoundingClientRect();
      toggle.dispatchEvent(
        new MouseEvent("click", { bubbles: true, clientX: box.left + box.width / 2, clientY: box.top + box.height / 2 }),
      );
    },
    sudo(args) {
      if (!args.length) return printAll(["usage: sudo <command>"]);
      askPassword("[sudo] password for " + USER + ":", () => {
        print("Sorry, try again.");
        print(USER + " is not in the sudoers file. This incident will be reported.");
      });
    },
    su() {
      askPassword("Password:", () => print("su: Authentication failure"));
    },
    clear() {
      screen.textContent = "";
    },
    exit() {
      print("logout");
      busy = true;
      setTimeout(() => {
        screen.textContent = "";
        cwd = [];
        refreshPrompt();
        busy = false;
        banner();
      }, 650);
    },
  };

  handlers.logout = handlers.exit;

  function banner() {
    print("iTake Linux 1.0 (GNU/Linux x86_64)", "nw-muted");
    print("type 'help' for the list of commands.", "nw-muted");
    print();
  }

  function run(raw) {
    if (pendingPassword) {
      const done = pendingPassword;
      pendingPassword = null;
      input.type = "text";
      input.placeholder = "help";
      done();
      scrollDown();
      return;
    }

    const text = raw.trim();
    const echo = document.createElement("div");
    echo.className = "nw-line nw-echo";
    echo.append(promptNode(), text);
    append(echo);

    if (!text) return;
    history.push(text);
    cursor = history.length;

    const [name, ...args] = text.split(/\s+/);
    const handler = handlers[name.toLowerCase()];

    if (handler) handler(args);
    else print(name + ": command not found");

    scrollDown();
  }

  function complete() {
    const value = input.value;
    const parts = value.split(/\s+/);
    const last = parts[parts.length - 1].toLowerCase();
    let candidates;

    if (parts.length === 1) {
      candidates = commandNames;
    } else if (parts[0] === "open") {
      candidates = projects.map((project) => project.id);
    } else {
      const slash = last.lastIndexOf("/");
      const base = slash >= 0 ? last.slice(0, slash + 1) : "";
      const { node } = resolve(base);
      candidates = node?.children ? listing(node).map((name) => base + name) : [];
    }

    const matches = candidates.filter((candidate) => candidate.toLowerCase().startsWith(last));
    if (!matches.length) return;

    let prefix = matches[0];
    for (const match of matches) {
      while (!match.toLowerCase().startsWith(prefix.toLowerCase())) prefix = prefix.slice(0, -1);
    }

    parts[parts.length - 1] = matches.length === 1 && !prefix.endsWith("/") && parts.length === 1 ? prefix + " " : prefix;
    input.value = parts.join(" ");
  }

  function typeCommand(text, done) {
    if (reducedMotion) {
      run(text);
      return done?.();
    }

    busy = true;
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      input.value = text.slice(0, index);
      if (index < text.length) return;
      clearInterval(timer);
      setTimeout(() => {
        input.value = "";
        run(text);
        busy = false;
        done?.();
      }, 220);
    }, 70);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (busy) return;
    const value = input.value;
    input.value = "";
    run(value);
  });

  input.addEventListener("keydown", (event) => {
    if (busy) return event.preventDefault();

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
      if (!pendingPassword) complete();
    } else if (event.ctrlKey && event.key === "l") {
      event.preventDefault();
      handlers.clear();
    } else if (event.ctrlKey && event.key === "c") {
      event.preventDefault();
      if (pendingPassword) pendingPassword = null;
      input.type = "text";
      input.placeholder = "help";
      print(promptNode().textContent + input.value + "^C");
      input.value = "";
    }
  });

  root.addEventListener("click", (event) => {
    if (!window.getSelection()?.toString() && !event.target.closest("a")) input.focus({ preventScroll: true });
  });

  refreshPrompt();
  banner();
  setTimeout(() => typeCommand("neofetch"), 450);
}

function setup(root) {
  if (!root || root.dataset.ready) return;
  root.dataset.ready = "true";
  animateNumbers(root);
  revealTimeline(root);
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

function Milestone({ item, index }) {
  return t("li", {
    className: "nw-tl-item" + (item.live ? " is-live" : ""),
    style: { "--n": index },
    children: [
      e("span", { className: "nw-tl-dot", "aria-hidden": true }),
      e("span", { className: "nw-tl-year", children: item.year }),
      t("div", {
        className: "nw-tl-body",
        children: [
          e("strong", { children: item.title }),
          item.text ? e("p", { children: item.text }) : null,
          item.projects
            ? e("ul", {
                className: "nw-tl-projects",
                children: item.projects.map((project) =>
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
              })
            : null,
        ],
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
          e("span", { className: "nw-label", children: "timeline" }),
          e("ol", { className: "nw-timeline", children: milestones.map((item, index) => e(Milestone, { item, index }, item.year)) }),
        ],
      }),
      t("section", {
        className: "nw-section",
        children: [
          e("span", { className: "nw-label", children: "terminal" }),
          t("div", {
            className: "nw-terminal",
            children: [
              t("div", {
                className: "nw-bar",
                children: [
                  t("span", { className: "nw-dots", "aria-hidden": true, children: [e("i", {}), e("i", {}), e("i", {})] }),
                  e("span", { className: "nw-title", children: USER + "@" + HOST + ": ~" }),
                ],
              }),
              e("div", { className: "nw-screen", "aria-live": "polite" }),
              t("form", {
                className: "nw-form",
                autoComplete: "off",
                children: [
                  e("span", { className: "nw-prompt" }),
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

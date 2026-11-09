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


const commandNames = [
  "help", "ls", "cd", "pwd", "cat", "neofetch", "whoami", "hostname", "uname", "uptime", "date", "echo",
  "history", "sudo", "su", "now", "stack", "projects", "open", "contact", "about", "theme", "clear", "exit",
];

function projectLines(project) {
  const lines = [project.name + " (" + project.year + ")", project.desc, project.href];
  if (project.detail) {
    lines.push("role     " + project.detail.role);
    lines.push("stack    " + project.detail.stack.map((item) => item.title).join(", "));
    lines.push("stats    " + project.detail.stats.join(", "));
  }
  return lines;
}

const SVG_NS = "http://www.w3.org/2000/svg";

function svgNode(name, attributes = {}, children = []) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  node.append(...children);
  return node;
}

function createMark() {
  const id = "nw-mark-" + Math.random().toString(36).slice(2, 8);

  return svgNode("svg", { viewBox: "0 0 64 64", width: "72", height: "72", "aria-hidden": "true", fill: "none" }, [
    svgNode("defs", {}, [
      svgNode("linearGradient", { id: id + "-ring", x1: "10", y1: "8", x2: "54", y2: "58", gradientUnits: "userSpaceOnUse" }, [
        svgNode("stop", { offset: "0", "stop-color": "currentColor", "stop-opacity": "0.9" }),
        svgNode("stop", { offset: "1", "stop-color": "currentColor", "stop-opacity": "0.18" }),
      ]),
    ]),
    svgNode("circle", {
      cx: "32",
      cy: "32",
      r: "26",
      stroke: "url(#" + id + "-ring)",
      "stroke-width": "1.6",
      "stroke-linecap": "round",
      "stroke-dasharray": "148 15.4",
      transform: "rotate(-35 32 32)",
    }),
    ...[26, 38].map((cx) =>
      svgNode("circle", {
        cx,
        cy: "32",
        r: "12",
        fill: "currentColor",
        "fill-opacity": "0.3",
        stroke: "currentColor",
        "stroke-opacity": "0.55",
        "stroke-width": "1",
      }),
    ),
  ]);
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
  let lineIndex = 0;
  let pendingPassword = null;
  let busy = false;

  function pathLabel() {
    return cwd.length ? "~/" + cwd.join("/") : "~";
  }

  function promptNode() {
    const wrap = document.createElement("span");
    wrap.className = "nw-ps1";
    const who = document.createElement("span");
    who.className = "nw-who";
    who.textContent = USER + "@" + HOST;
    const where = document.createElement("span");
    where.className = "nw-where";
    where.textContent = pathLabel();
    const mark = document.createElement("span");
    mark.className = "nw-mark";
    mark.textContent = "$";
    wrap.append(who, " ", where, " ", mark, " ");
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
    node.style.setProperty("--d", Math.min(lineIndex, 16) * 16 + "ms");
    lineIndex += 1;
    screen.append(node);
    scrollDown();
    return node;
  }

  function linkify(parent, text) {
    for (const part of text.split(/(https?:\/\/[^\s]+)/g)) {
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

  function printColumns(cells, widths = []) {
    const row = document.createElement("div");
    row.className = "nw-line nw-cols";
    cells.forEach(([text, className], index) => {
      const cell = document.createElement("span");
      if (className) cell.className = className;
      if (widths[index]) cell.style.minWidth = widths[index] + "ch";
      linkify(cell, text);
      row.append(cell);
    });
    return append(row);
  }

  function resolve(raw) {
    const text = raw.trim();
    const rooted = text !== "" && /^(~|\/home\/guest|\/)/.test(text);
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

  function entries(node) {
    return Object.keys(node.children)
      .sort()
      .map((name) => ({ name, dir: Boolean(node.children[name].children) }));
  }

  function neofetch() {
    const rows = [
      ["OS", "iTake Linux"],
      ["Uptime", currentYear - FRONTEND_SINCE + " years"],
      ["Shell", "itsh"],
      ["Packages", stackTotal + " (stack)"],
      ["Languages", stackGroups[0].items.slice(0, 4).map((item) => item[0]).join(", ")],
      ["Shipped", projects.length + " projects"],
      ["Status", "no longer part of new projects"],
    ];

    const box = document.createElement("div");
    box.className = "nw-line nw-fetch";

    const art = document.createElement("div");
    art.className = "nw-logo";
    art.append(createMark());

    const info = document.createElement("div");
    info.className = "nw-info";

    const heading = document.createElement("div");
    heading.className = "nw-info-title";
    heading.textContent = USER + "@" + HOST;
    info.append(heading);

    for (const [key, value] of rows) {
      const row = document.createElement("div");
      const label = document.createElement("span");
      label.className = "nw-key";
      label.textContent = key;
      const text = document.createElement("span");
      text.textContent = value;
      row.className = "nw-kv";
      row.append(label, text);
      info.append(row);
    }

    const swatches = document.createElement("div");
    swatches.className = "nw-swatches";
    for (let i = 0; i < 8; i += 1) {
      const swatch = document.createElement("i");
      swatch.style.opacity = String(0.1 + i * 0.12);
      swatches.append(swatch);
    }
    info.append(swatches);

    box.append(art, info);
    append(box);
    screen.scrollTop = Math.max(0, box.offsetTop - 12);
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
      const rows = [
        ["ls [-l] [dir]", "list files"],
        ["cd <dir>", "change directory"],
        ["cat <file>", "read a file"],
        ["neofetch", "system information"],
        ["about", "who is this"],
        ["now", "what is going on right now"],
        ["stack [group]", "technologies, grouped"],
        ["projects", "everything shipped"],
        ["open <name>", "open a project's site"],
        ["contact", "where to find me"],
        ["theme", "switch black / white"],
        ["clear", "clear the screen"],
      ];
      for (const [command, description] of rows) {
        printColumns([[command, "nw-cmd"], [description, "nw-dim"]], [16]);
      }
      print("also: pwd, whoami, hostname, uname, uptime, date, echo, history, sudo, exit", "nw-dim");
    },
    ls(args) {
      const flags = args.filter((arg) => arg.startsWith("-"));
      const target = args.find((arg) => !arg.startsWith("-"));
      const { node } = resolve(target ?? "");
      if (!node) return print("ls: cannot access '" + target + "': No such file or directory");
      if (!node.children) return print(target);

      const list = entries(node);
      if (flags.some((flag) => flag.includes("l"))) {
        for (const item of list) {
          printColumns(
            [
              [item.dir ? "drwxr-xr-x" : "-rw-r--r--", "nw-dim"],
              [USER, "nw-dim"],
              [item.name + (item.dir ? "/" : ""), item.dir ? "nw-dir" : ""],
            ],
            [12, 7],
          );
        }
        return;
      }

      const row = document.createElement("div");
      row.className = "nw-line nw-listing";
      for (const item of list) {
        const cell = document.createElement("span");
        cell.className = item.dir ? "nw-dir" : "";
        cell.textContent = item.name + (item.dir ? "/" : "");
        row.append(cell);
      }
      append(row);
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
      print(clock + " up " + (currentYear - FRONTEND_SINCE) + " years, 1 user, load average: 0.08, 0.04, 0.01");
    },
    date() {
      print(new Date().toString());
    },
    echo(args) {
      print(args.join(" ").replace(/\$USER/g, USER).replace(/\$HOME/g, "/home/" + USER).replace(/\$HOSTNAME/g, HOST));
    },
    history() {
      history.forEach((entry, index) => printColumns([[String(index + 1), "nw-dim"], [entry]], [5]));
    },
    stack(args) {
      const query = args.join(" ").toLowerCase();
      const matches = stackGroups.filter((group) => !query || group.title.includes(query));
      if (!matches.length) {
        return print("no group called '" + query + "'. try: " + stackGroups.map((group) => group.title).join(", "));
      }
      for (const group of matches) {
        printColumns([[group.title, "nw-cmd"], [group.items.map((item) => item[0]).join(", "), "nw-dim"]], [11]);
      }
    },
    projects() {
      for (const project of projects) {
        printColumns(
          [
            [project.year, "nw-dim"],
            [project.name, "nw-cmd"],
            [project.detail ? project.detail.role : "", "nw-dim"],
          ],
          [6, 11],
        );
      }
    },
    open(args) {
      const query = args.join(" ").toLowerCase();
      const project = projects.find((item) => item.name.toLowerCase() === query || item.id === query);
      if (!project) return print(query ? "open: no project called '" + query + "'" : "usage: open <project>");
      print("opening " + project.href, "nw-dim");
      window.open(project.href, "_blank", "noopener");
    },
    contact() {
      for (const [name, href] of Object.entries(links)) printColumns([[name, "nw-cmd"], [href]], [10]);
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
      if (!args.length) return print("usage: sudo <command>");
      askPassword("[sudo] password for " + USER + ":", () => {
        print("Sorry, try again.");
        print(USER + " is not in the sudoers file. This incident will be reported.", "nw-dim");
      });
    },
    su() {
      askPassword("Password:", () => print("su: Authentication failure"));
    },
    clear() {
      screen.textContent = "";
    },
    exit() {
      print("logout", "nw-dim");
      busy = true;
      setTimeout(() => {
        screen.textContent = "";
        cwd = [];
        refreshPrompt();
        busy = false;
        typeCommand("neofetch");
      }, 650);
    },
  };

  handlers.logout = handlers.exit;

  function run(raw) {
    if (pendingPassword) {
      const done = pendingPassword;
      pendingPassword = null;
      input.type = "text";
      input.placeholder = "type help";
      lineIndex = 0;
      done();
      scrollDown();
      return;
    }

    lineIndex = 0;
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
    else print(name + ": command not found", "nw-dim");

    scrollDown();
  }

  function complete() {
    const parts = input.value.split(/\s+/);
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
      candidates = node?.children ? entries(node).map((item) => base + item.name + (item.dir ? "/" : "")) : [];
    }

    const matches = candidates.filter((candidate) => candidate.toLowerCase().startsWith(last));
    if (!matches.length) return;

    let prefix = matches[0];
    for (const match of matches) {
      while (!match.toLowerCase().startsWith(prefix.toLowerCase())) prefix = prefix.slice(0, -1);
    }

    parts[parts.length - 1] = matches.length === 1 && parts.length === 1 ? prefix + " " : prefix;
    input.value = parts.join(" ");
  }

  function typeCommand(text) {
    if (reducedMotion) return run(text);

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
      pendingPassword = null;
      input.type = "text";
      input.placeholder = "type help";
      const echo = document.createElement("div");
      echo.className = "nw-line nw-echo";
      echo.append(promptNode(), input.value + "^C");
      append(echo);
      input.value = "";
    }
  });

  root.addEventListener("click", (event) => {
    if (!window.getSelection()?.toString() && !event.target.closest("a")) input.focus({ preventScroll: true });
  });

  refreshPrompt();
  setTimeout(() => typeCommand("neofetch"), 450);
}

function setup(root) {
  if (!root || root.dataset.ready) return;
  root.dataset.ready = "true";
  mountTerminal(root.querySelector(".nw-terminal"));
}

function Now() {
  return t("div", {
    className: "nw",
    ref: setup,
    children: [
      t("section", {
        className: "nw-notice",
        children: t("div", {
          className: "nw-notice-pane",
          children: [
            t("span", { className: "nw-backdrop", "aria-hidden": true, children: [e("i", {}), e("i", {})] }),
            t("div", {
              className: "nw-notice-copy",
              children: [
                e("strong", { children: "no longer part of new projects" }),
                e("span", { children: "past work stays online, everything new is on hold." }),
              ],
            }),
          ],
        }),
      }),
      t("section", {
        className: "nw-terminal",
        "aria-label": "Terminal",
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
                placeholder: "type help",
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

export { Now as default };

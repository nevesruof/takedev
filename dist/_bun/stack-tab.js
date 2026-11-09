import{Mb as e,Nb as t}from"./i4hv75y0pok2g.olqfze.x.js";

const groups = [{"title":"languages","items":[["TypeScript","typescript"],["JavaScript","javascript"],["Python","python"],["Go","go"],["Rust","rust"],["Java","java"],["Kotlin","kotlin"],["C","c"],["C++","cpp"],["Objective-C","objc"],["Luau","luau"],["Bash","bash"],["HTML","html"],["CSS","css"],["WebAssembly","wasm"],["SQL","sql"],["GraphQL","graphql"]]},{"title":"frontend","items":[["React","react"],["Next.js","nextjs"],["Svelte","svelte"],["SvelteKit","svelte"],["Astro","astro"],["Tailwind","tailwind"],["shadcn/ui","shadcn"],["Radix","radix"],["Motion","motion"]]},{"title":"backend","items":[["Node.js","nodejs"],["Express","express"],["Hono","hono"],["Fastify","fastify"],["Elysia","elysia"],["FastAPI","fastapi"],["tRPC","trpc"],["discord.py","discord"]]},{"title":"libraries","items":[["Zod","zod"],["Pydantic","pydantic"],["Prisma","prisma"],["Drizzle","drizzle"],["TanStack Query","tanstack"]]},{"title":"apps","items":[["Electron","electron"],["Tauri","tauri"]]},{"title":"tooling","items":[["Vite","vite"],["Webpack","webpack"],["Vitest","vitest"],["Jest","jest"],["Playwright","playwright"],["Puppeteer","puppeteer"]]},{"title":"data","items":[["PostgreSQL","postgresql"],["Redis","redis"],["Backblaze B2","backblaze"]]},{"title":"formats","items":[["JSON","json"],["YAML","yaml"],["TOML","toml"],["Prisma schema","prisma"],["Markdown","markdown"],["Regex","regex"]]},{"title":"infra","items":[["Bun","bun"],["Docker","docker"],["Kubernetes","kubernetes"],["Vercel","vercel"],["Cloudflare","cloudflare"],["AWS","aws"]]}];

const total = groups.reduce((sum, group) => sum + group.items.length, 0);

function applyFilter(input) {
  const root = input.closest(".stk");
  const query = input.value.trim().toLowerCase();
  let shown = 0;

  for (const group of root.querySelectorAll(".stk-group")) {
    let visible = 0;
    for (const chip of group.querySelectorAll(".stk-chip")) {
      const match = !query || chip.dataset.name.includes(query);
      chip.hidden = !match;
      if (match) visible += 1;
    }
    group.hidden = visible === 0;
    shown += visible;
  }

  root.querySelector(".stk-empty").hidden = shown > 0;
  root.querySelector(".stk-count").textContent = query ? shown + " / " + total : String(total);
}

function Chip({ item, index }) {
  const [name, icon] = item;
  const style = { "--i": index };

  return t("li", {
    className: "stk-chip",
    "data-name": name.toLowerCase(),
    style,
    children: [
      e("span", { className: "stk-ico", style: { "--ico": "url(/assets/tech/" + icon + ".svg)" }, "aria-hidden": true }),
      e("span", { className: "stk-name", children: name }),
    ],
  });
}

function Group({ group, offset }) {
  return t("section", {
    className: "stk-group",
    "aria-label": group.title,
    children: [
      t("h2", {
        className: "stk-title",
        children: [group.title, e("span", { children: group.items.length })],
      }),
      e("ul", {
        className: "stk-list",
        children: group.items.map((item, i) => e(Chip, { item, index: offset + i }, item[0])),
      }),
    ],
  });
}

function Stack() {
  let offset = 0;

  return t("div", {
    className: "stk",
    children: [
      t("header", {
        className: "stk-head",
        children: [
          t("div", {
            className: "stk-heading",
            children: [
              e("span", { className: "stk-label", children: "stack" }),
              e("span", { className: "stk-count", children: String(total) }),
            ],
          }),
          e("input", {
            className: "stk-search",
            type: "search",
            placeholder: "filter",
            autoComplete: "off",
            spellCheck: false,
            "aria-label": "Filter the stack",
            onInput: (event) => applyFilter(event.currentTarget),
          }),
        ],
      }),
      ...groups.map((group) => {
        const node = e(Group, { group, offset }, group.title);
        offset += group.items.length;
        return node;
      }),
      e("p", { className: "stk-empty", hidden: true, children: "nothing in the stack matches that." }),
    ],
  });
}

export { Stack as default };

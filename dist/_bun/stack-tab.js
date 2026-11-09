import{Mb as e,Nb as t}from"./i4hv75y0pok2g.olqfze.x.js";

const groups = [{"title":"languages","items":[["TypeScript","typescript","#3178C6"],["JavaScript","javascript","#F7DF1E"],["Python","python","#3776AB"],["Go","go","#00ADD8"],["Rust","rust","#000000"],["Java","java","#000000"],["Kotlin","kotlin","#7F52FF"],["C","c","#A8B9CC"],["C++","cpp","#00599C"],["Objective-C","objc","#000000"],["Luau","luau","#00A2FF"],["Bash","bash","#4EAA25"],["HTML","html","#E34F26"],["CSS","css","#663399"],["WebAssembly","wasm","#654FF0"],["SQL","sql",null],["GraphQL","graphql","#E10098"]]},{"title":"frontend","items":[["React","react","#61DAFB"],["Next.js","nextjs","#000000"],["Svelte","svelte","#FF3E00"],["SvelteKit","svelte","#FF3E00"],["Astro","astro","#BC52EE"],["Tailwind","tailwind","#06B6D4"],["shadcn/ui","shadcn","#000000"],["Radix","radix","#161618"],["Motion","motion","#0055FF"]]},{"title":"backend","items":[["Node.js","nodejs","#5FA04E"],["Express","express","#0A0A0A"],["Hono","hono","#E36002"],["Fastify","fastify","#000000"],["Elysia","elysia",null],["FastAPI","fastapi","#009688"],["tRPC","trpc","#2596BE"],["discord.py","discord","#5865F2"]]},{"title":"libraries","items":[["Zod","zod","#408AFF"],["Pydantic","pydantic","#E92063"],["Prisma","prisma","#2D3748"],["Drizzle","drizzle","#C5F74F"],["TanStack Query","tanstack","#FF4154"]]},{"title":"apps","items":[["Electron","electron","#47848F"],["Tauri","tauri","#24C8D8"]]},{"title":"tooling","items":[["Vite","vite","#9135FF"],["Webpack","webpack","#8DD6F9"],["Vitest","vitest","#00FF74"],["Jest","jest","#C21325"],["Playwright","playwright",null],["Puppeteer","puppeteer","#40B5A4"]]},{"title":"data","items":[["PostgreSQL","postgresql","#4169E1"],["Redis","redis","#FF4438"],["Backblaze B2","backblaze","#E21E29"]]},{"title":"formats","items":[["JSON","json","#000000"],["YAML","yaml","#CB171E"],["TOML","toml","#9C4121"],["Prisma schema","prisma","#2D3748"],["Markdown","markdown","#000000"],["Regex","regex",null]]},{"title":"infra","items":[["Bun","bun","#000000"],["Docker","docker","#2496ED"],["Kubernetes","kubernetes","#326CE5"],["Vercel","vercel","#000000"],["Cloudflare","cloudflare","#F38020"],["AWS","aws",null]]}];

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
  const [name, icon, color] = item;
  const style = { "--i": index };
  if (color) style["--brand"] = color;

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

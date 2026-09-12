const STORAGE_KEY = "flexboxGridBuilderWorkspace";

const defaultWorkspace = {
    settings: {
        compactSidebar: false,
        transitionSpeedMs: 320
    },
    theme: {
        bg: "#040712",
        bgSoft: "#07111f",
        card: "rgba(10, 18, 36, 0.9)",
        text: "#f7fbff",
        muted: "#9aabc7",
        primary: "#22d3ee",
        secondary: "#a855f7",
        success: "#4ade80",
        warning: "#facc15",
        danger: "#fb7185",
        radius: 18,
        fontFamily: "Inter, sans-serif"
    },
    currentFlexboxDraft: null,
    currentGridDraft: null,
    savedLayouts: [],
    activityLog: []
};

const appConfig = {
    transitionLoaderDelayRatio: 0.45,
    statusTimeoutMs: 2800,
    miniPreviewScale: 0.42,
    defaultPrefix: "fgb",
    navItems: [
        { id: "dashboard", label: "Dashboard", href: "index.html", icon: "⌂" },
        { id: "flexbox", label: "Flexbox Builder", href: "flexbox-builder.html", icon: "⇄" },
        { id: "grid", label: "Grid Builder", href: "grid-builder.html", icon: "▦" },
        { id: "saved", label: "Saved Layouts", href: "saved-layouts.html", icon: "▣" },
        { id: "export", label: "Export Center", href: "export.html", icon: "⇩" },
        { id: "settings", label: "Settings", href: "settings.html", icon: "⚙" }
    ],
    flexDefaults: {
        container: {
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "flex-start",
            alignItems: "stretch",
            alignContent: "flex-start",
            gap: 16,
            width: 800,
            height: 400
        },
        items: [
            {
                id: "item-1",
                label: "Item 1",
                flexGrow: 0,
                flexShrink: 1,
                flexBasis: "auto",
                alignSelf: "auto",
                order: 0,
                color: "#22d3ee"
            },
            {
                id: "item-2",
                label: "Item 2",
                flexGrow: 0,
                flexShrink: 1,
                flexBasis: "auto",
                alignSelf: "auto",
                order: 0,
                color: "#a855f7"
            }
        ]
    },
    gridDefaults: {
        container: {
            columns: ["1fr", "1fr", "1fr"],
            rows: ["auto", "auto"],
            columnGap: 16,
            rowGap: 16,
            justifyItems: "stretch",
            alignItems: "stretch",
            templateAreas: []
        },
        items: [
            {
                id: "item-1",
                label: "Item 1",
                columnStart: 1,
                columnEnd: 2,
                rowStart: 1,
                rowEnd: 2,
                areaName: "",
                color: "#a855f7"
            }
        ]
    }
};

function escapeHtml(str) {
    return String(str ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function generateId(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function validateNumberInput(input) {
    if (!input || input.type !== "number") return true;

    const value = input.value;
    const min = input.min !== "" ? Number(input.min) : null;
    const max = input.max !== "" ? Number(input.max) : null;

    let message = "";
    if (value === "") {
        message = "Value is required.";
    } else if (min !== null && Number(value) < min) {
        message = `Value must be at least ${min}.`;
    } else if (max !== null && Number(value) > max) {
        message = `Value must be at most ${max}.`;
    }

    let feedback = input.nextElementSibling;
    if (!feedback || !feedback.classList.contains("invalid-feedback")) {
        feedback = document.createElement("div");
        feedback.className = "invalid-feedback";
        input.insertAdjacentElement("afterend", feedback);
    }

    input.classList.toggle("is-invalid", Boolean(message));
    feedback.textContent = message;
    feedback.style.display = message ? "block" : "none";

    return !message;
}

function formatTimestamp(dateString) {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "Unknown";
    return date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function cloneData(data) {
    return JSON.parse(JSON.stringify(data));
}

function mergeWorkspace(workspace) {
    return {
        ...cloneData(defaultWorkspace),
        ...workspace,
        settings: { ...defaultWorkspace.settings, ...(workspace.settings || {}) },
        theme: { ...defaultWorkspace.theme, ...(workspace.theme || {}) },
        savedLayouts: Array.isArray(workspace.savedLayouts) ? workspace.savedLayouts : [],
        activityLog: Array.isArray(workspace.activityLog) ? workspace.activityLog : []
    };
}

function loadWorkspace() {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
        const seeded = seedDemoData();
        saveWorkspace(seeded);
        return seeded;
    }

    try {
        return mergeWorkspace(JSON.parse(stored));
    } catch (error) {
        console.warn("Workspace could not be parsed. Re-seeding demo data.", error);
        const seeded = seedDemoData();
        saveWorkspace(seeded);
        return seeded;
    }
}

function saveWorkspace(workspace) {
    const merged = mergeWorkspace(workspace);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
}

function resetWorkspace() {
    const workspace = cloneData(defaultWorkspace);
    saveWorkspace(workspace);
    applyThemeSettings();
    return workspace;
}

function seedDemoData() {
    const now = new Date();
    const makeDate = function (minutesAgo) {
        return new Date(now.getTime() - minutesAgo * 60000).toISOString();
    };

    const workspace = cloneData(defaultWorkspace);

    workspace.savedLayouts = [
        {
            id: generateId("layout"),
            name: "Product Navbar",
            type: "flex",
            tags: ["navigation", "header"],
            config: {
                container: {
                    flexDirection: "row",
                    flexWrap: "nowrap",
                    justifyContent: "space-between",
                    alignItems: "center",
                    alignContent: "center",
                    gap: 18,
                    width: 880,
                    height: 120
                },
                items: [
                    { id: generateId("item"), label: "Brand", flexGrow: 1, flexShrink: 1, flexBasis: "180px", alignSelf: "auto", order: 0, color: "#22d3ee" },
                    { id: generateId("item"), label: "Links", flexGrow: 2, flexShrink: 1, flexBasis: "280px", alignSelf: "auto", order: 0, color: "#a855f7" },
                    { id: generateId("item"), label: "CTA", flexGrow: 0, flexShrink: 1, flexBasis: "120px", alignSelf: "auto", order: 0, color: "#4ade80" }
                ]
            },
            createdAt: makeDate(480),
            updatedAt: makeDate(35)
        },
        {
            id: generateId("layout"),
            name: "Centered Hero",
            type: "flex",
            tags: ["hero", "centered"],
            config: {
                container: {
                    flexDirection: "column",
                    flexWrap: "nowrap",
                    justifyContent: "center",
                    alignItems: "center",
                    alignContent: "center",
                    gap: 14,
                    width: 760,
                    height: 420
                },
                items: [
                    { id: generateId("item"), label: "Headline", flexGrow: 0, flexShrink: 1, flexBasis: "auto", alignSelf: "auto", order: 0, color: "#22d3ee" },
                    { id: generateId("item"), label: "Supporting Copy", flexGrow: 0, flexShrink: 1, flexBasis: "auto", alignSelf: "auto", order: 0, color: "#a855f7" },
                    { id: generateId("item"), label: "Actions", flexGrow: 0, flexShrink: 1, flexBasis: "auto", alignSelf: "auto", order: 0, color: "#facc15" }
                ]
            },
            createdAt: makeDate(420),
            updatedAt: makeDate(82)
        },
        {
            id: generateId("layout"),
            name: "Product Card Grid",
            type: "grid",
            tags: ["cards", "catalog"],
            config: {
                container: {
                    columns: ["1fr", "1fr", "1fr"],
                    rows: ["auto", "auto"],
                    columnGap: 18,
                    rowGap: 18,
                    justifyItems: "stretch",
                    alignItems: "stretch",
                    templateAreas: []
                },
                items: [
                    { id: generateId("item"), label: "Card 1", columnStart: 1, columnEnd: 2, rowStart: 1, rowEnd: 2, areaName: "", color: "#22d3ee" },
                    { id: generateId("item"), label: "Card 2", columnStart: 2, columnEnd: 3, rowStart: 1, rowEnd: 2, areaName: "", color: "#a855f7" },
                    { id: generateId("item"), label: "Card 3", columnStart: 3, columnEnd: 4, rowStart: 1, rowEnd: 2, areaName: "", color: "#4ade80" },
                    { id: generateId("item"), label: "Card 4", columnStart: 1, columnEnd: 2, rowStart: 2, rowEnd: 3, areaName: "", color: "#facc15" },
                    { id: generateId("item"), label: "Card 5", columnStart: 2, columnEnd: 4, rowStart: 2, rowEnd: 3, areaName: "", color: "#fb7185" }
                ]
            },
            createdAt: makeDate(360),
            updatedAt: makeDate(120)
        },
        {
            id: generateId("layout"),
            name: "Analytics Dashboard",
            type: "grid",
            tags: ["dashboard", "analytics"],
            config: {
                container: {
                    columns: ["220px", "1fr", "1fr"],
                    rows: ["80px", "220px", "160px"],
                    columnGap: 16,
                    rowGap: 16,
                    justifyItems: "stretch",
                    alignItems: "stretch",
                    templateAreas: [
                        ["nav", "header", "header"],
                        ["nav", "chart", "summary"],
                        ["nav", "table", "table"]
                    ]
                },
                items: [
                    { id: generateId("item"), label: "Nav", columnStart: 1, columnEnd: 2, rowStart: 1, rowEnd: 4, areaName: "nav", color: "#22d3ee" },
                    { id: generateId("item"), label: "Header", columnStart: 2, columnEnd: 4, rowStart: 1, rowEnd: 2, areaName: "header", color: "#a855f7" },
                    { id: generateId("item"), label: "Chart", columnStart: 2, columnEnd: 3, rowStart: 2, rowEnd: 3, areaName: "chart", color: "#4ade80" },
                    { id: generateId("item"), label: "Summary", columnStart: 3, columnEnd: 4, rowStart: 2, rowEnd: 3, areaName: "summary", color: "#facc15" },
                    { id: generateId("item"), label: "Table", columnStart: 2, columnEnd: 4, rowStart: 3, rowEnd: 4, areaName: "table", color: "#fb7185" }
                ]
            },
            createdAt: makeDate(260),
            updatedAt: makeDate(15)
        }
    ];

    workspace.activityLog = [
        { id: generateId("log"), module: "Grid Builder", action: "Saved layout", detail: "Saved layout 'Analytics Dashboard'", createdAt: makeDate(15) },
        { id: generateId("log"), module: "Flexbox Builder", action: "Updated layout", detail: "Edited 'Product Navbar'", createdAt: makeDate(35) },
        { id: generateId("log"), module: "Export Center", action: "Exported layout", detail: "Prepared export for 'Product Card Grid'", createdAt: makeDate(70) },
        { id: generateId("log"), module: "Settings", action: "Theme changed", detail: "Applied starter workspace theme", createdAt: makeDate(120) }
    ];

    return workspace;
}

function addActivityLog(module, action, detail) {
    const workspace = loadWorkspace();
    workspace.activityLog.unshift({
        id: generateId("log"),
        module,
        action,
        detail,
        createdAt: new Date().toISOString()
    });
    workspace.activityLog = workspace.activityLog.slice(0, 60);
    saveWorkspace(workspace);
}

function applyThemeSettings() {
    const workspace = loadWorkspace();
    const root = document.documentElement;
    const theme = workspace.theme;
    const settings = workspace.settings;

    Object.entries(theme).forEach(function ([key, value]) {
        const cssName = key.replace(/[A-Z]/g, function (letter) {
            return `-${letter.toLowerCase()}`;
        });
        const cssValue = key === "radius" ? `${value}px` : value;
        root.style.setProperty(`--${cssName}`, cssValue);
    });

    root.style.setProperty("--transition-speed", `${settings.transitionSpeedMs}ms`);
    document.body.classList.toggle("compact-sidebar", Boolean(settings.compactSidebar));
}

function renderSidebar(activePage) {
    const links = appConfig.navItems.map(function (item) {
        const activeClass = item.id === activePage ? " active" : "";
        return `
      <a class="sidebar-link${activeClass}" href="${item.href}" data-page="${item.id}">
        <span class="sidebar-icon">${item.icon}</span>
        <span class="sidebar-label">${escapeHtml(item.label)}</span>
      </a>
    `;
    }).join("");

    return `
    <div class="mobile-topbar">
      <strong>Flexbox/Grid Builder</strong>
      <button class="btn btn-outline-theme btn-sm" type="button" data-sidebar-toggle>Menu</button>
    </div>
    <aside class="app-sidebar" id="appSidebar">
      <div class="sidebar-brand">
        <span class="brand-mark">FG</span>
        <span class="brand-copy">
          <p class="brand-title">Flexbox/Grid Builder</p>
          <p class="sidebar-subtitle">Visual CSS layout studio</p>
        </span>
      </div>
      <nav class="sidebar-nav" aria-label="Primary navigation">
        ${links}
      </nav>
      <div class="sidebar-footer">Local-first workspace powered by browser storage.</div>
    </aside>
  `;
}

function setActiveNav() {
    const page = document.body.dataset.page;
    document.querySelectorAll(".sidebar-link").forEach(function (link) {
        link.classList.toggle("active", link.dataset.page === page);
    });
}

function initSharedLayout(activePage) {
    const shell = document.querySelector(".app-shell");
    if (!shell) return;

    shell.insertAdjacentHTML("afterbegin", renderSidebar(activePage));
    setActiveNav();

    document.querySelectorAll("[data-sidebar-toggle]").forEach(function (button) {
        button.addEventListener("click", function () {
            document.getElementById("appSidebar")?.classList.toggle("open");
        });
    });
}

function showStatus(message, type) {
    let region = document.querySelector(".status-region");
    if (!region) {
        region = document.createElement("div");
        region.className = "status-region";
        document.body.appendChild(region);
    }

    const item = document.createElement("div");
    item.className = `status-message status-${type || "success"}`;
    item.textContent = message;
    region.appendChild(item);

    window.setTimeout(function () {
        item.remove();
    }, appConfig.statusTimeoutMs);
}

function renderEmptyState(message) {
    return `<div class="empty-state"><p class="mb-0">${escapeHtml(message)}</p></div>`;
}

function downloadJson(filename, data) {
    downloadTextFile(filename, JSON.stringify(data, null, 2));
}

function downloadTextFile(filename, content) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

function copyText(text, message) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () {
            showStatus(message || "Copied to clipboard.", "success");
        }).catch(function () {
            fallbackCopyText(text, message);
        });
        return;
    }

    fallbackCopyText(text, message);
}

function fallbackCopyText(text, message) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    showStatus(message || "Copied to clipboard.", "success");
}

function slugify(text) {
    return String(text || "layout")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "layout";
}

function className(prefix, name) {
    return `${slugify(prefix || appConfig.defaultPrefix)}-${name}`;
}

function generateFlexboxHtml(config, options) {
    const prefix = (options && options.prefix) || appConfig.defaultPrefix;
    const containerClass = className(prefix, "flex-container");
    const itemClass = className(prefix, "flex-item");

    return [
        `<div class="${containerClass}">`,
        ...config.items.map(function (item) {
            return `  <div class="${itemClass} ${itemClass}-${slugify(item.id)}">${escapeHtml(item.label)}</div>`;
        }),
        `</div>`
    ].join("\n");
}

function generateFlexboxCss(config, options) {
    const prefix = (options && options.prefix) || appConfig.defaultPrefix;
    const minify = Boolean(options && options.minify);
    const containerClass = className(prefix, "flex-container");
    const itemClass = className(prefix, "flex-item");

    const lines = [
        `.${containerClass} {`,
        `  display: flex;`,
        `  flex-direction: ${config.container.flexDirection};`,
        `  flex-wrap: ${config.container.flexWrap};`,
        `  justify-content: ${config.container.justifyContent};`,
        `  align-items: ${config.container.alignItems};`,
        `  align-content: ${config.container.alignContent};`,
        `  gap: ${config.container.gap}px;`,
        `  width: ${config.container.width}px;`,
        `  min-height: ${config.container.height}px;`,
        `}`,
        ``,
        `.${itemClass} {`,
        `  display: grid;`,
        `  place-items: center;`,
        `  padding: 1rem;`,
        `  border-radius: 0.75rem;`,
        `  color: #040712;`,
        `  font-weight: 700;`,
        `}`,
        ...config.items.flatMap(function (item) {
            return [
                ``,
                `.${itemClass}-${slugify(item.id)} {`,
                `  flex-grow: ${item.flexGrow};`,
                `  flex-shrink: ${item.flexShrink};`,
                `  flex-basis: ${item.flexBasis};`,
                `  align-self: ${item.alignSelf};`,
                `  order: ${item.order};`,
                `  background: ${item.color};`,
                `}`
            ];
        })
    ];

    return minifyCss(lines.join("\n"), minify);
}

function generateGridHtml(config, options) {
    const prefix = (options && options.prefix) || appConfig.defaultPrefix;
    const containerClass = className(prefix, "grid-container");
    const itemClass = className(prefix, "grid-item");

    return [
        `<div class="${containerClass}">`,
        ...config.items.map(function (item) {
            return `  <div class="${itemClass} ${itemClass}-${slugify(item.id)}">${escapeHtml(item.label)}</div>`;
        }),
        `</div>`
    ].join("\n");
}

function generateGridCss(config, options) {
    const prefix = (options && options.prefix) || appConfig.defaultPrefix;
    const minify = Boolean(options && options.minify);
    const containerClass = className(prefix, "grid-container");
    const itemClass = className(prefix, "grid-item");
    const areas = config.container.templateAreas || [];
    const areaLines = areas.length
        ? [`  grid-template-areas:`, ...areas.map(function (row, index) {
            return `    "${row.map(function (cell) { return cell || "."; }).join(" ")}"${index === areas.length - 1 ? ";" : ""}`;
        })]
        : [];

    const lines = [
        `.${containerClass} {`,
        `  display: grid;`,
        `  grid-template-columns: ${config.container.columns.join(" ")};`,
        `  grid-template-rows: ${config.container.rows.join(" ")};`,
        ...areaLines,
        `  column-gap: ${config.container.columnGap}px;`,
        `  row-gap: ${config.container.rowGap}px;`,
        `  justify-items: ${config.container.justifyItems};`,
        `  align-items: ${config.container.alignItems};`,
        `}`,
        ``,
        `.${itemClass} {`,
        `  display: grid;`,
        `  place-items: center;`,
        `  padding: 1rem;`,
        `  border-radius: 0.75rem;`,
        `  color: #040712;`,
        `  font-weight: 700;`,
        `}`,
        ...config.items.flatMap(function (item) {
            const placement = item.areaName
                ? [`  grid-area: ${item.areaName};`]
                : [
                    `  grid-column: ${item.columnStart} / ${item.columnEnd};`,
                    `  grid-row: ${item.rowStart} / ${item.rowEnd};`
                ];

            return [
                ``,
                `.${itemClass}-${slugify(item.id)} {`,
                ...placement,
                `  background: ${item.color};`,
                `}`
            ];
        })
    ];

    return minifyCss(lines.join("\n"), minify);
}

function minifyCss(css, shouldMinify) {
    if (!shouldMinify) return css;
    return css
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\s+/g, " ")
        .replace(/\s*([{}:;,])\s*/g, "$1")
        .replace(/;}/g, "}")
        .trim();
}

function initPageTransitions() {
    if (!document.querySelector(".transition-overlay")) {
        const overlay = document.createElement("div");
        overlay.className = "transition-overlay";
        overlay.innerHTML = `
      <div class="transition-content" hidden>
        <div class="transition-spinner" aria-hidden="true"></div>
        <p class="transition-message">Loading workspace...</p>
      </div>
    `;
        document.body.insertAdjacentElement("afterbegin", overlay);
    }

    window.requestAnimationFrame(function () {
        hideTransitionOverlay();
    });

    document.addEventListener("click", function (event) {
        const link = event.target.closest("a[href]");
        if (!link || !shouldTransitionLink(event, link)) return;

        event.preventDefault();
        const workspace = loadWorkspace();
        const duration = workspace.settings.transitionSpeedMs;
        const href = link.href;

        showTransitionOverlay(false);

        const loaderTimer = window.setTimeout(function () {
            showTransitionOverlay(true);
        }, Math.max(1, Math.floor(duration * appConfig.transitionLoaderDelayRatio)));

        window.setTimeout(function () {
            window.clearTimeout(loaderTimer);
            window.location.href = href;
        }, duration);
    });
}

function shouldTransitionLink(event, link) {
    if (event.defaultPrevented) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (link.target && link.target !== "_self") return false;
    if (link.hasAttribute("download")) return false;

    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    if (url.pathname === window.location.pathname && url.hash) return false;

    return true;
}

function showTransitionOverlay(withLoader) {
    let overlay = document.querySelector(".transition-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "transition-overlay";
        overlay.innerHTML = `
      <div class="transition-content" hidden>
        <div class="transition-spinner" aria-hidden="true"></div>
        <p class="transition-message">Loading workspace...</p>
      </div>
    `;
        document.body.insertAdjacentElement("afterbegin", overlay);
    }

    const content = overlay.querySelector(".transition-content");
    if (content) content.hidden = !withLoader;

    overlay.classList.remove("hidden");
}

function hideTransitionOverlay() {
    const overlay = document.querySelector(".transition-overlay");
    if (!overlay) return;
    overlay.classList.add("hidden");
}

function renderMiniPreview(config, type, containerEl) {
    if (!containerEl) return;
    containerEl.innerHTML = "";

    const preview = document.createElement("div");
    preview.className = type === "grid" ? "grid-canvas" : "flex-canvas";

    if (type === "grid") {
        preview.style.gridTemplateColumns = config.container.columns.join(" ");
        preview.style.gridTemplateRows = config.container.rows.join(" ");
        preview.style.columnGap = `${Math.max(1, config.container.columnGap * appConfig.miniPreviewScale)}px`;
        preview.style.rowGap = `${Math.max(1, config.container.rowGap * appConfig.miniPreviewScale)}px`;
        preview.style.justifyItems = config.container.justifyItems;
        preview.style.alignItems = config.container.alignItems;

        if (config.container.templateAreas && config.container.templateAreas.length) {
            preview.style.gridTemplateAreas = config.container.templateAreas
                .map(function (row) { return `"${row.map(function (cell) { return cell || "."; }).join(" ")}"`; })
                .join(" ");
        }

        config.items.forEach(function (item) {
            const el = document.createElement("div");
            el.className = "preview-item";
            el.textContent = item.label;
            el.style.background = item.color;
            if (item.areaName) {
                el.style.gridArea = item.areaName;
            } else {
                el.style.gridColumn = `${item.columnStart} / ${item.columnEnd}`;
                el.style.gridRow = `${item.rowStart} / ${item.rowEnd}`;
            }
            preview.appendChild(el);
        });
    } else {
        preview.style.flexDirection = config.container.flexDirection;
        preview.style.flexWrap = config.container.flexWrap;
        preview.style.justifyContent = config.container.justifyContent;
        preview.style.alignItems = config.container.alignItems;
        preview.style.alignContent = config.container.alignContent;
        preview.style.gap = `${Math.max(1, config.container.gap * appConfig.miniPreviewScale)}px`;

        config.items.forEach(function (item) {
            const el = document.createElement("div");
            el.className = "preview-item";
            el.textContent = item.label;
            el.style.background = item.color;
            el.style.flexGrow = item.flexGrow;
            el.style.flexShrink = item.flexShrink;
            el.style.flexBasis = item.flexBasis;
            el.style.alignSelf = item.alignSelf;
            el.style.order = item.order;
            preview.appendChild(el);
        });
    }

    containerEl.appendChild(preview);
}

document.addEventListener("DOMContentLoaded", function () {
    applyThemeSettings();
});
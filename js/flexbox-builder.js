const flexOptions = {
    flexDirection: ["row", "row-reverse", "column", "column-reverse"],
    flexWrap: ["nowrap", "wrap", "wrap-reverse"],
    justifyContent: ["flex-start", "center", "flex-end", "space-between", "space-around", "space-evenly"],
    alignItems: ["stretch", "flex-start", "center", "flex-end", "baseline"],
    alignContent: ["stretch", "flex-start", "center", "flex-end", "space-between", "space-around"],
    alignSelf: ["auto", "stretch", "flex-start", "center", "flex-end", "baseline"]
};

const flexPresets = [
    { id: "", name: "Choose a preset", config: null },
    {
        id: "navbar",
        name: "Navbar",
        config: {
            container: { flexDirection: "row", flexWrap: "nowrap", justifyContent: "space-between", alignItems: "center", alignContent: "center", gap: 18, width: 900, height: 120 },
            items: [
                { label: "Brand", flexGrow: 1, flexShrink: 1, flexBasis: "180px", alignSelf: "auto", order: 0, color: "#22d3ee" },
                { label: "Links", flexGrow: 2, flexShrink: 1, flexBasis: "320px", alignSelf: "auto", order: 0, color: "#a855f7" },
                { label: "Action", flexGrow: 0, flexShrink: 1, flexBasis: "120px", alignSelf: "auto", order: 0, color: "#4ade80" }
            ]
        }
    },
    {
        id: "centered-box",
        name: "Centered Box",
        config: {
            container: { flexDirection: "column", flexWrap: "nowrap", justifyContent: "center", alignItems: "center", alignContent: "center", gap: 16, width: 760, height: 420 },
            items: [
                { label: "Title", flexGrow: 0, flexShrink: 1, flexBasis: "auto", alignSelf: "auto", order: 0, color: "#22d3ee" },
                { label: "Panel", flexGrow: 0, flexShrink: 1, flexBasis: "180px", alignSelf: "auto", order: 0, color: "#a855f7" }
            ]
        }
    },
    {
        id: "sidebar-layout",
        name: "Sidebar Layout",
        config: {
            container: { flexDirection: "row", flexWrap: "nowrap", justifyContent: "flex-start", alignItems: "stretch", alignContent: "stretch", gap: 20, width: 900, height: 420 },
            items: [
                { label: "Sidebar", flexGrow: 0, flexShrink: 0, flexBasis: "220px", alignSelf: "stretch", order: 0, color: "#22d3ee" },
                { label: "Content", flexGrow: 1, flexShrink: 1, flexBasis: "auto", alignSelf: "stretch", order: 0, color: "#a855f7" }
            ]
        }
    },
    {
        id: "equal-columns",
        name: "Equal Columns",
        config: {
            container: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-start", alignItems: "stretch", alignContent: "flex-start", gap: 16, width: 880, height: 300 },
            items: [
                { label: "Column 1", flexGrow: 1, flexShrink: 1, flexBasis: "220px", alignSelf: "auto", order: 0, color: "#22d3ee" },
                { label: "Column 2", flexGrow: 1, flexShrink: 1, flexBasis: "220px", alignSelf: "auto", order: 0, color: "#a855f7" },
                { label: "Column 3", flexGrow: 1, flexShrink: 1, flexBasis: "220px", alignSelf: "auto", order: 0, color: "#4ade80" }
            ]
        }
    }
];

let flexState = null;

function getFlexDraft() {
    const workspace = loadWorkspace();
    if (!workspace.currentFlexboxDraft) {
        workspace.currentFlexboxDraft = cloneData(appConfig.flexDefaults);
        saveWorkspace(workspace);
    }
    return cloneData(workspace.currentFlexboxDraft);
}

function persistFlexDraft() {
    const workspace = loadWorkspace();
    workspace.currentFlexboxDraft = cloneData(flexState);
    saveWorkspace(workspace);
}

function renderFlexPresetOptions() {
    $("#flexPresetSelect").html(flexPresets.map(function (preset) {
        return `<option value="${preset.id}">${escapeHtml(preset.name)}</option>`;
    }).join(""));
}

function renderFlexContainerControls() {
    const container = flexState.container;
    const selectControl = function (name, label, options) {
        return `
      <div>
        <label class="form-label" for="${name}">${label}</label>
        <select class="form-select" id="${name}" data-container-prop="${name}">
          ${options.map(function (option) {
            return `<option value="${option}" ${container[name] === option ? "selected" : ""}>${option}</option>`;
        }).join("")}
        </select>
      </div>
    `;
    };

    $("#flexContainerControls").html(`
    ${selectControl("flexDirection", "flex-direction", flexOptions.flexDirection)}
    ${selectControl("flexWrap", "flex-wrap", flexOptions.flexWrap)}
    ${selectControl("justifyContent", "justify-content", flexOptions.justifyContent)}
    ${selectControl("alignItems", "align-items", flexOptions.alignItems)}
    ${selectControl("alignContent", "align-content", flexOptions.alignContent)}
    <div>
      <label class="form-label" for="gap">gap: <span id="gapValue">${container.gap}px</span></label>
      <input class="form-range" id="gap" type="range" min="0" max="80" value="${container.gap}" data-container-prop="gap">
    </div>
    <div>
      <label class="form-label" for="width">container width</label>
      <input class="form-control" id="width" type="number" min="240" value="${container.width}" data-container-prop="width">
    </div>
    <div>
      <label class="form-label" for="height">container height</label>
      <input class="form-control" id="height" type="number" min="120" value="${container.height}" data-container-prop="height">
    </div>
  `);
}

function renderFlexPreview() {
    const preview = document.getElementById("flexPreview");
    preview.className = "flex-canvas";
    preview.innerHTML = "";
    Object.assign(preview.style, {
        flexDirection: flexState.container.flexDirection,
        flexWrap: flexState.container.flexWrap,
        justifyContent: flexState.container.justifyContent,
        alignItems: flexState.container.alignItems,
        alignContent: flexState.container.alignContent,
        gap: `${flexState.container.gap}px`,
        width: `${flexState.container.width}px`,
        minHeight: `${flexState.container.height}px`
    });

    flexState.items.forEach(function (item) {
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

function updateContainerProperty(name, value) {
    const numericProps = ["gap", "width", "height"];
    flexState.container[name] = numericProps.includes(name) ? Number(value) : value;
    persistFlexDraft();
    renderFlexContainerControls();
    renderFlexPreview();
    renderGeneratedFlexCode();
}

function addFlexItem() {
    const workspace = loadWorkspace();
    const theme = workspace.theme;
    flexState.items.push({
        id: generateId("item"),
        label: `Item ${flexState.items.length + 1}`,
        flexGrow: 0,
        flexShrink: 1,
        flexBasis: "auto",
        alignSelf: "auto",
        order: 0,
        color: flexState.items.length % 2 ? theme.secondary : theme.primary
    });
    persistFlexDraft();
    renderFlexItemControls();
    renderFlexPreview();
    renderGeneratedFlexCode();
}

function removeFlexItem(id) {
    flexState.items = flexState.items.filter(function (item) {
        return item.id !== id;
    });
    persistFlexDraft();
    renderFlexItemControls();
    renderFlexPreview();
    renderGeneratedFlexCode();
}

function reorderFlexItem(id, direction) {
    const index = flexState.items.findIndex(function (item) {
        return item.id === id;
    });
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= flexState.items.length) return;

    const item = flexState.items.splice(index, 1)[0];
    flexState.items.splice(nextIndex, 0, item);
    persistFlexDraft();
    renderFlexItemControls();
    renderFlexPreview();
    renderGeneratedFlexCode();
}

function updateItemProperty(id, name, value) {
    const item = flexState.items.find(function (entry) {
        return entry.id === id;
    });
    if (!item) return;

    const numericProps = ["flexGrow", "flexShrink", "order"];
    item[name] = numericProps.includes(name) ? Number(value) : value;
    persistFlexDraft();
    renderFlexPreview();
    renderGeneratedFlexCode();
}

function renderFlexItemControls() {
    const html = flexState.items.map(function (item) {
        return `
      <article class="item-editor" data-item="${item.id}">
        <div class="item-editor-header">
          <h3 class="item-editor-title">${escapeHtml(item.label)}</h3>
          <div class="item-editor-actions">
            <button class="btn btn-outline-theme btn-sm" type="button" data-move-up="${item.id}">↑</button>
            <button class="btn btn-outline-theme btn-sm" type="button" data-move-down="${item.id}">↓</button>
            <button class="btn btn-danger-theme btn-sm" type="button" data-remove-item="${item.id}">Remove</button>
          </div>
        </div>
        <div class="flex-property-grid">
          <div>
            <label class="form-label">Label</label>
            <input class="form-control" value="${escapeHtml(item.label)}" data-item-prop="label" data-id="${item.id}">
          </div>
          <div>
            <label class="form-label">flex-basis</label>
            <input class="form-control" value="${escapeHtml(item.flexBasis)}" data-item-prop="flexBasis" data-id="${item.id}">
          </div>
          <div>
            <label class="form-label">flex-grow</label>
            <input class="form-control" type="number" value="${item.flexGrow}" data-item-prop="flexGrow" data-id="${item.id}">
          </div>
          <div>
            <label class="form-label">flex-shrink</label>
            <input class="form-control" type="number" value="${item.flexShrink}" data-item-prop="flexShrink" data-id="${item.id}">
          </div>
          <div>
            <label class="form-label">align-self</label>
            <select class="form-select" data-item-prop="alignSelf" data-id="${item.id}">
              ${flexOptions.alignSelf.map(function (option) {
            return `<option value="${option}" ${item.alignSelf === option ? "selected" : ""}>${option}</option>`;
        }).join("")}
            </select>
          </div>
          <div>
            <label class="form-label">order</label>
            <input class="form-control" type="number" value="${item.order}" data-item-prop="order" data-id="${item.id}">
          </div>
          <div class="color-input-row">
            <div>
              <label class="form-label">Preview color</label>
              <input class="form-control" value="${escapeHtml(item.color)}" data-item-prop="color" data-id="${item.id}">
            </div>
            <input class="form-control form-control-color" type="color" value="${item.color}" data-item-prop="color" data-id="${item.id}">
          </div>
        </div>
      </article>
    `;
    }).join("");

    $("#flexItemControls").html(html || renderEmptyState("No flex items yet. Add an item to begin."));
}

function renderGeneratedFlexCode() {
    $("#flexHtmlCode").text(generateFlexboxHtml(flexState, { prefix: appConfig.defaultPrefix }));
    $("#flexCssCode").text(generateFlexboxCss(flexState, { prefix: appConfig.defaultPrefix }));
}

function applyFlexPreset(presetId) {
    const preset = flexPresets.find(function (item) {
        return item.id === presetId;
    });

    if (!preset || !preset.config) return;

    flexState = cloneData(preset.config);
    flexState.items = flexState.items.map(function (item) {
        return { ...item, id: generateId("item") };
    });
    persistFlexDraft();
    renderFlexContainerControls();
    renderFlexItemControls();
    renderFlexPreview();
    renderGeneratedFlexCode();
    showStatus(`Applied ${preset.name}.`, "success");
}

function saveFlexboxLayout() {
    const name = window.prompt("Layout name?");
    if (!name) return;

    const tagsInput = window.prompt("Optional tags, separated by commas", "");
    const tags = String(tagsInput || "")
        .split(",")
        .map(function (tag) { return tag.trim(); })
        .filter(Boolean);

    const workspace = loadWorkspace();
    workspace.savedLayouts.unshift({
        id: generateId("layout"),
        name,
        type: "flex",
        tags,
        config: cloneData(flexState),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });

    saveWorkspace(workspace);
    addActivityLog("Flexbox Builder", "Saved layout", `Saved layout '${name}'`);
    showStatus("Flexbox layout saved.", "success");
}

function resetFlexboxBuilder() {
    if (!window.confirm("Reset the Flexbox builder draft?")) return;
    flexState = cloneData(appConfig.flexDefaults);
    persistFlexDraft();
    renderFlexContainerControls();
    renderFlexItemControls();
    renderFlexPreview();
    renderGeneratedFlexCode();
    showStatus("Flexbox builder reset.", "warning");
}

function bindFlexEvents() {
    document.addEventListener("input", function (event) {
        const containerProp = event.target.dataset.containerProp;
        const itemProp = event.target.dataset.itemProp;

        if (containerProp) updateContainerProperty(containerProp, event.target.value);
        if (itemProp) updateItemProperty(event.target.dataset.id, itemProp, event.target.value);
    });

    document.addEventListener("change", function (event) {
        if (event.target.id === "flexPresetSelect") applyFlexPreset(event.target.value);
    });

    document.addEventListener("click", function (event) {
        if (event.target.id === "addFlexItemBtn") addFlexItem();
        if (event.target.id === "saveFlexBtn") saveFlexboxLayout();
        if (event.target.id === "resetFlexBtn") resetFlexboxBuilder();
        if (event.target.id === "copyFlexHtmlBtn") copyText(generateFlexboxHtml(flexState, { prefix: appConfig.defaultPrefix }), "HTML copied.");
        if (event.target.id === "copyFlexCssBtn") copyText(generateFlexboxCss(flexState, { prefix: appConfig.defaultPrefix }), "CSS copied.");

        const remove = event.target.closest("[data-remove-item]");
        const up = event.target.closest("[data-move-up]");
        const down = event.target.closest("[data-move-down]");

        if (remove) removeFlexItem(remove.dataset.removeItem);
        if (up) reorderFlexItem(up.dataset.moveUp, -1);
        if (down) reorderFlexItem(down.dataset.moveDown, 1);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    initSharedLayout("flexbox");
    initPageTransitions();
    flexState = getFlexDraft();
    renderFlexPresetOptions();
    renderFlexContainerControls();
    renderFlexItemControls();
    renderFlexPreview();
    renderGeneratedFlexCode();
    bindFlexEvents();
});
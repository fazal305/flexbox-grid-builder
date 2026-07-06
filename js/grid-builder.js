const gridOptions = {
    justifyItems: ["stretch", "start", "center", "end"],
    alignItems: ["stretch", "start", "center", "end"]
};

const gridPresets = [
    { id: "", name: "Choose a preset", config: null },
    {
        id: "holy-grail",
        name: "Holy Grail Layout",
        config: {
            container: {
                columns: ["220px", "1fr", "220px"],
                rows: ["80px", "1fr", "72px"],
                columnGap: 16,
                rowGap: 16,
                justifyItems: "stretch",
                alignItems: "stretch",
                templateAreas: [
                    ["header", "header", "header"],
                    ["nav", "main", "aside"],
                    ["footer", "footer", "footer"]
                ]
            },
            items: [
                { label: "Header", columnStart: 1, columnEnd: 4, rowStart: 1, rowEnd: 2, areaName: "header", color: "#22d3ee" },
                { label: "Nav", columnStart: 1, columnEnd: 2, rowStart: 2, rowEnd: 3, areaName: "nav", color: "#a855f7" },
                { label: "Main", columnStart: 2, columnEnd: 3, rowStart: 2, rowEnd: 3, areaName: "main", color: "#4ade80" },
                { label: "Aside", columnStart: 3, columnEnd: 4, rowStart: 2, rowEnd: 3, areaName: "aside", color: "#facc15" },
                { label: "Footer", columnStart: 1, columnEnd: 4, rowStart: 3, rowEnd: 4, areaName: "footer", color: "#fb7185" }
            ]
        }
    },
    {
        id: "card-grid",
        name: "Card Grid",
        config: {
            container: { columns: ["1fr", "1fr", "1fr"], rows: ["auto", "auto"], columnGap: 18, rowGap: 18, justifyItems: "stretch", alignItems: "stretch", templateAreas: [] },
            items: [
                { label: "Card 1", columnStart: 1, columnEnd: 2, rowStart: 1, rowEnd: 2, areaName: "", color: "#22d3ee" },
                { label: "Card 2", columnStart: 2, columnEnd: 3, rowStart: 1, rowEnd: 2, areaName: "", color: "#a855f7" },
                { label: "Card 3", columnStart: 3, columnEnd: 4, rowStart: 1, rowEnd: 2, areaName: "", color: "#4ade80" },
                { label: "Feature", columnStart: 1, columnEnd: 4, rowStart: 2, rowEnd: 3, areaName: "", color: "#facc15" }
            ]
        }
    },
    {
        id: "dashboard",
        name: "Dashboard Layout",
        config: {
            container: {
                columns: ["240px", "1fr", "1fr"],
                rows: ["90px", "220px", "180px"],
                columnGap: 16,
                rowGap: 16,
                justifyItems: "stretch",
                alignItems: "stretch",
                templateAreas: [
                    ["nav", "top", "top"],
                    ["nav", "chart", "metrics"],
                    ["nav", "table", "table"]
                ]
            },
            items: [
                { label: "Nav", columnStart: 1, columnEnd: 2, rowStart: 1, rowEnd: 4, areaName: "nav", color: "#22d3ee" },
                { label: "Top Bar", columnStart: 2, columnEnd: 4, rowStart: 1, rowEnd: 2, areaName: "top", color: "#a855f7" },
                { label: "Chart", columnStart: 2, columnEnd: 3, rowStart: 2, rowEnd: 3, areaName: "chart", color: "#4ade80" },
                { label: "Metrics", columnStart: 3, columnEnd: 4, rowStart: 2, rowEnd: 3, areaName: "metrics", color: "#facc15" },
                { label: "Table", columnStart: 2, columnEnd: 4, rowStart: 3, rowEnd: 4, areaName: "table", color: "#fb7185" }
            ]
        }
    },
    {
        id: "twelve-column",
        name: "12-Column Grid",
        config: {
            container: {
                columns: Array.from({ length: 12 }, function () { return "1fr"; }),
                rows: ["auto", "auto"],
                columnGap: 12,
                rowGap: 18,
                justifyItems: "stretch",
                alignItems: "stretch",
                templateAreas: []
            },
            items: [
                { label: "Full", columnStart: 1, columnEnd: 13, rowStart: 1, rowEnd: 2, areaName: "", color: "#22d3ee" },
                { label: "Half", columnStart: 1, columnEnd: 7, rowStart: 2, rowEnd: 3, areaName: "", color: "#a855f7" },
                { label: "Half", columnStart: 7, columnEnd: 13, rowStart: 2, rowEnd: 3, areaName: "", color: "#4ade80" }
            ]
        }
    }
];

let gridState = null;
let isPainting = false;

function getGridDraft() {
    const workspace = loadWorkspace();
    if (!workspace.currentGridDraft) {
        workspace.currentGridDraft = cloneData(appConfig.gridDefaults);
        saveWorkspace(workspace);
    }
    return cloneData(workspace.currentGridDraft);
}

function persistGridDraft() {
    const workspace = loadWorkspace();
    workspace.currentGridDraft = cloneData(gridState);
    saveWorkspace(workspace);
}

function renderGridPresetOptions() {
    $("#gridPresetSelect").html(gridPresets.map(function (preset) {
        return `<option value="${preset.id}">${escapeHtml(preset.name)}</option>`;
    }).join(""));
}

function renderTrackControls() {
    $("#columnTracks").html(gridState.container.columns.map(function (track, index) {
        return trackControl("columns", "Column", index, track);
    }).join(""));

    $("#rowTracks").html(gridState.container.rows.map(function (track, index) {
        return trackControl("rows", "Row", index, track);
    }).join(""));
}

function trackControl(type, label, index, value) {
    const removeAttr = type === "columns" ? `data-remove-column="${index}"` : `data-remove-row="${index}"`;
    return `
    <div class="track-editor">
      <div>
        <label class="form-label">${label} ${index + 1}</label>
        <input class="form-control" value="${escapeHtml(value)}" data-track-type="${type}" data-track-index="${index}">
      </div>
      <button class="btn btn-danger-theme btn-sm" type="button" ${removeAttr}>Remove</button>
    </div>
  `;
}

function renderGridContainerControls() {
    const c = gridState.container;
    $("#gridContainerControls").html(`
    <div>
      <label class="form-label">column-gap: <span>${c.columnGap}px</span></label>
      <input class="form-range" type="range" min="0" max="80" value="${c.columnGap}" data-grid-container-prop="columnGap">
    </div>
    <div>
      <label class="form-label">row-gap: <span>${c.rowGap}px</span></label>
      <input class="form-range" type="range" min="0" max="80" value="${c.rowGap}" data-grid-container-prop="rowGap">
    </div>
    <div>
      <label class="form-label">justify-items</label>
      <select class="form-select" data-grid-container-prop="justifyItems">
        ${gridOptions.justifyItems.map(function (option) {
        return `<option value="${option}" ${c.justifyItems === option ? "selected" : ""}>${option}</option>`;
    }).join("")}
      </select>
    </div>
    <div>
      <label class="form-label">align-items</label>
      <select class="form-select" data-grid-container-prop="alignItems">
        ${gridOptions.alignItems.map(function (option) {
        return `<option value="${option}" ${c.alignItems === option ? "selected" : ""}>${option}</option>`;
    }).join("")}
      </select>
    </div>
  `);
}

function renderGridPreview() {
    const preview = document.getElementById("gridPreview");
    preview.className = "grid-canvas";
    preview.innerHTML = "";
    Object.assign(preview.style, {
        gridTemplateColumns: gridState.container.columns.join(" "),
        gridTemplateRows: gridState.container.rows.join(" "),
        columnGap: `${gridState.container.columnGap}px`,
        rowGap: `${gridState.container.rowGap}px`,
        justifyItems: gridState.container.justifyItems,
        alignItems: gridState.container.alignItems,
        minHeight: "420px"
    });

    if (gridState.container.templateAreas.length) {
        preview.style.gridTemplateAreas = gridState.container.templateAreas
            .map(function (row) { return `"${row.map(function (cell) { return cell || "."; }).join(" ")}"`; })
            .join(" ");
    } else {
        preview.style.gridTemplateAreas = "";
    }

    gridState.items.forEach(function (item) {
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
}

function addColumnTrack() {
    gridState.container.columns.push("1fr");
    normalizeTemplateAreas();
    persistAndRenderGrid();
}

function removeColumnTrack(index) {
    if (gridState.container.columns.length <= 1) return;
    gridState.container.columns.splice(index, 1);
    normalizeTemplateAreas();
    persistAndRenderGrid();
}

function addRowTrack() {
    gridState.container.rows.push("auto");
    normalizeTemplateAreas();
    persistAndRenderGrid();
}

function removeRowTrack(index) {
    if (gridState.container.rows.length <= 1) return;
    gridState.container.rows.splice(index, 1);
    normalizeTemplateAreas();
    persistAndRenderGrid();
}

function updateTrackSize(type, index, value) {
    gridState.container[type][index] = value;
    persistAndRenderGrid(false);
}

function updateGridContainerProperty(name, value) {
    const numeric = ["columnGap", "rowGap"];
    gridState.container[name] = numeric.includes(name) ? Number(value) : value;
    persistAndRenderGrid();
}

function addGridItem() {
    const workspace = loadWorkspace();
    const theme = workspace.theme;
    gridState.items.push({
        id: generateId("item"),
        label: `Item ${gridState.items.length + 1}`,
        columnStart: 1,
        columnEnd: Math.min(2, gridState.container.columns.length + 1),
        rowStart: 1,
        rowEnd: Math.min(2, gridState.container.rows.length + 1),
        areaName: "",
        color: gridState.items.length % 2 ? theme.secondary : theme.primary
    });
    persistAndRenderGrid();
}

function removeGridItem(id) {
    gridState.items = gridState.items.filter(function (item) {
        return item.id !== id;
    });
    persistAndRenderGrid();
}

function updateGridItemPlacement(id, field, value) {
    const item = gridState.items.find(function (entry) {
        return entry.id === id;
    });
    if (!item) return;

    const numeric = ["columnStart", "columnEnd", "rowStart", "rowEnd"];
    item[field] = numeric.includes(field) ? Number(value) : value;
    persistAndRenderGrid(false);
}

function normalizeTemplateAreas() {
    const rowCount = gridState.container.rows.length;
    const colCount = gridState.container.columns.length;

    if (!gridState.container.templateAreas.length) {
        gridState.container.templateAreas = Array.from({ length: rowCount }, function () {
            return Array.from({ length: colCount }, function () { return ""; });
        });
        return;
    }

    gridState.container.templateAreas = Array.from({ length: rowCount }, function (_, rowIndex) {
        const row = gridState.container.templateAreas[rowIndex] || [];
        return Array.from({ length: colCount }, function (_, colIndex) {
            return row[colIndex] || "";
        });
    });
}

function paintTemplateArea(cellRow, cellCol, areaName) {
    normalizeTemplateAreas();
    gridState.container.templateAreas[cellRow][cellCol] = slugify(areaName);
    persistAndRenderGrid();
}

function renderAreaPainter() {
    normalizeTemplateAreas();
    const rowCount = gridState.container.rows.length;
    const colCount = gridState.container.columns.length;
    const cells = [];

    for (let row = 0; row < rowCount; row += 1) {
        for (let col = 0; col < colCount; col += 1) {
            const value = gridState.container.templateAreas[row][col] || ".";
            cells.push(`<button class="grid-painter-cell" type="button" data-cell-row="${row}" data-cell-col="${col}">${escapeHtml(value)}</button>`);
        }
    }

    $("#gridPainter").html(`
    <div class="grid-painter-board" style="grid-template-columns: repeat(${colCount}, minmax(0, 1fr));">
      ${cells.join("")}
    </div>
  `);
}

function renderGridItemControls() {
    $("#gridItemControls").html(gridState.items.map(function (item) {
        return `
      <article class="item-editor">
        <div class="item-editor-header">
          <h3 class="item-editor-title">${escapeHtml(item.label)}</h3>
          <button class="btn btn-danger-theme btn-sm" type="button" data-remove-grid-item="${item.id}">Remove</button>
        </div>
        <div class="grid-placement-grid">
          <div>
            <label class="form-label">Label</label>
            <input class="form-control" value="${escapeHtml(item.label)}" data-grid-item-prop="label" data-id="${item.id}">
          </div>
          <div>
            <label class="form-label">Area name</label>
            <input class="form-control" value="${escapeHtml(item.areaName)}" data-grid-item-prop="areaName" data-id="${item.id}">
          </div>
          <div>
            <label class="form-label">column start</label>
            <input class="form-control" type="number" min="1" value="${item.columnStart}" data-grid-item-prop="columnStart" data-id="${item.id}">
          </div>
          <div>
            <label class="form-label">column end</label>
            <input class="form-control" type="number" min="1" value="${item.columnEnd}" data-grid-item-prop="columnEnd" data-id="${item.id}">
          </div>
          <div>
            <label class="form-label">row start</label>
            <input class="form-control" type="number" min="1" value="${item.rowStart}" data-grid-item-prop="rowStart" data-id="${item.id}">
          </div>
          <div>
            <label class="form-label">row end</label>
            <input class="form-control" type="number" min="1" value="${item.rowEnd}" data-grid-item-prop="rowEnd" data-id="${item.id}">
          </div>
          <div class="color-input-row">
            <div>
              <label class="form-label">Preview color</label>
              <input class="form-control" value="${escapeHtml(item.color)}" data-grid-item-prop="color" data-id="${item.id}">
            </div>
            <input class="form-control form-control-color" type="color" value="${item.color}" data-grid-item-prop="color" data-id="${item.id}">
          </div>
        </div>
      </article>
    `;
    }).join("") || renderEmptyState("No grid items yet. Add an item to begin."));
}

function renderGeneratedGridCode() {
    $("#gridHtmlCode").text(generateGridHtml(gridState, { prefix: appConfig.defaultPrefix }));
    $("#gridCssCode").text(generateGridCss(gridState, { prefix: appConfig.defaultPrefix }));
}

function applyGridPreset(presetId) {
    const preset = gridPresets.find(function (item) {
        return item.id === presetId;
    });

    if (!preset || !preset.config) return;

    gridState = cloneData(preset.config);
    gridState.items = gridState.items.map(function (item) {
        return { ...item, id: generateId("item") };
    });
    persistAndRenderGrid();
    showStatus(`Applied ${preset.name}.`, "success");
}

function saveGridLayout() {
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
        type: "grid",
        tags,
        config: cloneData(gridState),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });

    saveWorkspace(workspace);
    addActivityLog("Grid Builder", "Saved layout", `Saved layout '${name}'`);
    showStatus("Grid layout saved.", "success");
}

function resetGridBuilder() {
    if (!window.confirm("Reset the Grid builder draft?")) return;
    gridState = cloneData(appConfig.gridDefaults);
    persistAndRenderGrid();
    showStatus("Grid builder reset.", "warning");
}

function clearTemplateAreas() {
    gridState.container.templateAreas = [];
    persistAndRenderGrid();
}

function persistAndRenderGrid(renderControls) {
    persistGridDraft();
    renderGridPreview();
    renderGeneratedGridCode();
    renderAreaPainter();

    if (renderControls !== false) {
        renderTrackControls();
        renderGridContainerControls();
        renderGridItemControls();
    }
}

function bindGridEvents() {
    document.addEventListener("input", function (event) {
        if (event.target.dataset.trackType) {
            updateTrackSize(event.target.dataset.trackType, Number(event.target.dataset.trackIndex), event.target.value);
        }

        if (event.target.dataset.gridContainerProp) {
            updateGridContainerProperty(event.target.dataset.gridContainerProp, event.target.value);
        }

        if (event.target.dataset.gridItemProp) {
            updateGridItemPlacement(event.target.dataset.id, event.target.dataset.gridItemProp, event.target.value);
        }
    });

    document.addEventListener("change", function (event) {
        if (event.target.id === "gridPresetSelect") applyGridPreset(event.target.value);
    });

    document.addEventListener("click", function (event) {
        if (event.target.id === "addColumnBtn") addColumnTrack();
        if (event.target.id === "addRowBtn") addRowTrack();
        if (event.target.id === "addGridItemBtn") addGridItem();
        if (event.target.id === "saveGridBtn") saveGridLayout();
        if (event.target.id === "resetGridBtn") resetGridBuilder();
        if (event.target.id === "clearAreasBtn") clearTemplateAreas();
        if (event.target.id === "copyGridHtmlBtn") copyText(generateGridHtml(gridState, { prefix: appConfig.defaultPrefix }), "HTML copied.");
        if (event.target.id === "copyGridCssBtn") copyText(generateGridCss(gridState, { prefix: appConfig.defaultPrefix }), "CSS copied.");

        const removeColumn = event.target.closest("[data-remove-column]");
        const removeRow = event.target.closest("[data-remove-row]");
        const removeItem = event.target.closest("[data-remove-grid-item]");
        const cell = event.target.closest("[data-cell-row]");

        if (removeColumn) removeColumnTrack(Number(removeColumn.dataset.removeColumn));
        if (removeRow) removeRowTrack(Number(removeRow.dataset.removeRow));
        if (removeItem) removeGridItem(removeItem.dataset.removeGridItem);

        if (cell) {
            const areaName = document.getElementById("areaNameInput").value;
            if (!areaName) {
                showStatus("Enter an area name before painting.", "warning");
                return;
            }
            paintTemplateArea(Number(cell.dataset.cellRow), Number(cell.dataset.cellCol), areaName);
        }
    });

    document.addEventListener("mousedown", function (event) {
        if (!event.target.closest("[data-cell-row]")) return;
        isPainting = true;
    });

    document.addEventListener("mouseup", function () {
        isPainting = false;
    });

    document.addEventListener("mouseover", function (event) {
        const cell = event.target.closest("[data-cell-row]");
        if (!isPainting || !cell) return;

        const areaName = document.getElementById("areaNameInput").value;
        if (!areaName) return;
        paintTemplateArea(Number(cell.dataset.cellRow), Number(cell.dataset.cellCol), areaName);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    initSharedLayout("grid");
    initPageTransitions();
    gridState = getGridDraft();
    renderGridPresetOptions();
    persistAndRenderGrid();
    bindGridEvents();
});
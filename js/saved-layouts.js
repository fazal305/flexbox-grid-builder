let savedFilterState = {
    query: "",
    type: "",
    tag: ""
};

function renderTagFilter() {
    const workspace = loadWorkspace();
    const tags = [...new Set(workspace.savedLayouts.flatMap(function (layout) {
        return layout.tags || [];
    }))].sort();

    const current = $("#tagFilter").val() || "";
    $("#tagFilter").html(`
    <option value="">All tags</option>
    ${tags.map(function (tag) {
        return `<option value="${escapeHtml(tag)}" ${current === tag ? "selected" : ""}>${escapeHtml(tag)}</option>`;
    }).join("")}
  `);
}

function filterSavedLayouts(query, type, tag) {
    const q = String(query || "").toLowerCase().trim();
    const workspace = loadWorkspace();

    return workspace.savedLayouts.filter(function (layout) {
        const matchesQuery = !q || layout.name.toLowerCase().includes(q);
        const matchesType = !type || layout.type === type;
        const matchesTag = !tag || (layout.tags || []).includes(tag);
        return matchesQuery && matchesType && matchesTag;
    });
}

function renderSavedLayouts() {
    renderTagFilter();

    const layouts = filterSavedLayouts(savedFilterState.query, savedFilterState.type, savedFilterState.tag)
        .sort(function (a, b) {
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });

    $("#filterSummary").text(`${layouts.length} layout${layouts.length === 1 ? "" : "s"} shown`);
    const target = document.getElementById("savedLayoutsGrid");

    if (!layouts.length) {
        target.innerHTML = renderEmptyState("No saved layouts match the current filters.");
        return;
    }

    target.innerHTML = layouts.map(function (layout) {
        const typeLabel = layout.type === "grid" ? "Grid" : "Flexbox";
        const typeClass = layout.type === "grid" ? "badge-grid" : "badge-flex";
        const tags = (layout.tags || []).map(function (tag) {
            return `<span class="badge-theme">${escapeHtml(tag)}</span>`;
        }).join("");

        return `
      <article class="layout-card" data-card="${layout.id}">
        <div class="layout-card-header">
          <div>
            <h2 class="layout-title">${escapeHtml(layout.name)}</h2>
            <p class="layout-meta">
              <span class="saved-type-pill badge-theme ${typeClass}">${typeLabel}</span>
              Updated ${formatTimestamp(layout.updatedAt)}
            </p>
          </div>
        </div>
        <div class="mini-preview" data-preview="${layout.id}"></div>
        <div class="saved-tags">${tags || `<span class="text-muted-theme">No tags</span>`}</div>
        <div class="rename-inline" data-rename-panel="${layout.id}" hidden>
          <input class="form-control form-control-sm" value="${escapeHtml(layout.name)}" data-rename-input="${layout.id}">
          <button class="btn btn-theme btn-sm" type="button" data-rename-save="${layout.id}">Save</button>
        </div>
        <div class="saved-card-footer">
          <small class="text-muted-theme">Created ${formatTimestamp(layout.createdAt)}</small>
          <div class="layout-actions">
            <button class="btn btn-outline-theme btn-sm" type="button" data-open="${layout.id}">Open</button>
            <button class="btn btn-outline-theme btn-sm" type="button" data-duplicate="${layout.id}">Duplicate</button>
            <button class="btn btn-outline-theme btn-sm" type="button" data-rename="${layout.id}">Rename</button>
            <button class="btn btn-outline-theme btn-sm" type="button" data-export="${layout.id}">Export</button>
            <button class="btn btn-danger-theme btn-sm" type="button" data-delete="${layout.id}">Delete</button>
          </div>
        </div>
      </article>
    `;
    }).join("");

    layouts.forEach(function (layout) {
        renderMiniPreview(layout.config, layout.type, document.querySelector(`[data-preview="${layout.id}"]`));
    });
}

function openLayoutInBuilder(id) {
    const workspace = loadWorkspace();
    const layout = workspace.savedLayouts.find(function (item) {
        return item.id === id;
    });
    if (!layout) return;

    if (layout.type === "grid") {
        workspace.currentGridDraft = cloneData(layout.config);
        saveWorkspace(workspace);
        window.location.href = "grid-builder.html";
    } else {
        workspace.currentFlexboxDraft = cloneData(layout.config);
        saveWorkspace(workspace);
        window.location.href = "flexbox-builder.html";
    }
}

function duplicateLayout(id) {
    const workspace = loadWorkspace();
    const layout = workspace.savedLayouts.find(function (item) {
        return item.id === id;
    });
    if (!layout) return;

    workspace.savedLayouts.unshift({
        ...cloneData(layout),
        id: generateId("layout"),
        name: `${layout.name} Copy`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });

    saveWorkspace(workspace);
    addActivityLog("Saved Layouts", "Duplicated layout", `Duplicated '${layout.name}'`);
    renderSavedLayouts();
    showStatus("Layout duplicated.", "success");
}

function renameLayout(id, newName) {
    const workspace = loadWorkspace();
    const layout = workspace.savedLayouts.find(function (item) {
        return item.id === id;
    });

    if (!layout || !newName.trim()) return;

    const oldName = layout.name;
    layout.name = newName.trim();
    layout.updatedAt = new Date().toISOString();
    saveWorkspace(workspace);
    addActivityLog("Saved Layouts", "Renamed layout", `Renamed '${oldName}' to '${layout.name}'`);
    renderSavedLayouts();
    showStatus("Layout renamed.", "success");
}

function deleteLayout(id) {
    const workspace = loadWorkspace();
    const layout = workspace.savedLayouts.find(function (item) {
        return item.id === id;
    });
    if (!layout) return;
    if (!window.confirm(`Delete "${layout.name}"?`)) return;

    workspace.savedLayouts = workspace.savedLayouts.filter(function (item) {
        return item.id !== id;
    });

    saveWorkspace(workspace);
    addActivityLog("Saved Layouts", "Deleted layout", `Deleted '${layout.name}'`);
    renderSavedLayouts();
    showStatus("Layout deleted.", "danger");
}

function exportLayout(id) {
    localStorage.setItem("flexboxGridBuilderExportSource", id);
    window.location.href = "export.html";
}

function bindSavedLayoutEvents() {
    $("#layoutSearch").on("input", function () {
        savedFilterState.query = this.value;
        renderSavedLayouts();
    });

    $("#typeFilter").on("change", function () {
        savedFilterState.type = this.value;
        renderSavedLayouts();
    });

    $("#tagFilter").on("change", function () {
        savedFilterState.tag = this.value;
        renderSavedLayouts();
    });

    document.addEventListener("click", function (event) {
        const open = event.target.closest("[data-open]");
        const duplicate = event.target.closest("[data-duplicate]");
        const rename = event.target.closest("[data-rename]");
        const renameSave = event.target.closest("[data-rename-save]");
        const remove = event.target.closest("[data-delete]");
        const exportButton = event.target.closest("[data-export]");

        if (open) openLayoutInBuilder(open.dataset.open);
        if (duplicate) duplicateLayout(duplicate.dataset.duplicate);
        if (remove) deleteLayout(remove.dataset.delete);
        if (exportButton) exportLayout(exportButton.dataset.export);

        if (rename) {
            const panel = document.querySelector(`[data-rename-panel="${rename.dataset.rename}"]`);
            if (panel) panel.hidden = !panel.hidden;
        }

        if (renameSave) {
            const input = document.querySelector(`[data-rename-input="${renameSave.dataset.renameSave}"]`);
            renameLayout(renameSave.dataset.renameSave, input.value);
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    initSharedLayout("saved");
    initPageTransitions();
    renderSavedLayouts();
    bindSavedLayoutEvents();
});
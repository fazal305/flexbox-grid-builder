const dashboardActions = [
    {
        title: "New Flexbox Layout",
        text: "Open the visual Flexbox builder and start from a dynamic draft.",
        href: "flexbox-builder.html",
        icon: "⇄"
    },
    {
        title: "New Grid Layout",
        text: "Design CSS Grid tracks, items, and named template areas.",
        href: "grid-builder.html",
        icon: "▦"
    },
    {
        title: "View Saved Layouts",
        text: "Search, filter, duplicate, rename, delete, or reopen layouts.",
        href: "saved-layouts.html",
        icon: "▣"
    },
    {
        title: "Export Center",
        text: "Preview exact export output and download HTML or CSS files.",
        href: "export.html",
        icon: "⇩"
    }
];

function renderDashboardStats() {
    const workspace = loadWorkspace();
    const total = workspace.savedLayouts.length;
    const flexCount = workspace.savedLayouts.filter(function (layout) {
        return layout.type === "flex";
    }).length;
    const gridCount = workspace.savedLayouts.filter(function (layout) {
        return layout.type === "grid";
    }).length;
    const recent = [...workspace.savedLayouts].sort(function (a, b) {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
    })[0];

    const stats = [
        { label: "Saved Layouts", value: total },
        { label: "Flexbox Layouts", value: flexCount },
        { label: "Grid Layouts", value: gridCount },
        { label: "Most Recent", value: recent ? recent.name : "None" }
    ];

    $("#dashboardStats").html(stats.map(function (stat) {
        return `
      <article class="stat-card">
        <p class="stat-label">${escapeHtml(stat.label)}</p>
        <p class="stat-value">${escapeHtml(stat.value)}</p>
      </article>
    `;
    }).join(""));
}

function renderRecentLayouts() {
    const workspace = loadWorkspace();
    const layouts = [...workspace.savedLayouts]
        .sort(function (a, b) {
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        })
        .slice(0, 4);

    const target = document.getElementById("recentLayouts");

    if (!layouts.length) {
        target.innerHTML = renderEmptyState("No saved layouts yet. Create a Flexbox or Grid layout to see it here.");
        return;
    }

    target.innerHTML = layouts.map(function (layout) {
        const badgeClass = layout.type === "grid" ? "badge-grid" : "badge-flex";
        return `
      <article class="layout-card" data-layout-card="${layout.id}">
        <div class="layout-card-header">
          <div>
            <h3 class="layout-title">${escapeHtml(layout.name)}</h3>
            <p class="layout-meta">
              <span class="badge-theme ${badgeClass}">${layout.type === "grid" ? "Grid" : "Flexbox"}</span>
              Updated ${formatTimestamp(layout.updatedAt)}
            </p>
          </div>
        </div>
        <div class="mini-preview" data-preview="${layout.id}"></div>
        <div class="layout-actions">
          <button class="btn btn-outline-theme btn-sm" type="button" data-open="${layout.id}">Open</button>
          <button class="btn btn-outline-theme btn-sm" type="button" data-duplicate="${layout.id}">Duplicate</button>
          <button class="btn btn-danger-theme btn-sm" type="button" data-delete="${layout.id}">Delete</button>
        </div>
      </article>
    `;
    }).join("");

    layouts.forEach(function (layout) {
        renderMiniPreview(layout.config, layout.type, document.querySelector(`[data-preview="${layout.id}"]`));
    });
}

function renderRecentActivityLog() {
    const workspace = loadWorkspace();
    const entries = workspace.activityLog.slice(0, 8);
    const target = document.getElementById("activityLog");

    if (!entries.length) {
        target.innerHTML = `<li>${renderEmptyState("No activity yet.")}</li>`;
        return;
    }

    target.innerHTML = entries.map(function (entry) {
        return `
      <li class="activity-item">
        <span class="activity-dot"></span>
        <span>
          <p class="activity-title">${escapeHtml(entry.module)} · ${escapeHtml(entry.action)}</p>
          <p class="activity-detail">${escapeHtml(entry.detail)}</p>
          <p class="activity-time">${formatTimestamp(entry.createdAt)}</p>
        </span>
      </li>
    `;
    }).join("");
}

function renderQuickActions() {
    $("#quickActions").html(dashboardActions.map(function (action) {
        return `
      <a class="action-card" href="${action.href}">
        <span class="quick-action-icon">${action.icon}</span>
        <p class="action-card-title">${escapeHtml(action.title)}</p>
        <p class="action-card-text">${escapeHtml(action.text)}</p>
      </a>
    `;
    }).join(""));
}

function openDashboardLayout(id) {
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

function duplicateDashboardLayout(id) {
    const workspace = loadWorkspace();
    const layout = workspace.savedLayouts.find(function (item) {
        return item.id === id;
    });

    if (!layout) return;

    const copy = {
        ...cloneData(layout),
        id: generateId("layout"),
        name: `${layout.name} Copy`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    workspace.savedLayouts.unshift(copy);
    saveWorkspace(workspace);
    addActivityLog("Dashboard", "Duplicated layout", `Duplicated '${layout.name}'`);
    renderDashboardStats();
    renderRecentLayouts();
    renderRecentActivityLog();
    showStatus("Layout duplicated.", "success");
}

function deleteDashboardLayout(id) {
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
    addActivityLog("Dashboard", "Deleted layout", `Deleted '${layout.name}'`);
    renderDashboardStats();
    renderRecentLayouts();
    renderRecentActivityLog();
    showStatus("Layout deleted.", "danger");
}

function bindDashboardEvents() {
    document.addEventListener("click", function (event) {
        const openButton = event.target.closest("[data-open]");
        const duplicateButton = event.target.closest("[data-duplicate]");
        const deleteButton = event.target.closest("[data-delete]");

        if (openButton) {
            openDashboardLayout(openButton.dataset.open);
        }

        if (duplicateButton) {
            duplicateDashboardLayout(duplicateButton.dataset.duplicate);
        }

        if (deleteButton) {
            deleteDashboardLayout(deleteButton.dataset.delete);
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    initSharedLayout("dashboard");
    initPageTransitions();
    renderDashboardStats();
    renderQuickActions();
    renderRecentLayouts();
    renderRecentActivityLog();
    bindDashboardEvents();
});
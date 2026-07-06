const editableThemeTokens = [
    { key: "bg", label: "Background", type: "color" },
    { key: "bgSoft", label: "Soft background", type: "color" },
    { key: "card", label: "Card surface", type: "text" },
    { key: "text", label: "Text", type: "color" },
    { key: "muted", label: "Muted text", type: "color" },
    { key: "primary", label: "Primary accent", type: "color" },
    { key: "secondary", label: "Secondary accent", type: "color" },
    { key: "success", label: "Success", type: "color" },
    { key: "warning", label: "Warning", type: "color" },
    { key: "danger", label: "Danger", type: "color" },
    { key: "radius", label: "Radius", type: "range", min: 4, max: 28 },
    { key: "fontFamily", label: "Font family", type: "font" }
];

const fontOptions = [
    "Inter, sans-serif",
    "Arial, sans-serif",
    "Verdana, sans-serif",
    "Georgia, serif",
    "Trebuchet MS, sans-serif"
];

const themePresets = [
    {
        id: "midnight",
        name: "Midnight Studio",
        theme: cloneData(defaultWorkspace.theme)
    },
    {
        id: "light-pro",
        name: "Light Pro",
        theme: {
            bg: "#f7fafc",
            bgSoft: "#edf2f7",
            card: "rgba(255, 255, 255, 0.92)",
            text: "#111827",
            muted: "#64748b",
            primary: "#2563eb",
            secondary: "#7c3aed",
            success: "#16a34a",
            warning: "#ca8a04",
            danger: "#e11d48",
            radius: 14,
            fontFamily: "Inter, sans-serif"
        }
    },
    {
        id: "graphite",
        name: "Graphite Console",
        theme: {
            bg: "#0f1115",
            bgSoft: "#181b22",
            card: "rgba(27, 31, 40, 0.94)",
            text: "#f4f7fb",
            muted: "#a7b0c0",
            primary: "#38bdf8",
            secondary: "#818cf8",
            success: "#22c55e",
            warning: "#eab308",
            danger: "#f43f5e",
            radius: 10,
            fontFamily: "Arial, sans-serif"
        }
    }
];

function colorValueForInput(value) {
    const text = String(value || "");
    return text.startsWith("#") ? text : defaultWorkspace.theme.card.startsWith("#") ? defaultWorkspace.theme.card : "#111827";
}

function renderThemeCustomizer() {
    const workspace = loadWorkspace();
    const theme = workspace.theme;

    $("#themeCustomizer").html(editableThemeTokens.map(function (token) {
        const value = theme[token.key];

        if (token.type === "range") {
            return `
        <div>
          <label class="form-label">${token.label}: <span>${value}px</span></label>
          <input class="form-range" type="range" min="${token.min}" max="${token.max}" value="${value}" data-theme-token="${token.key}">
        </div>
      `;
        }

        if (token.type === "font") {
            return `
        <div>
          <label class="form-label">${token.label}</label>
          <select class="form-select" data-theme-token="${token.key}">
            ${fontOptions.map(function (font) {
                return `<option value="${escapeHtml(font)}" ${font === value ? "selected" : ""}>${escapeHtml(font)}</option>`;
            }).join("")}
          </select>
        </div>
      `;
        }

        if (token.type === "text") {
            return `
        <div>
          <label class="form-label">${token.label}</label>
          <input class="form-control" value="${escapeHtml(value)}" data-theme-token="${token.key}">
        </div>
      `;
        }

        return `
      <div class="theme-token-control">
        <div>
          <label class="form-label">${token.label}</label>
          <input class="form-control" value="${escapeHtml(value)}" data-theme-token="${token.key}">
        </div>
        <input class="form-control form-control-color" type="color" value="${colorValueForInput(value)}" data-theme-token="${token.key}">
      </div>
    `;
    }).join(""));
}

function renderThemePresets() {
    $("#themePresets").html(themePresets.map(function (preset) {
        const swatches = ["bg", "card", "text", "primary", "secondary"].map(function (key) {
            return `<span class="theme-swatch" style="background:${preset.theme[key]}"></span>`;
        }).join("");

        return `
      <article class="theme-preset-card" data-theme-preset="${preset.id}">
        <div class="theme-preset-swatches">${swatches}</div>
        <h3 class="layout-title">${escapeHtml(preset.name)}</h3>
        <p class="layout-meta">Loads editable token values into the current workspace.</p>
      </article>
    `;
    }).join(""));
}

function updateThemeToken(name, value) {
    const workspace = loadWorkspace();
    workspace.theme[name] = name === "radius" ? Number(value) : value;
    saveWorkspace(workspace);
    applyThemeSettings();
    renderThemeCustomizer();
}

function applyThemePreset(presetId) {
    const preset = themePresets.find(function (item) {
        return item.id === presetId;
    });
    if (!preset) return;

    const workspace = loadWorkspace();
    workspace.theme = cloneData(preset.theme);
    saveWorkspace(workspace);
    applyThemeSettings();
    renderThemeCustomizer();
    renderExperienceControls();
    addActivityLog("Settings", "Theme changed", `Applied '${preset.name}' theme`);
    showStatus("Theme preset applied.", "success");
}

function resetThemeToDefault() {
    const workspace = loadWorkspace();
    workspace.theme = cloneData(defaultWorkspace.theme);
    saveWorkspace(workspace);
    applyThemeSettings();
    renderThemeCustomizer();
    addActivityLog("Settings", "Theme reset", "Reset theme to defaults");
    showStatus("Theme reset.", "warning");
}

function setTransitionSpeed(ms) {
    const workspace = loadWorkspace();
    workspace.settings.transitionSpeedMs = Number(ms);
    saveWorkspace(workspace);
    applyThemeSettings();
    renderExperienceControls();
}

function toggleCompactSidebar() {
    const workspace = loadWorkspace();
    workspace.settings.compactSidebar = !workspace.settings.compactSidebar;
    saveWorkspace(workspace);
    applyThemeSettings();
}

function exportWorkspace() {
    downloadJson("flexbox-grid-builder-workspace.json", loadWorkspace());
}

function importWorkspace(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function () {
        try {
            const imported = mergeWorkspace(JSON.parse(reader.result));
            saveWorkspace(imported);
            applyThemeSettings();
            renderSettingsPage();
            addActivityLog("Settings", "Imported workspace", "Imported workspace JSON");
            showStatus("Workspace imported.", "success");
        } catch (error) {
            showStatus("Workspace import failed.", "danger");
        }
    };
    reader.readAsText(file);
}

function resetDemoWorkspace() {
    if (!window.confirm("Reset workspace to seeded demo data?")) return;
    saveWorkspace(seedDemoData());
    applyThemeSettings();
    renderSettingsPage();
    showStatus("Demo data restored.", "warning");
}

function clearWorkspace() {
    if (!window.confirm("Clear all Flexbox/Grid Builder localStorage data?")) return;
    localStorage.removeItem(STORAGE_KEY);
    saveWorkspace(seedDemoData());
    applyThemeSettings();
    renderSettingsPage();
    showStatus("Workspace cleared and demo data re-seeded.", "danger");
}

function renderExperienceControls() {
    const workspace = loadWorkspace();
    $("#transitionSpeed").val(workspace.settings.transitionSpeedMs);
    $("#transitionSpeedValue").text(`${workspace.settings.transitionSpeedMs}ms`);
    $("#compactSidebarToggle").prop("checked", workspace.settings.compactSidebar);
}

function renderSettingsPage() {
    renderThemeCustomizer();
    renderThemePresets();
    renderExperienceControls();
}

function bindSettingsEvents() {
    document.addEventListener("input", function (event) {
        if (event.target.dataset.themeToken) {
            updateThemeToken(event.target.dataset.themeToken, event.target.value);
        }

        if (event.target.id === "transitionSpeed") {
            setTransitionSpeed(event.target.value);
        }
    });

    document.addEventListener("change", function (event) {
        if (event.target.id === "compactSidebarToggle") toggleCompactSidebar();
        if (event.target.id === "importWorkspaceInput") importWorkspace(event);
    });

    document.addEventListener("click", function (event) {
        const preset = event.target.closest("[data-theme-preset]");
        if (preset) applyThemePreset(preset.dataset.themePreset);

        if (event.target.id === "exportWorkspaceBtn") exportWorkspace();
        if (event.target.id === "resetDemoBtn") resetDemoWorkspace();
        if (event.target.id === "clearWorkspaceBtn") clearWorkspace();
    });

    const resetButton = document.createElement("button");
    resetButton.className = "btn btn-outline-theme mt-3";
    resetButton.id = "resetThemeBtn";
    resetButton.type = "button";
    resetButton.textContent = "Reset to Default Theme";
    document.querySelector("#themeCustomizer").after(resetButton);

    document.addEventListener("click", function (event) {
        if (event.target.id === "resetThemeBtn") resetThemeToDefault();
    });
}

document.addEventListener("DOMContentLoaded", function () {
    initSharedLayout("settings");
    initPageTransitions();
    renderSettingsPage();
    bindSettingsEvents();
});
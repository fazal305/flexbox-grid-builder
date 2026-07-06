let exportState = {
    sourceId: "",
    prefix: appConfig.defaultPrefix,
    minify: false,
    combined: true
};

function getExportSources() {
    const workspace = loadWorkspace();
    const sources = [];

    if (workspace.currentFlexboxDraft) {
        sources.push({
            id: "draft-flex",
            name: "Current Flexbox Draft",
            type: "flex",
            config: workspace.currentFlexboxDraft,
            isDraft: true
        });
    }

    if (workspace.currentGridDraft) {
        sources.push({
            id: "draft-grid",
            name: "Current Grid Draft",
            type: "grid",
            config: workspace.currentGridDraft,
            isDraft: true
        });
    }

    workspace.savedLayouts.forEach(function (layout) {
        sources.push({
            id: layout.id,
            name: layout.name,
            type: layout.type,
            config: layout.config,
            isDraft: false
        });
    });

    return sources;
}

function getSelectedSource() {
    const sources = getExportSources();
    return sources.find(function (source) {
        return source.id === exportState.sourceId;
    }) || sources[0];
}

function renderExportOptions() {
    const sources = getExportSources();
    const preferred = localStorage.getItem("flexboxGridBuilderExportSource");
    if (!exportState.sourceId) {
        exportState.sourceId = preferred || (sources[0] && sources[0].id) || "";
    }

    const selected = getSelectedSource();

    $("#exportOptions").html(`
    <div>
      <label class="form-label" for="exportSource">Source</label>
      <select class="form-select" id="exportSource">
        ${sources.map(function (source) {
        return `<option value="${source.id}" ${selected && selected.id === source.id ? "selected" : ""}>${escapeHtml(source.name)} (${source.type})</option>`;
    }).join("")}
      </select>
      <p class="export-source-meta">${selected ? `${selected.isDraft ? "Unsaved draft" : "Saved layout"} · ${selected.type}` : "No export source available."}</p>
    </div>

    <div>
      <label class="form-label" for="classPrefix">Class-name prefix</label>
      <input class="form-control" id="classPrefix" value="${escapeHtml(exportState.prefix)}">
    </div>

    <label class="export-toggle-card">
      <input class="form-check-input me-2" type="checkbox" id="minifyToggle" ${exportState.minify ? "checked" : ""}>
      Minify generated CSS
    </label>

    <label class="export-toggle-card">
      <input class="form-check-input me-2" type="checkbox" id="combinedToggle" ${exportState.combined ? "checked" : ""}>
      Combine into a single HTML file with embedded style
    </label>
  `);
}

function selectExportSource(sourceId) {
    exportState.sourceId = sourceId;
    localStorage.setItem("flexboxGridBuilderExportSource", sourceId);
    renderExportOptions();
    renderExportPreview();
    renderExportCode();
}

function getExportedCode() {
    const selected = getSelectedSource();
    if (!selected) {
        return { html: "", css: "", fullHtml: "", filename: "layout" };
    }

    const options = {
        prefix: exportState.prefix,
        minify: exportState.minify
    };

    const html = selected.type === "grid"
        ? generateGridHtml(selected.config, options)
        : generateFlexboxHtml(selected.config, options);

    const css = selected.type === "grid"
        ? generateGridCss(selected.config, options)
        : generateFlexboxCss(selected.config, options);

    const fullHtml = [
        "<!doctype html>",
        '<html lang="en">',
        "<head>",
        '  <meta charset="utf-8">',
        '  <meta name="viewport" content="width=device-width, initial-scale=1">',
        `  <title>${escapeHtml(selected.name)}</title>`,
        "  <style>",
        css,
        "  </style>",
        "</head>",
        "<body>",
        html,
        "</body>",
        "</html>"
    ].join("\n");

    return {
        html,
        css,
        fullHtml,
        filename: slugify(selected.name)
    };
}

function renderExportPreview() {
    const code = getExportedCode();
    const frame = document.getElementById("exportPreviewFrame");

    frame.srcdoc = [
        "<!doctype html>",
        "<html>",
        "<head>",
        "<style>",
        "body{margin:0;padding:24px;font-family:Arial,sans-serif;background:#f8fafc;}",
        code.css,
        "</style>",
        "</head>",
        "<body>",
        code.html,
        "</body>",
        "</html>"
    ].join("\n");
}

function renderExportCode() {
    const code = getExportedCode();

    if (exportState.combined) {
        $("#exportHtmlCode").text(code.fullHtml);
        $("#exportCssCode").text("/* CSS is embedded in the exported HTML file. Toggle separate files to view standalone CSS. */");
    } else {
        $("#exportHtmlCode").text(code.html);
        $("#exportCssCode").text(code.css);
    }
}

function copyExportedHtml() {
    const code = getExportedCode();
    copyText(exportState.combined ? code.fullHtml : code.html, "Export HTML copied.");
}

function copyExportedCss() {
    const code = getExportedCode();
    copyText(code.css, "Export CSS copied.");
}

function downloadExportedHtml() {
    const code = getExportedCode();
    downloadTextFile(`${code.filename}.html`, exportState.combined ? code.fullHtml : code.html);
    addActivityLog("Export Center", "Downloaded HTML", `Downloaded '${code.filename}.html'`);
}

function downloadExportedCss() {
    const code = getExportedCode();
    downloadTextFile(`${code.filename}.css`, code.css);
    addActivityLog("Export Center", "Downloaded CSS", `Downloaded '${code.filename}.css'`);
}

function bindExportEvents() {
    document.addEventListener("change", function (event) {
        if (event.target.id === "exportSource") {
            selectExportSource(event.target.value);
        }

        if (event.target.id === "minifyToggle") {
            exportState.minify = event.target.checked;
            renderExportPreview();
            renderExportCode();
        }

        if (event.target.id === "combinedToggle") {
            exportState.combined = event.target.checked;
            renderExportCode();
        }
    });

    document.addEventListener("input", function (event) {
        if (event.target.id === "classPrefix") {
            exportState.prefix = event.target.value || appConfig.defaultPrefix;
            renderExportPreview();
            renderExportCode();
        }
    });

    document.addEventListener("click", function (event) {
        if (event.target.id === "copyExportHtmlBtn") copyExportedHtml();
        if (event.target.id === "copyExportCssBtn") copyExportedCss();
        if (event.target.id === "downloadHtmlBtn") downloadExportedHtml();
        if (event.target.id === "downloadCssBtn") downloadExportedCss();
    });
}

document.addEventListener("DOMContentLoaded", function () {
    initSharedLayout("export");
    initPageTransitions();
    renderExportOptions();
    renderExportPreview();
    renderExportCode();
    bindExportEvents();
});
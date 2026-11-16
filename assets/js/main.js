/*
 * Elementum — main application
 * Builds the periodic table, handles search/filtering, and powers the element modal.
 */
(function () {
  "use strict";

  var elements = window.ELEMENTUM_ELEMENTS;
  var table = document.getElementById("periodic-table");
  var prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!table || !Array.isArray(elements) || elements.length === 0) {
    showTableError();
    return;
  }

  var elementsByNumber = new Map();
  var searchTextByNumber = new Map();
  var elementTiles = [];
  var seriesMarkers = [];
  var state = {
    query: "",
    category: "all"
  };
  var lastFocused = null;
  var closeTimer = null;
  var baseTitle = document.title;

  var nodes = {
    form: document.getElementById("filter-form"),
    search: document.getElementById("element-search"),
    clearSearch: document.getElementById("clear-search"),
    category: document.getElementById("category-filter"),
    count: document.getElementById("result-count"),
    reset: document.getElementById("reset-filters"),
    noResults: document.getElementById("no-results"),
    noResultsReset: document.getElementById("no-results-reset"),
    legendChips: document.querySelectorAll(".legend-chip"),
    tableCard: document.querySelector(".table-card"),
    modal: document.getElementById("element-modal"),
    modalVisual: document.getElementById("modal-visual"),
    modalNumber: document.getElementById("modal-number"),
    modalSymbol: document.getElementById("modal-symbol"),
    modalTitle: document.getElementById("modal-title"),
    modalCategory: document.getElementById("modal-category"),
    modalMass: document.getElementById("modal-mass"),
    factMass: document.getElementById("fact-mass"),
    factCategory: document.getElementById("fact-category"),
    factGroup: document.getElementById("fact-group"),
    factPeriod: document.getElementById("fact-period"),
    factBlock: document.getElementById("fact-block"),
    factElectronegativity: document.getElementById("fact-electronegativity"),
    factMelting: document.getElementById("fact-melting"),
    factBoiling: document.getElementById("fact-boiling"),
    factDensity: document.getElementById("fact-density"),
    factDiscoveredBy: document.getElementById("fact-discovered-by"),
    factDiscoveredYear: document.getElementById("fact-discovered-year"),
    factConfig: document.getElementById("fact-config"),
    funFact: document.getElementById("modal-fun-fact"),
    closeButton: document.querySelector(".modal__close")
  };

  var formatters = {
    mass: new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }),
    kelvin: new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }),
    celsius: new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }),
    density: new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }),
    electronegativity: new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 })
  };

  indexElements();
  buildTable();
  setupEvents();
  initialiseModal();
  applyFilters();

  function showTableError() {
    if (!table) {
      return;
    }

    var message = document.createElement("p");
    message.className = "noscript-note";
    message.textContent =
      "The element data could not be loaded. Please refresh the page and try again.";
    table.appendChild(message);
  }

  function normalise(value) {
    return String(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function indexElements() {
    elements.forEach(function (element) {
      elementsByNumber.set(element.number, element);

      var searchParts = [element.name, element.symbol, String(element.number)];
      if (Array.isArray(element.aliases)) {
        searchParts = searchParts.concat(element.aliases);
      }

      searchTextByNumber.set(element.number, normalise(searchParts.join(" ")));
    });
  }

  function buildTable() {
    var fragment = document.createDocumentFragment();

    for (var group = 1; group <= 18; group += 1) {
      var groupLabel = document.createElement("div");
      groupLabel.className = "ptable__group-label";
      groupLabel.textContent = group;
      groupLabel.style.gridColumn = String(group + 1);
      groupLabel.style.gridRow = "1";
      groupLabel.setAttribute("aria-hidden", "true");
      fragment.appendChild(groupLabel);
    }

    for (var period = 1; period <= 7; period += 1) {
      var periodLabel = document.createElement("div");
      periodLabel.className = "ptable__period-label";
      periodLabel.textContent = period;
      periodLabel.style.gridColumn = "1";
      periodLabel.style.gridRow = String(period + 1);
      periodLabel.setAttribute("aria-hidden", "true");
      fragment.appendChild(periodLabel);
    }

    var divider = document.createElement("div");
    divider.className = "f-divider";
    divider.textContent = "Inner transition series";
    divider.style.gridColumn = "1 / -1";
    divider.style.gridRow = "9";
    divider.setAttribute("aria-hidden", "true");
    fragment.appendChild(divider);

    fragment.appendChild(createFRowLabel(10, "57–71"));
    fragment.appendChild(createFRowLabel(11, "89–103"));
    fragment.appendChild(createSeriesMarker("lanthanide", "57–71", "La–Lu", 7));
    fragment.appendChild(createSeriesMarker("actinide", "89–103", "Ac–Lr", 8));

    elements.forEach(function (element) {
      fragment.appendChild(createElementTile(element));
    });

    table.appendChild(fragment);
  }

  function createFRowLabel(row, range) {
    var label = document.createElement("div");
    label.className = "f-row-label";
    label.textContent = range;
    label.style.gridColumn = "1 / 4";
    label.style.gridRow = String(row);
    label.setAttribute("aria-hidden", "true");
    return label;
  }

  function createSeriesMarker(category, range, label, row) {
    var marker = document.createElement("button");
    marker.type = "button";
    marker.className = "series-marker";
    marker.setAttribute("data-category", category);
    marker.setAttribute("data-series", category);
    marker.setAttribute(
      "aria-label",
      range + " " + label + " — filter the " + category + " series"
    );
    marker.style.gridColumn = "4";
    marker.style.gridRow = String(row);

    var rangeLabel = document.createElement("span");
    rangeLabel.className = "series-marker__range";
    rangeLabel.textContent = range;

    var nameLabel = document.createElement("span");
    nameLabel.className = "series-marker__label";
    nameLabel.textContent = label;

    marker.appendChild(rangeLabel);
    marker.appendChild(document.createTextNode(" "));
    marker.appendChild(nameLabel);
    seriesMarkers.push(marker);
    return marker;
  }

  function createElementTile(element) {
    var tile = document.createElement("button");
    var position = getGridPosition(element);

    tile.type = "button";
    tile.className = "element";
    tile.setAttribute("data-number", String(element.number));
    tile.setAttribute("data-category", element.categoryId);
    tile.setAttribute("data-block", element.block);
    tile.setAttribute(
      "aria-label",
      "Atomic number " +
        element.number +
        " " +
        element.symbol +
        " " +
        element.name +
        " " +
        formatters.mass.format(element.atomicMass) +
        " — " +
        element.category +
        ". Activate to open details."
    );
    tile.style.gridColumn = String(position.column);
    tile.style.gridRow = String(position.row);

    var number = document.createElement("span");
    number.className = "element__number";
    number.textContent = element.number;
    number.setAttribute("aria-hidden", "true");

    var symbol = document.createElement("span");
    symbol.className = "element__symbol";
    symbol.textContent = element.symbol;
    symbol.setAttribute("aria-hidden", "true");

    var name = document.createElement("span");
    name.className = "element__name";
    name.textContent = element.name;
    name.setAttribute("aria-hidden", "true");

    var mass = document.createElement("span");
    mass.className = "element__mass";
    mass.textContent = formatters.mass.format(element.atomicMass);
    mass.setAttribute("aria-hidden", "true");

    tile.appendChild(number);
    tile.appendChild(document.createTextNode(" "));
    tile.appendChild(symbol);
    tile.appendChild(document.createTextNode(" "));
    tile.appendChild(name);
    tile.appendChild(document.createTextNode(" "));
    tile.appendChild(mass);

    elementTiles.push(tile);
    return tile;
  }

  function getGridPosition(element) {
    if (element.categoryId === "lanthanide") {
      return { column: 4 + (element.number - 57), row: 10 };
    }

    if (element.categoryId === "actinide") {
      return { column: 4 + (element.number - 89), row: 11 };
    }

    return { column: element.group + 1, row: element.period + 1 };
  }

  function setupEvents() {
    nodes.form.addEventListener("submit", function (event) {
      event.preventDefault();
    });

    nodes.search.addEventListener("input", function () {
      state.query = nodes.search.value;
      applyFilters();
      updateSearchUi();
    });

    nodes.search.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nodes.search.value) {
        event.preventDefault();
        clearSearch(true);
      }
    });

    nodes.category.addEventListener("change", function () {
      state.category = nodes.category.value;
      applyFilters();
    });

    nodes.clearSearch.addEventListener("click", function () {
      clearSearch(true);
    });

    nodes.reset.addEventListener("click", function () {
      resetFilters(false);
    });

    nodes.noResultsReset.addEventListener("click", function () {
      resetFilters(true);
    });

    Array.prototype.forEach.call(nodes.legendChips, function (chip) {
      chip.addEventListener("click", function () {
        var category = chip.getAttribute("data-category");
        state.category = state.category === category ? "all" : category;
        nodes.category.value = state.category;
        applyFilters();
        scrollTableIntoView();
      });
    });

    table.addEventListener("click", function (event) {
      var tile = event.target.closest(".element");
      if (tile) {
        openModal(Number(tile.getAttribute("data-number")));
        return;
      }

      var marker = event.target.closest(".series-marker");
      if (marker) {
        state.category = marker.getAttribute("data-series");
        nodes.category.value = state.category;
        applyFilters();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isModalOpen()) {
        closeModal();
        return;
      }

      var active = document.activeElement;
      var isTyping =
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.tagName === "SELECT" ||
          active.isContentEditable);

      if (event.key === "/" && !isTyping && !isModalOpen()) {
        event.preventDefault();
        nodes.search.focus();
        nodes.search.select();
      }
    });

    nodes.modal.addEventListener("click", function (event) {
      var closeTarget = event.target.closest("[data-modal-close]");
      if (closeTarget) {
        closeModal();
      }
    });

    nodes.modal.addEventListener("keydown", trapModalFocus);
  }

  function updateSearchUi() {
    nodes.clearSearch.hidden = nodes.search.value.length === 0;
  }

  function applyFilters() {
    var query = normalise(state.query.trim());
    var activeCategory = state.category;
    var matchCount = 0;

    elementTiles.forEach(function (tile) {
      var element = elementsByNumber.get(Number(tile.getAttribute("data-number")));
      var matchesCategory =
        activeCategory === "all" || element.categoryId === activeCategory;
      var matchesQuery = query === "" || matchesSearch(element, query);
      var isMatch = matchesCategory && matchesQuery;

      tile.classList.toggle("is-dimmed", !isMatch);
      tile.disabled = !isMatch;

      if (isMatch) {
        tile.removeAttribute("aria-hidden");
        matchCount += 1;
      } else {
        tile.setAttribute("aria-hidden", "true");
      }
    });

    seriesMarkers.forEach(function (marker) {
      var isMatch =
        !query &&
        (activeCategory === "all" ||
          marker.getAttribute("data-series") === activeCategory);

      marker.classList.toggle("is-dimmed", !isMatch);
      marker.disabled = !isMatch;

      if (isMatch) {
        marker.removeAttribute("aria-hidden");
      } else {
        marker.setAttribute("aria-hidden", "true");
      }
    });

    var isFiltering = query !== "" || activeCategory !== "all";

    nodes.count.textContent =
      matchCount === 0
        ? "No elements found"
        : isFiltering
          ? "Showing " + matchCount + " of " + elements.length + " elements"
          : "Showing " + elements.length + " elements";

    nodes.reset.hidden = !isFiltering;
    nodes.noResults.hidden = matchCount !== 0;
    nodes.clearSearch.hidden = nodes.search.value.length === 0;

    Array.prototype.forEach.call(nodes.legendChips, function (chip) {
      var isActive = chip.getAttribute("data-category") === activeCategory;
      chip.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function matchesSearch(element, query) {
    if (/^\d+$/.test(query)) {
      return (
        String(element.number) === query ||
        String(element.number).padStart(3, "0") === query
      );
    }

    return (searchTextByNumber.get(element.number) || "").indexOf(query) !== -1;
  }

  function clearSearch(returnFocus) {
    nodes.search.value = "";
    state.query = "";
    applyFilters();
    updateSearchUi();

    if (returnFocus) {
      nodes.search.focus();
    }
  }

  function resetFilters(focusSearch) {
    nodes.search.value = "";
    state.query = "";
    state.category = "all";
    nodes.category.value = "all";
    applyFilters();
    updateSearchUi();

    if (focusSearch) {
      nodes.search.focus();
    }
  }

  function scrollTableIntoView() {
    if (!nodes.tableCard) {
      return;
    }

    nodes.tableCard.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
  }

  /* --- Modal ------------------------------------------------------------- */

  function initialiseModal() {
    nodes.modal.inert = true;
    nodes.modal.setAttribute("aria-hidden", "true");
    nodes.modal.hidden = true;
  }

  function isModalOpen() {
    return nodes.modal.classList.contains("is-open");
  }

  function openModal(number) {
    var element = elementsByNumber.get(number);
    if (!element) {
      return;
    }

    clearTimeout(closeTimer);
    lastFocused = document.activeElement;
    populateModal(element);

    nodes.modal.hidden = false;
    nodes.modal.inert = false;
    nodes.modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    baseTitle = document.title;
    document.title = element.name + " (" + element.symbol + ") — Elementum";

    // Force a frame so the dialog transitions from its closed state.
    void nodes.modal.offsetWidth;
    nodes.modal.classList.add("is-open");

    window.setTimeout(
      function () {
        if (nodes.closeButton) {
          nodes.closeButton.focus();
        }
      },
      prefersReducedMotion ? 0 : 30
    );
  }

  function closeModal() {
    if (!isModalOpen()) {
      return;
    }

    nodes.modal.classList.remove("is-open");
    nodes.modal.setAttribute("aria-hidden", "true");
    nodes.modal.inert = true;
    document.body.classList.remove("is-locked");
    document.title = baseTitle;

    clearTimeout(closeTimer);
    closeTimer = window.setTimeout(
      function () {
        nodes.modal.hidden = true;

        if (lastFocused && document.contains(lastFocused)) {
          lastFocused.focus();
        }
      },
      prefersReducedMotion ? 0 : 280
    );
  }

  function populateModal(element) {
    nodes.modalVisual.setAttribute("data-category", element.categoryId);
    nodes.modalVisual.setAttribute("data-block", element.block);

    nodes.modalNumber.textContent = "Atomic no. " + element.number;
    nodes.modalSymbol.textContent = element.symbol;
    nodes.modalTitle.textContent = element.name;
    nodes.modalCategory.textContent = element.category;
    nodes.modalMass.textContent = formatMass(element.atomicMass);

    setFact(nodes.factMass, formatMass(element.atomicMass));
    setFact(nodes.factCategory, element.category);
    setFact(
      nodes.factGroup,
      element.group === null ? "—" : String(element.group),
      element.group === null
    );
    setFact(nodes.factPeriod, String(element.period));
    setFact(nodes.factBlock, element.block + "-block");

    if (element.electronegativity === null) {
      setFact(nodes.factElectronegativity, "Not available", true);
    } else {
      setFact(
        nodes.factElectronegativity,
        formatters.electronegativity.format(element.electronegativity)
      );
    }

    setFact(nodes.factMelting, formatTemperature(element.meltingPoint), element.meltingPoint === null);
    setFact(nodes.factBoiling, formatTemperature(element.boilingPoint), element.boilingPoint === null);
    setFact(nodes.factDensity, formatDensity(element.density), element.density === null);
    setFact(nodes.factDiscoveredBy, element.discoveredBy || "Unknown");
    setFact(nodes.factDiscoveredYear, element.discoveredYear || "Unknown");
    setFact(nodes.funFact, element.funFact);
    renderElectronConfiguration(element.electronConfig);
  }

  function setFact(node, value, unavailable) {
    if (!node) {
      return;
    }

    node.textContent = value;
    node.classList.toggle("is-unavailable", Boolean(unavailable));
  }

  function formatMass(mass) {
    return formatters.mass.format(mass) + " u";
  }

  function formatTemperature(kelvin) {
    if (kelvin === null || kelvin === undefined) {
      return "Not known";
    }

    var celsius = kelvin - 273.15;
    return (
      formatters.kelvin.format(kelvin) +
      " K (" +
      formatters.celsius.format(celsius) +
      " °C)"
    );
  }

  function formatDensity(density) {
    if (density === null || density === undefined) {
      return "Not known";
    }

    if (density < 0.01) {
      return formatters.density.format(density * 1000) + " g/L";
    }

    return formatters.density.format(density) + " g/cm³";
  }

  function renderElectronConfiguration(configuration) {
    var target = nodes.factConfig;
    target.textContent = "";

    if (!configuration) {
      target.textContent = "Not available";
      return;
    }

    var orbitalPattern = /([spdf])(\d+)/g;
    var lastIndex = 0;
    var match;

    while ((match = orbitalPattern.exec(configuration)) !== null) {
      if (match.index > lastIndex) {
        target.appendChild(
          document.createTextNode(configuration.slice(lastIndex, match.index))
        );
      }

      target.appendChild(document.createTextNode(match[1]));

      var superscript = document.createElement("sup");
      superscript.textContent = match[2];
      target.appendChild(superscript);

      lastIndex = orbitalPattern.lastIndex;
    }

    if (lastIndex < configuration.length) {
      target.appendChild(
        document.createTextNode(configuration.slice(lastIndex))
      );
    }
  }

  function trapModalFocus(event) {
    if (event.key !== "Tab" || !isModalOpen()) {
      return;
    }

    var focusable = nodes.modal.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    var visible = Array.prototype.filter.call(focusable, function (node) {
      return node.getClientRects().length > 0;
    });

    if (visible.length === 0) {
      event.preventDefault();
      return;
    }

    var first = visible[0];
    var last = visible[visible.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  // Keep ARIA state correct for the initially closed dialog.
  updateSearchUi();
})();

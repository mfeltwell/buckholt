document.querySelectorAll(".table").forEach((table) => {
    const tbody = table.querySelector("tbody");
    const sortButtons = table.querySelectorAll(".table-sort");

    const originalRows = Array.from(tbody.querySelectorAll("tr:not(.table-gap)"));

    sortButtons.forEach((button) => {
        const columnIndex = Number(button.dataset.col ?? button.closest("th").cellIndex);
        let sortState = "none"; // none → asc → desc → none

        button.addEventListener("click", () => {
        // Reset other buttons
        sortButtons.forEach((otherButton) => {
            if (otherButton !== button) {
            otherButton.dataset.sortState = "none";
            otherButton.classList.remove(
                "table-sort-asc",
                "table-sort-desc"
            );
            setSortIcon(otherButton, "none");
            }
        });

        sortState =
            button.dataset.sortState === "asc"
            ? "desc"
            : button.dataset.sortState === "desc"
            ? "none"
            : "asc";

        button.dataset.sortState = sortState;

        // 🔥 Apply active classes\
        button.classList.remove(
            "table-sort-asc",
            "table-sort-desc"
        );

        if (sortState === "asc") {
            button.classList.add("table-sort-asc");
        } else if (sortState === "desc") {
            button.classList.add("table-sort-desc");
        }

        setSortIcon(button, sortState);

        let rows;

        if (sortState === "none") {
            rows = originalRows;
        } else {
            rows = [...originalRows].sort((a, b) => {
            const aValue = getCellValue(a, columnIndex);
            const bValue = getCellValue(b, columnIndex);

            const comparison = compareValues(aValue, bValue);

            return sortState === "asc" ? comparison : -comparison;
            });
        }

        rows.forEach((row) => tbody.appendChild(row));
        });
    });
    });

    function getCellValue(row, columnIndex) {
        const cell = row.children[columnIndex];
        if (!cell) return "";

        if (cell.dataset.sortValue !== undefined) {
            return cell.dataset.sortValue;
        }

        const clone = cell.cloneNode(true);
        clone.querySelectorAll(".data-secondary").forEach((el) => el.remove());

        return clone.textContent.trim();
    }

    function compareValues(a, b) {
    const aNumber = parseFloat(a.replace(/[^\d.-]/g, ""));
    const bNumber = parseFloat(b.replace(/[^\d.-]/g, ""));

    const bothAreNumbers = !Number.isNaN(aNumber) && !Number.isNaN(bNumber);

    if (bothAreNumbers) {
        return aNumber - bNumber;
    }

    return a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: "base",
    });
    }

    function setSortIcon(button, state) {
    const iconContainer = button.querySelector(".table-sort-icon");
    if (!iconContainer) return;

    if (state === "asc") {
        iconContainer.innerHTML = '<i class="fa-solid fa-sort-up"></i>';
    } else if (state === "desc") {
        iconContainer.innerHTML = '<i class="fa-solid fa-sort-down"></i>';
    } else {
        iconContainer.innerHTML = '<i class="fa-solid fa-sort"></i>';
    }
}
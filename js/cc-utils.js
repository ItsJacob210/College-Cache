(function (global) {
    var CATEGORIES = [
        "Electronics",
        "Phone",
        "Laptop",
        "Wallet",
        "Keys",
        "ID Card",
        "Bag",
        "Clothing",
        "Water Bottle",
        "Book",
        "Notebook",
        "Headphones",
        "Jewelry",
        "Glasses",
        "Other"
    ];

    var LOCATIONS = [
        "Library",
        "Student Center",
        "Gym",
        "Dining Hall",
        "Lecture Hall",
        "Science Building",
        "Engineering Building",
        "Arts Building",
        "Dorm Area",
        "Parking Lot",
        "Quad / Outdoors",
        "Other"
    ];

    function escapeHtml(s) {
        if (s == null) return "";
        return String(s)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function fmtDate(iso) {
        if (!iso) return "";
        try {
            var d = new Date(iso);
            return d.toLocaleString();
        } catch (e) { return ""; }
    }

    function statusBadge(status) {
        var span = document.createElement("span");
        span.className = "badge";
        var s = (status || "").toUpperCase();
        if (s === "ACTIVE") span.classList.add("badge--status-active");
        else if (s === "SEARCHING") span.classList.add("badge--status-searching");
        else if (s === "PENDING_CLAIM") span.classList.add("badge--status-pending");
        else if (s === "RESOLVED") span.classList.add("badge--status-resolved");
        span.textContent = s.replace("_", " ") || "—";
        return span;
    }

    function typeBadge(type) {
        var span = document.createElement("span");
        span.className = "badge " + (type === "LOST" ? "badge--lost" : "badge--found");
        span.textContent = type === "LOST" ? "Lost" : "Found";
        return span;
    }

    function itemCard(item) {
        var a = document.createElement("a");
        a.className = "item-card";
        a.href = "item-detail.html?id=" + encodeURIComponent(item._id);

        var topRow = document.createElement("div");
        topRow.className = "item-card__row";
        topRow.appendChild(typeBadge(item.type));
        topRow.appendChild(statusBadge(item.status));
        a.appendChild(topRow);

        var title = document.createElement("h3");
        title.className = "item-card__title";
        title.textContent = item.title || "(untitled)";
        a.appendChild(title);

        var meta = document.createElement("div");
        meta.className = "item-card__meta";
        var bits = [];
        if (item.category) bits.push(item.category);
        if (item.general_location) bits.push(item.general_location);
        meta.textContent = bits.join(" · ");
        a.appendChild(meta);

        var date = document.createElement("div");
        date.className = "item-card__meta";
        date.textContent = fmtDate(item.createdAt) || "";
        a.appendChild(date);

        return a;
    }

    function populateSelect(select, options, placeholder) {
        select.innerHTML = "";
        if (placeholder) {
            var first = document.createElement("option");
            first.value = "";
            first.textContent = placeholder;
            select.appendChild(first);
        }
        options.forEach(function (opt) {
            var o = document.createElement("option");
            o.value = opt;
            o.textContent = opt;
            select.appendChild(o);
        });
    }

    function requireLogin() {
        var uid = localStorage.getItem("loggedInUser");
        if (!uid) {
            window.location.replace("login.html");
            return null;
        }
        return uid;
    }

    function setBanner(el, kind, msg) {
        if (!el) return;
        el.className = "banner " + (kind ? "banner--" + kind : "");
        el.textContent = msg || "";
        el.hidden = !msg;
    }

    global.CC = {
        CATEGORIES: CATEGORIES,
        LOCATIONS: LOCATIONS,
        escapeHtml: escapeHtml,
        fmtDate: fmtDate,
        statusBadge: statusBadge,
        typeBadge: typeBadge,
        itemCard: itemCard,
        populateSelect: populateSelect,
        requireLogin: requireLogin,
        setBanner: setBanner
    };
})(window);

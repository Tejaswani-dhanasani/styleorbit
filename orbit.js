const folders = {
    casual: ["summer-casual-dress.png", "floral-casual-dress.png", "cotton-day-dress.png", "printed-casual-dress.png", "sleeveless-summer-dress.png", "relaxed-midi-dress.png", "everyday-wrap-dress.png", "minimal-comfort-dress.png", "comfort-fit-dress.png", "weekend-maxi-dress.png"],
    college: ["striped-college-dress.png", "checked-college-dress.png", "denim-college-dress.png", "printed-campus-dress.png", "floral-college-dress.png", "casual-college-dress.png", "summer-college-dress.png", "midi-college-dress.png", "smart-college-dress.png", "cotton-college-dress.png"],
    office: ["formal-office-dress.png", "striped-office-dress.png", "checked-office-dress.png", "office-shirt-dress.png", "professional-midi-dress.png", "pencil-office-dress.png", "belted-work-dress.png", "solid-office-dress.png", "elegant-office-dress.png"],
    party: ["sequin-party-dress.png", "velvet-party-dress.png", "off-shoulder-party-dress.png", "bodycon-party-dress.png", "satin-party-dress.png", "glitter-party-dress.png", "one-shoulder-party-dress.png", "ruffle-party-dress.png", "evening-party-dress.png"],
    wedding: ["floral-wedding-dress.png", "embroidered-wedding-dress.png", "wedding-guest-dress.png", "silk-wedding-dress.png", "pastel-wedding-dress.png", "sequin-wedding-dress.png", "reception-dress.png", "bridesmaid-dress.png", "festive-wedding-dress.png"],
    traditional: ["traditional-anarkali.png", "embroidered-anarkali.png", "festive-salwar-suit.png", "traditional-saree-look.png", "silk-kurta-set.png", "lehenga-style-dress.png", "ethnic-print-dress.png", "festive-ethnic-dress.png", "traditional-gown.png", "classic-heritage-dress.png"]
};

const categoryNames = { casual: "Casual", college: "College", office: "Office", party: "Party", wedding: "Wedding", traditional: "Traditional" };
const categoryDescriptions = { casual: "Easy, everyday pieces", college: "Smart campus style", office: "Polished workwear", party: "Made to celebrate", wedding: "For the big moments", traditional: "Timeless cultural style" };
const lookNames = {
    casual: ["Summer Casual Dress", "Floral Casual Dress", "Cotton Day Dress", "Printed Casual Dress", "Sleeveless Summer Dress", "Relaxed Midi Dress", "Everyday Wrap Dress", "Minimal Comfort Dress", "Comfort Fit Dress", "Weekend Maxi Dress"],
    college: ["Striped College Dress", "Checked College Dress", "Denim College Dress", "Printed Campus Dress", "Floral College Dress", "Casual College Dress", "Summer College Dress", "Midi College Dress", "Smart College Dress", "Cotton College Dress"],
    office: ["Formal Office Dress", "Striped Office Dress", "Checked Office Dress", "Office Shirt Dress", "Professional Midi Dress", "Pencil Office Dress", "Belted Work Dress", "Solid Office Dress", "Elegant Office Dress"],
    party: ["Sequin Party Dress", "Velvet Party Dress", "Off-Shoulder Party Dress", "Bodycon Party Dress", "Satin Party Dress", "Glitter Party Dress", "One-Shoulder Party Dress", "Ruffle Party Dress", "Evening Party Dress"],
    wedding: ["Floral Wedding Dress", "Embroidered Wedding Dress", "Wedding Guest Dress", "Silk Wedding Dress", "Pastel Wedding Dress", "Sequin Wedding Dress", "Reception Dress", "Bridesmaid Dress", "Festive Wedding Dress"],
    traditional: ["Traditional Anarkali", "Embroidered Anarkali", "Festive Salwar Suit", "Traditional Saree Look", "Silk Kurta Set", "Lehenga Style Dress", "Ethnic Print Dress", "Festive Ethnic Dress", "Traditional Gown", "Classic Heritage Dress"]
};
const allLooks = Object.entries(folders).flatMap(([category, files]) => files.map((file, index) => ({
    id: `${category}-${index}`, category, file: `assets/dresses/${category}/${encodeURIComponent(file).replace(/%2F/g, "/")}`,
    title: lookNames[category][index], alt: `${lookNames[category][index]} ${category} dress`,
    description: `${categoryDescriptions[category]} with a considered silhouette for your next occasion.`
})));

let activeCategory = "all";
let searchTerm = "";
let showingSaved = false;
let savedLooks = new Set(JSON.parse(localStorage.getItem("styleorbit-saved") || "[]"));
let currentLook = null;

const grid = document.getElementById("dress-grid");
const count = document.getElementById("result-count");
const emptyState = document.getElementById("empty-state");
const toast = document.getElementById("message");

function filteredLooks() {
    return allLooks.filter((look) => {
        const matchesCategory = showingSaved ? savedLooks.has(look.id) : activeCategory === "all" || look.category === activeCategory;
        const searchable = `${look.title} ${look.category} ${look.description}`.toLowerCase();
        return matchesCategory && searchable.includes(searchTerm);
    });
}

function renderLooks() {
    const looks = filteredLooks();
    count.textContent = `${looks.length} ${looks.length === 1 ? "look" : "looks"}`;
    emptyState.hidden = looks.length !== 0;
    grid.innerHTML = looks.map((look) => `
        <article class="dress-card">
            <button class="save-button ${savedLooks.has(look.id) ? "saved" : ""}" type="button" data-save="${look.id}" aria-label="${savedLooks.has(look.id) ? "Remove from saved looks" : "Save look"}">${savedLooks.has(look.id) ? "♥" : "♡"}</button>
            <button class="image-button" type="button" data-view="${look.id}" aria-label="Quick view ${look.title}">
                <img src="${look.file}" alt="${look.alt}" loading="lazy">
                <span>Quick view&nbsp; ↗</span>
            </button>
            <div class="card-info"><p>${categoryNames[look.category]}</p><h3>${look.title}</h3><button class="text-button" type="button" data-view="${look.id}">View details <span>→</span></button></div>
        </article>`).join("");
    document.getElementById("saved-count").textContent = savedLooks.size;
}

function scrollToDresses() { document.getElementById("dresses").scrollIntoView({ behavior: "smooth" }); }

function showMessage(message) {
    toast.textContent = message;
    toast.classList.add("visible");
    window.clearTimeout(showMessage.timeout);
    showMessage.timeout = window.setTimeout(() => toast.classList.remove("visible"), 2200);
}

function toggleSaved(id) {
    if (savedLooks.has(id)) { savedLooks.delete(id); showMessage("Removed from saved looks"); }
    else { savedLooks.add(id); showMessage("Look saved to your collection"); }
    localStorage.setItem("styleorbit-saved", JSON.stringify([...savedLooks]));
    renderLooks();
    if (currentLook?.id === id) updateModalButton();
}

function openModal(id) {
    currentLook = allLooks.find((look) => look.id === id);
    if (!currentLook) return;
    document.getElementById("modal-image").src = currentLook.file;
    document.getElementById("modal-image").alt = currentLook.alt;
    document.getElementById("modal-category").textContent = categoryNames[currentLook.category];
    document.getElementById("modal-title").textContent = currentLook.title;
    document.getElementById("modal-description").textContent = currentLook.description;
    updateModalButton();
    document.getElementById("quick-view").hidden = false;
    document.body.classList.add("modal-open");
}

function updateModalButton() {
    const button = document.getElementById("modal-save");
    button.textContent = savedLooks.has(currentLook.id) ? "♥ Saved look" : "♡ Save this look";
}

function closeModal() {
    document.getElementById("quick-view").hidden = true;
    document.body.classList.remove("modal-open");
}

document.querySelectorAll(".occasion-button").forEach((button) => button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    showingSaved = false;
    document.querySelectorAll(".occasion-button").forEach((item) => item.classList.toggle("active", item === button));
    renderLooks();
}));
document.getElementById("search-input").addEventListener("input", (event) => { searchTerm = event.target.value.toLowerCase().trim(); renderLooks(); });
document.querySelector("[data-filter-favorites]").addEventListener("click", () => {
    searchTerm = "";
    document.getElementById("search-input").value = "";
    if (savedLooks.size === 0) { showMessage("Save a few looks to see them here"); return; }
    showingSaved = true;
    activeCategory = "all";
    document.querySelectorAll(".occasion-button").forEach((item) => item.classList.toggle("active", item.dataset.category === "all"));
    renderLooks();
    document.getElementById("dresses").scrollIntoView({ behavior: "smooth" });
});
grid.addEventListener("click", (event) => {
    const save = event.target.closest("[data-save]");
    const view = event.target.closest("[data-view]");
    if (save) toggleSaved(save.dataset.save);
    if (view) openModal(view.dataset.view);
});
document.getElementById("modal-save").addEventListener("click", () => toggleSaved(currentLook.id));
document.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", closeModal));
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeModal(); });
renderLooks();

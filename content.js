console.log("ChatGPT Personality Selector v4.0 - Manual Mode");

// 1. CONFIG
var appConfig = {
    show_help_at_startup: true,
    selected_category: 0,
    selected_personality: 0,
    language: 0
};

let isProcessing = false;
var floatingDiv;
var observer;

const lang_options = [
    { value: "en-US", label: "English" },
    { value: "fr-FR", label: "Français" },
    { value: "ar-AR", label: "العربية" },
    { value: "it-IT", label: "Italiano" },
    { value: "de-DE", label: "Deutsch" },
    { value: "nl-XX", label: "Dutch" },
    { value: "zh-CN", label: "中國人" }
];

// 2. DOM HELPERS
function get_textarea() {
    return document.getElementById('prompt-textarea') || 
           document.querySelector('div[contenteditable="true"]') ||
           document.querySelector('textarea');
}

/**
 * Robust Text Injection via Synthetic Paste. 
 * Forces ProseMirror/React state to update.
 */
async function setTextareaValue(target, value) {
    if (!target) return false;
    target.focus();

    const dataTransfer = new DataTransfer();
    dataTransfer.setData('text/plain', value);
    
    const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: dataTransfer,
        bubbles: true,
        cancelable: true
    });
    
    target.dispatchEvent(pasteEvent);
    await new Promise(r => setTimeout(r, 100));

    // Fallback if paste event was ignored
    if ((target.innerText || "").trim() === "") {
        target.innerHTML = `<p>${value}</p>`;
        target.dispatchEvent(new Event('input', { bubbles: true }));
    }
    return true;
}

function pressEnter() {
    const target = get_textarea();
    if (target) {
        target.dispatchEvent(new KeyboardEvent("keydown", {
            bubbles: true, cancelable: true, key: "Enter", code: "Enter", keyCode: 13, shiftKey: false
        }));
    }
}

/**
 * Triggers a "New Chat" to ensure a clean slate.
 */
async function startNewDiscussion() {
    if (window.location.pathname !== "/") {
        const homeLink = document.querySelector('nav a[href="/"]') || 
                         document.querySelector('a[data-testid="sidebar-new-chat-button"]');
        if (homeLink) homeLink.click();
        await new Promise(r => setTimeout(r, 1500));
    }
}

// 3. UI CONSTRUCTION
function build_ui() {
    if (document.querySelector(".floating-div")) return;

    floatingDiv = document.createElement("div");
    floatingDiv.classList.add("floating-div");
    floatingDiv.style.display = appConfig.show_help_at_startup ? "flex" : "none";
    document.body.appendChild(floatingDiv);

    floatingDiv.innerHTML = `
        <div class="title-bar">Personality Selector</div>
        <button class="close-button">✕</button>
        <div class="content-div">
            <div class="input-select-div">
                <label class="input-select-label">Language</label>
                <select id="ext-language-select" class="input-selects"></select>
            </div>
            <div class="input-select-div">
                <label class="input-select-label">Category</label>
                <select id="category-select" class="input-selects"></select>
            </div>
            <div class="input-select-div">
                <label class="input-select-label">Personality</label>
                <select id="personality-select" class="input-selects"></select>
            </div>
            <div class="input-select-div">
                <label class="input-select-label">Show at startup?</label>
                <input type="checkbox" id="show-startup-toggle" class="input-checkbox">
            </div>
            <button id="submit-personality" class="submit-personality">Apply Personality</button>
            <div class="text-footer">Built by ParisNeo</div>
        </div>
    `;

    floatingDiv.querySelector(".close-button").addEventListener('click', () => {
        floatingDiv.style.display = "none";
    });
    
    const langSelect = floatingDiv.querySelector("#ext-language-select");
    lang_options.forEach((opt, idx) => {
        const o = document.createElement("option");
        o.value = idx;
        o.textContent = opt.label;
        langSelect.appendChild(o);
    });
    langSelect.selectedIndex = appConfig.language;
    langSelect.addEventListener('change', (e) => {
        appConfig.language = e.target.selectedIndex;
        saveGlobal();
        build_persons_list();
    });

    const startupToggle = floatingDiv.querySelector("#show-startup-toggle");
    startupToggle.checked = appConfig.show_help_at_startup;
    startupToggle.addEventListener('change', (e) => {
        appConfig.show_help_at_startup = e.target.checked;
        saveGlobal();
    });

    floatingDiv.querySelector("#submit-personality").addEventListener('click', onSubmit);

    build_persons_list();
}

function build_persons_list() {
    const fileUrl = chrome.runtime.getURL(`languages/prompts_${lang_options[appConfig.language].value}.csv`);
    const catSelect = document.getElementById("category-select");
    const persSelect = document.getElementById("personality-select");

    fetch(fileUrl).then(r => r.text()).then(data => {
        Papa.parse(data, {
            header: true,
            complete: (results) => {
                const csvData = results.data;
                const categories = Array.from(new Set(csvData.map(i => i.category))).filter(c => c);
                catSelect.innerHTML = "";
                categories.forEach(c => {
                    const o = document.createElement("option");
                    o.value = o.textContent = c;
                    catSelect.appendChild(o);
                });

                catSelect.onchange = () => {
                    const filtered = csvData.filter(i => i.category === catSelect.value);
                    persSelect.innerHTML = "";
                    filtered.forEach(p => {
                        const o = document.createElement("option");
                        o.value = JSON.stringify(p);
                        o.textContent = p.personality;
                        persSelect.appendChild(o);
                    });
                };
                catSelect.selectedIndex = Math.min(appConfig.selected_category, categories.length - 1);
                catSelect.dispatchEvent(new Event("change"));
            }
        });
    });
}

async function onSubmit() {
    const persSelect = document.getElementById("personality-select");
    if (!persSelect.value) return;

    const personality = JSON.parse(persSelect.value);
    appConfig.selected_category = document.getElementById("category-select").selectedIndex;
    appConfig.selected_personality = persSelect.selectedIndex;
    saveGlobal();

    if (personality.disclaimer) alert(personality.disclaimer);
    floatingDiv.style.display = "none";
    
    await startNewDiscussion();
    
    let target = null;
    for (let i = 0; i < 10; i++) {
        target = get_textarea();
        if (target) break;
        await new Promise(r => setTimeout(r, 300));
    }

    if (target) {
        await setTextareaValue(target, personality.prompt);
        setTimeout(pressEnter, 300);
    }
}

function saveGlobal() {
    chrome.storage.sync.set({ global: appConfig });
}

function callback(mutationsList, observer) {
    const nav = document.querySelector('nav') || document.querySelector('div[role="navigation"]');
    if (nav && !document.getElementById("settings-btn") && !isProcessing) {
        isProcessing = true;
        setTimeout(() => {
            if (document.getElementById("settings-btn")) { isProcessing = false; return; }
            const btn = document.createElement("button");
            btn.id = "settings-btn";
            btn.innerHTML = `<span>🧠</span><span>Personality Selector</span>`;
            btn.className = "flex py-3 px-3 items-center gap-3 rounded-md transition-colors duration-200 cursor-pointer text-sm mb-1 w-full";
            btn.addEventListener('click', (e) => {
                e.preventDefault(); e.stopPropagation();
                floatingDiv.style.display = floatingDiv.style.display === "none" ? "flex" : "none";
            });
            const targetNav = document.querySelector('nav') || document.querySelector('div[role="navigation"]');
            if (targetNav) targetNav.prepend(btn);
            isProcessing = false;
        }, 1000); 
    }
}

window.addEventListener("load", () => {
    chrome.storage.sync.get(["global"], (data) => {
        if (data.global) appConfig = { ...appConfig, ...data.global };
        build_ui();
        observer = new MutationObserver(callback);
        observer.observe(document.body, { childList: true, subtree: true });
    });
});
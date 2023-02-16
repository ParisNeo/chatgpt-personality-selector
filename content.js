let isProcessing = false;
var global = {
  show_help_at_startup: true,
  selected_category: 0,
  selected_personality: 0,
  language: 0,
  voice: "",
  auto_audio: false,
};

var lang_options = [
  { value: "en-US", label: "English" },
  { value: "fr-FR", label: "Français" },
  { value: "ar-AR", label: "العربية" },
  { value: "it-IT", label: "Italiano" },
  { value: "de-DE", label: "Deutsch" },
];

var floatingDiv;

var textarea;
var observer;
var body;
var audio_wrapper;
var voice_select;

const synth = window.speechSynthesis || webkitspeechSynthesis;
var voices = synth.getVoices();
const SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.maxAlternatives = 10;
let isStarted = false;
let isSpeaking = false;

var language_select;

function get_lastdiv_with_text(divs) {
  var lastDivWithText;
  try {
    var main = document.querySelector("main");
    var divs = main.querySelectorAll("div");

    for (let i = 0; i < divs.length; i++) {
      if (
        divs[i].childNodes.length === 1 &&
        divs[i].childNodes[0].nodeType === 3
      ) {
        lastDivWithText = divs[i];
      } else if (divs[i].getElementsByTagName("p").length > 0) {
        lastDivWithText = divs[i];
      }
    }
  } catch {}
  return lastDivWithText;
}

function add_audio_in_ui() {
  const inputs = document.querySelectorAll("input[type='text'], textarea");
  inputs.forEach((input) => {
    // const wrapper = document.createElement("div");
    // wrapper.classList.add("flex", "items-center");
    var btn = document.querySelectorAll("#audio_in_tool");

    var found = false;
    // Iterate through the children
    for (var i = 0; i < btn.length; i++) {
      var child = btn[i];
      // Check if the wrapper element contains the current child element
      if (input.parentNode.parentNode.contains(child)) {
        found = true;
      }
    }

    console.log(`trying to add audio in button to ${input}`);
    if (!found) {
      const audio_in_button = document.createElement("button");
      audio_in_button.id = "audio_in_tool";
      audio_in_button.classList.add("audio_btn");
      audio_in_button.innerHTML = "🎤";

      input.parentNode.parentNode.insertBefore(
        audio_in_button,
        input.parentNode
      );

      input.classList.add("flex-1");
      audio_in_button.classList.add("ml-2");
      //wrapper.appendChild(audio_in_button);
      //input.parentNode.parentNode.insertBefore(wrapper, input);
      //input.parentNode.removeChild(input);
      //wrapper.appendChild(input);

      audio_in_button.addEventListener("click", () => {
        if (isStarted) {
          console.log("Stopping previous recognition");
          recognition.stop();
          isStarted = false;
        } else {
          console.log("Starting new recognition");
          recognition.lang = language_select.value;
          recognition.start();
          isStarted = true;
        }
      });

      recognition.addEventListener("result", (event) => {
        let transcript = "";
        for (const result of event.results) {
          transcript += result[0].transcript;
        }
        if (transcript != "") {
          input.value = transcript;
        }
      });

      recognition.addEventListener("start", () => {
        audio_in_button.style.backgroundColor = "red";
        audio_in_button.style.boxShadow = "2px 2px 0.5px #808080";
      });

      recognition.addEventListener("end", () => {
        audio_in_button.style.backgroundColor = "";
        audio_in_button.style.boxShadow = "";
      });
    }
  });
}

function showErrorMessage(e) {
  console.log(e);
  var errorDiv = document.createElement("div");
  errorDiv.classList.add(
    "chatgpt-personality-selector-error",
    "absolute",
    "bottom-0",
    "right-1",
    "text-white",
    "bg-red-500",
    "p-4",
    "rounded-lg",
    "mb-4",
    "mr-4",
    "text-sm"
  );
  errorDiv.innerHTML =
    "<b>An error occurred</b><br>" +
    e +
    "<br><br>Check the console for more details.";
  document.body.appendChild(errorDiv);
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

function conditionChatGPT(results, query, lang) {
  let counter = 1;
  let formattedResults = `Current date: ${new Date().toLocaleDateString()}\n\nSubject :  ${query}.\n\n`;

  formattedResults =
    formattedResults +
    `Instructions:
    Act as an AI specialized in analyzing web search results.
    The AI knows how to write different text formats such as latex, markdown and others.
    In addition to natural interaction, the AI can respond to those personality_select :
    sentiment,summerize,mksurvey,showperspectives,critisize,list,latex,markdown.
    Make sure to cite results using [[number](URL)] notation after the reference to enable the users to click on it and view the source web page.
    Be precise and use academic english.
    Stick to the user requests.
    The user can formulate requests concerning the search results. respond in a formal manner.\n\n
    After recovering the web search data, just answer with welcome message and wait for the user command.\n
    Start by showing the welcome message that explains what you can do in details.\nAll responses should be in ${lang}`;
  formattedResults = formattedResults + `\nArticles web search results:\n\n`;
  formattedResults =
    formattedResults +
    results.reduce(
      (acc, result) =>
        (acc += `[${counter++}] "${result.body}"\nSource: ${result.href}\n\n`),
      ""
    );

  textarea.value = formattedResults;
}

function conditionChatGPTFR(results, query) {
  let counter = 1;
  let formattedResults = `Date actuelle: ${new Date().toLocaleDateString()}\n\Sujet :  ${query}.\n\n`;

  formattedResults =
    formattedResults +
    `Instructions:
  Agir en tant qu'IA spécialisée dans l'analyse des résultats de recherche sur le Web.
  L'IA sait comment écrire différents formats de texte tels que latex, démarquage et autres.
  En plus de l'interaction naturelle, l'IA peut répondre à ces personality_select :
  sentiment, résumer, mksurvey, afficher les perspectives, critiquer, lister, latex, démarquage.
  Assurez-vous de citer les résultats en utilisant la notation [[number](URL)] après la référence pour que les utilisateurs puissent consulter la page.
  Soyez précis et utilisez un anglais académique.
  Respectez les demandes des utilisateurs.
  L'utilisateur peut formuler des requêtes concernant les résultats de la recherche. répondre de manière formelle.\n\n
  Après avoir récupéré les données de recherche Web, répondez simplement avec un message de bienvenue et attendez la commande utilisateur.\n
  Commencez par afficher le message de bienvenue qui explique ce que vous pouvez faire en détail.`;
  formattedResults =
    formattedResults + `Résultats de la recherche d'articles sur le Web :\n\n`;
  formattedResults =
    formattedResults +
    results.reduce(
      (acc, result) =>
        (acc += `[${counter++}] "${result.body}"\nSource: ${result.href}\n\n`),
      ""
    );

  textarea.value = formattedResults;
}

function pressEnter() {
  textarea.focus();
  const enterEvent = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    key: "Enter",
    code: "Enter",
  });
  textarea.dispatchEvent(enterEvent);
}

// use &max_results= to set the maximum number of results expoected
async function api_search(query) {
  var url = `https://ddg-webapp-aagd.vercel.app/search?&q=${query}`;
  console.log(url);
  const response = await fetch(url);
  return await response.json();
}

async function search(query) {
  var url = "https://api.duckduckgo.com/?q=" + query + "&format=json";
  return await fetch(url);
}

var personality_select;
function onSubmit(event) {
  var personality_select = document.getElementById("personality-select");
  personality = JSON.parse(personality_select.value);
  textarea = document.querySelector("textarea");
  console.log(`On submit triggered with ${JSON.stringify(personality)}`);
  add_audio_in_ui();
  // Save global
  chrome.storage.sync.set({ global: global });
  if (!isProcessing) {
    console.log("Starting");
    isProcessing = true;

    try {
      let query = textarea.value;
      if (query === "") {
        alert(
          "To use this personality, first write the query you want to search on the internet in the query textarea then press the Apply personality button.\nAdd &max_results=<the number of results you seek> to set the maximum number of results expoected.\nExample: &max_results=10 to set it to 10"
        );
      }
      textarea.value = "";

      query = query.trim();

      if (query === "") {
        isProcessing = false;
        return;
      }

      api_search(query).then((results) => {
        conditionChatGPT(results, query, lang_options[global.language].label);
        pressEnter();
        isProcessing = false;
      });


    } catch (error) {
      isProcessing = false;
      showErrorMessage(error);
    }
  }
  floatingDiv.style.display = "none";
}

function build_option(option_name, select_options_list) {
  var dropDown = document.createElement("select");
  dropDown.classList.add(
    "text-white",
    "ml-0",
    "bg-gray-900",
    "border",
    "w-full"
  );

  select_options_list.forEach(function (option) {
    var optionElement = document.createElement("option");
    optionElement.value = option.value;
    optionElement.innerHTML = option.label;
    optionElement.classList.add("text-white");
    dropDown.appendChild(optionElement);
  });

  dropDown.onchange = function () {
    global[option_name] = this.value;
  };
  return dropDown;
}

function build_persons_list() {
  // Read the CSV file
  var fileUrl;
  console.log(
    `Loading languages/prompts_${lang_options[global.language].value}.csv`
  );
  fileUrl = chrome.runtime.getURL(
    `languages/prompts_${lang_options[global.language].value}.csv`
  );
  category_select.innerHTML = "";
  personality_select.innerHTML = "";
  console.log(fileUrl);
  // Use PapaParse to parse the CSV file
  fetch(fileUrl)
    .then((response) => response.text())
    .then((data) => {
      // Use PapaParse to parse the CSV file
      Papa.parse(data, {
        header: true,
        complete: function (results) {
          var data = results.data;
          var categories = Array.from(
            new Set(data.map((item) => item.category))
          );

          // populate first select element with categories
          var categorySelect = document.getElementById("category-select");
          categories.forEach(function (category) {
            var option = document.createElement("option");
            option.value = category;
            option.text = category;
            categorySelect.add(option);
          });

          // listen for change event on first select element
          categorySelect.addEventListener("change", function () {
            var selectedCategory = this.value;
            submit_personality = document.getElementById("submit-personality");
            console.log(`Selected category :${this.selectedIndex}`);
            if (this.selectedIndex == 0) {
              console.log("changing text to search");
              submit_personality.innerHTML = "🔍 Search";
            } else {
              submit_personality.innerHTML = `🧠 Apply personality`;
            }

            // filter data based on selected category
            var personalities = data
              .filter(function (item) {
                return item.category === selectedCategory;
              })
              .map(function (item) {
                return {
                  personality: item.personality,
                  disclaimer: item.disclaimer,
                  prompt: item.prompt,
                };
              });

            // remove duplicate personalities
            personalities = Array.from(new Set(personalities));

            // populate second select element with personalities
            var personalitySelect =
              document.getElementById("personality-select");
            personalitySelect.innerHTML = "";
            personalities.forEach(function (personality) {
              var option = document.createElement("option");
              option.value = JSON.stringify(personality);
              option.text = personality.personality;
              personalitySelect.add(option);
            });
            // set the last selected personality as the selected option
            personalitySelect.selectedIndex = global.selected_personality;
          });
          // set the last selected category as the selected option
          var selectedCategory = global.selected_category;
          categorySelect.selectedIndex = selectedCategory;
          // trigger change event to populate the second select element
          var event = new Event("change");
          categorySelect.dispatchEvent(event);
        },
      });
    });
}

function build_ui() {
  console.log("building ui");
  // Create the main div
  floatingDiv = document.createElement("div");
  floatingDiv.classList.add("floating-div");
  document.body.appendChild(floatingDiv);
  // Create the title bar div
  var titleBar = document.createElement("div");
  titleBar.classList.add("title-bar");
  titleBar.innerHTML = "ChatGPT Personality selector";

  // Add the title bar as the first child of the floating div
  floatingDiv.insertBefore(titleBar, floatingDiv.firstChild);

  // Create the close button
  var closeButton = document.createElement("button");
  closeButton.classList.add("close-button");
  closeButton.textContent = "X";

  // Add a click event listener to the close button
  closeButton.addEventListener("click", function () {
    floatingDiv.style.display = "none";
  });

  // Append the close button to the main div
  floatingDiv.appendChild(closeButton);

  // Content
  var optionsDiv = document.createElement("div");
  optionsDiv.classList.add("content-div");

  var divider = document.createElement("hr");
  floatingDiv.appendChild(divider);
  floatingDiv.appendChild(optionsDiv);
  console.log("Updating UI");

  textarea = document.querySelector("textarea");

  var submit_personality = document.createElement("button");
  submit_personality.classList.add("submit-personality");

  submit_personality.id = "submit-personality";
  submit_personality.innerHTML = `🧠 Apply personality`;
  submit_personality.addEventListener("click", onSubmit);

  language_div = document.createElement("div");
  language_div.classList.add("input-select-div");

  language_label = document.createElement("label");
  language_label.classList.add("input-select-label");
  language_label.innerText = "Language";

  language_select = document.createElement("select");
  language_select.classList.add("input-selects");

  language_div.appendChild(language_label);
  language_div.appendChild(language_select);

  lang_options.forEach((row) => {
    var optionElement = document.createElement("option");
    optionElement.value = row.value;
    optionElement.innerHTML = row.label;
    optionElement.classList.add("text-white");
    language_select.appendChild(optionElement);
  });
  language_select.selectedIndex = global["language"];

  language_select.addEventListener("change", (event) => {
    global["language"] = event.target.selectedIndex;
    global["selected_category"] = 0;
    global["selected_personality"] = 0;

    chrome.storage.sync.set({ global: global });
    build_persons_list();
    populateVoicesList();
    console.log(event.target.value);
  });

  // Build category div
  category_select_div = document.createElement("div");
  category_select_div.classList.add("input-select-div");

  category_select_label = document.createElement("label");
  category_select_label.classList.add("input-select-label");
  category_select_label.textContent = "Category";

  category_select = document.createElement("select");
  category_select.id = "category-select";
  category_select.classList.add("input-selects");
  category_select.addEventListener("change", () => {
    global["selected_category"] = this.selectedIndex;
    chrome.storage.sync.set({ global: global });
  });
  category_select.selectedIndex = global["selected_category"];
  category_select_div.appendChild(category_select_label);
  category_select_div.appendChild(category_select);

  // Build personality div
  personality_select_div = document.createElement("div");
  personality_select_div.classList.add("input-select-div");

  personality_select_label = document.createElement("label");
  personality_select_label.classList.add("input-select-label");
  personality_select_label.textContent = "Personality";

  personality_select = document.createElement("select");
  personality_select.id = "personality-select";
  personality_select.classList.add("input-selects");
  personality_select.addEventListener("change", () => {
    global["selected_personality"] = this.selectedIndex;
    chrome.storage.sync.set({ global: global });
  });
  personality_select.selectedIndex = global["selected_personality"];

  personality_select_div.appendChild(personality_select_label);
  personality_select_div.appendChild(personality_select);

  build_persons_list();

  voice_select_label = document.createElement("label");
  voice_select_label.textContent = "Voice";
  voice_select_label.classList.add("input-select-label");

  voice_select = document.createElement("select");
  voice_select.classList.add("input-selects");

  voices = [];
  function populateVoicesList() {
    console.log("Populating the list of voices");
    voices = synth.getVoices();
    console.log(`language : ${lang_options[global["language"]].value}`);
    for (let i = 0; i < voices.length; i++) {
      if (
        voices[i].lang.startsWith(
          lang_options[global["language"]].value.substring(0, 2)
        )
      ) {
        const option = document.createElement("option");
        option.textContent = `${voices[i].name} (${voices[i].lang})`;

        if (voices[i].default) {
          option.textContent += " — DEFAULT";
        }

        option.setAttribute("data-lang", voices[i].lang);
        option.setAttribute("data-name", voices[i].name);
        voice_select.appendChild(option);
      }
    }
    voice_select.addEventListener("change", function () {
      // Code to execute when the voice_selected option changes
      console.log(this.value);
      global["voice"] = this.value;
      chrome.storage.sync.set({ global: global });
    });
    if (global["voice"] != "") {
      voice_select.value = global["voice"];
    }
  }
  setTimeout(populateVoicesList, 1000);

  voice_select_div = document.createElement("div");
  voice_select_div.classList.add("input-select-div");

  voice_select_div.appendChild(voice_select_label);
  voice_select_div.appendChild(voice_select);

  // textarea.addEventListener("keydown", onSautoread

  autoread_div = document.createElement("div");
  autoread_div.classList.add("input-select-div");

  autoread_label = document.createElement("label");
  autoread_label.classList.add("input-select-label");
  autoread_label.textContent = "Autoread";

  autoread = document.createElement("input");
  autoread.classList.add("input-checkbox");
  autoread.type = "checkbox";

  autoread.addEventListener("click", function () {
    console.log(this.checked);
    global["auto_audio"] = this.checked;
    chrome.storage.sync.set({ global: global });
  });
  autoread.checked = global["auto_audio"];
  autoread_div.appendChild(autoread_label);
  autoread_div.appendChild(autoread);

  // Show at startup
  show_at_startup_div = document.createElement("div");
  show_at_startup_div.classList.add("input-select-div");

  show_at_startup_label = document.createElement("label");
  show_at_startup_label.classList.add("input-select-label");
  show_at_startup_label.textContent = "Show at startup?";

  show_at_startup = document.createElement("input");
  show_at_startup.classList.add("input-checkbox");
  show_at_startup.type = "checkbox";

  show_at_startup.addEventListener("click", function () {
    console.log(this.checked);
    global["show_help_at_startup"] = this.checked;
    chrome.storage.sync.set({ global: global });
  });
  show_at_startup.checked = global["show_help_at_startup"];
  show_at_startup_div.appendChild(show_at_startup_label);
  show_at_startup_div.appendChild(show_at_startup);

  var credits = document.createElement("div");
  credits.innerHTML = `<footer style="text-align:center;width:100%;">
  This app is built by ParisNeo with the help of ChatGPT<br>
  <a class="link" href="https://github.com/ParisNeo/chatgpt-personality-selector/blob/main/README.md" target="_blank">Help</a>
  <div style="display:flex;flex:row;text-align:center;">
  <table width="100%">
  <tr>
  <td>
    <a href="https://twitter.com/share?url=https://github.com/ParisNeo/chatgpt-personality-selector/&amp;text=Here is a live Todolist app built with the help of chatgpt: TodoList" target="_blank">
      <svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" role="none" class="twtr-color-fill--blue-logo"> 
        <path fill-rule="evenodd" clip-rule="evenodd" d="M7.04128 17.7861C4.53883 17.7861 2.21078 17.0602 0.25 15.8165C0.596807 15.857 0.949401 15.8773 1.30683 15.8773C3.38266 15.8773 5.29282 15.1764 6.80944 14.0003C4.87 13.9646 3.23461 12.6968 2.67056 10.9547C2.94041 11.0059 3.21803 11.0338 3.50342 11.0338C3.90767 11.0338 4.2993 10.9798 4.67133 10.8796C2.64431 10.4775 1.11689 8.70468 1.11689 6.5808C1.11689 6.56156 1.11689 6.54327 1.11792 6.52489C1.71505 6.85368 2.39787 7.05133 3.12448 7.07347C1.93514 6.28783 1.15299 4.94488 1.15299 3.42361C1.15299 2.62053 1.37213 1.86754 1.75297 1.21971C3.93781 3.87277 7.20298 5.61776 10.885 5.80097C10.8091 5.47987 10.7701 5.14535 10.7701 4.80118C10.7701 2.38039 12.7543 0.416626 15.2012 0.416626C16.4753 0.416626 17.6267 0.949734 18.4351 1.80197C19.4444 1.60535 20.392 1.23997 21.2484 0.737722C20.9172 1.76154 20.2148 2.62053 19.3002 3.1633C20.1963 3.0572 21.0506 2.82194 21.8444 2.47297C21.2512 3.35223 20.4993 4.12445 19.6342 4.7433C19.643 4.93129 19.6469 5.12031 19.6469 5.31018C19.6469 11.1042 15.1905 17.7861 7.04128 17.7861Z" fill="#1DA1F2"></path> 
      </svg>
    </a>
  </td>
  <td>
    <a href="https://www.linkedin.com/shareArticle?mini=true&amp;url=https://github.com/ParisNeo/chatgpt-personality-selector/&amp;title=Here is a live Todolist app built with the help of chatgpt: TodoList" target="_blank">
        <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 72 72" width="72"><g fill="none" fill-rule="evenodd"><path d="M8,72 L64,72 C68.418278,72 72,68.418278 72,64 L72,8 C72,3.581722 68.418278,-8.11624501e-16 64,0 L8,0 C3.581722,8.11624501e-16 -5.41083001e-16,3.581722 0,8 L0,64 C5.41083001e-16,68.418278 3.581722,72 8,72 Z" fill="#007EBB"></path><path d="M62,62 L51.315625,62 L51.315625,43.8021149 C51.315625,38.8127542 49.4197917,36.0245323 45.4707031,36.0245323 C41.1746094,36.0245323 38.9300781,38.9261103 38.9300781,43.8021149 L38.9300781,62 L28.6333333,62 L28.6333333,27.3333333 L38.9300781,27.3333333 L38.9300781,32.0029283 C38.9300781,32.0029283 42.0260417,26.2742151 49.3825521,26.2742151 C56.7356771,26.2742151 62,30.7644705 62,40.051212 L62,62 Z M16.349349,22.7940133 C12.8420573,22.7940133 10,19.9296567 10,16.3970067 C10,12.8643566 12.8420573,10 16.349349,10 C19.8566406,10 22.6970052,12.8643566 22.6970052,16.3970067 C22.6970052,19.9296567 19.8566406,22.7940133 16.349349,22.7940133 Z M11.0325521,62 L21.769401,62 L21.769401,27.3333333 L11.0325521,27.3333333 L11.0325521,62 Z" fill="#FFF"></path></g></svg>
    </a>    
  </td>
  <td>
    <a href="https://www.facebook.com/sharer/sharer.php&amp;u=https://github.com/ParisNeo/chatgpt-personality-selector/&amp;title=Here is a live Todolist app built with the help of chatgpt: TodoList" target="_blank">
      <svg width="22" height="18" id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 287.56 191"><defs><style>.cls-1{fill:#0081fb;}.cls-2{fill:url(#linear-gradient);}.cls-3{fill:url(#linear-gradient-2);}</style><linearGradient id="linear-gradient" x1="62.34" y1="101.45" x2="260.34" y2="91.45" gradientTransform="matrix(1, 0, 0, -1, 0, 192)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0064e1"></stop><stop offset="0.4" stop-color="#0064e1"></stop><stop offset="0.83" stop-color="#0073ee"></stop><stop offset="1" stop-color="#0082fb"></stop></linearGradient><linearGradient id="linear-gradient-2" x1="41.42" y1="53" x2="41.42" y2="126" gradientTransform="matrix(1, 0, 0, -1, 0, 192)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0082fb"></stop><stop offset="1" stop-color="#0064e0"></stop></linearGradient></defs><title>facebook-meta</title><path class="cls-1" d="M31.06,126c0,11,2.41,19.41,5.56,24.51A19,19,0,0,0,53.19,160c8.1,0,15.51-2,29.79-21.76,11.44-15.83,24.92-38,34-52l15.36-23.6c10.67-16.39,23-34.61,37.18-47C181.07,5.6,193.54,0,206.09,0c21.07,0,41.14,12.21,56.5,35.11,16.81,25.08,25,56.67,25,89.27,0,19.38-3.82,33.62-10.32,44.87C271,180.13,258.72,191,238.13,191V160c17.63,0,22-16.2,22-34.74,0-26.42-6.16-55.74-19.73-76.69-9.63-14.86-22.11-23.94-35.84-23.94-14.85,0-26.8,11.2-40.23,31.17-7.14,10.61-14.47,23.54-22.7,38.13l-9.06,16c-18.2,32.27-22.81,39.62-31.91,51.75C84.74,183,71.12,191,53.19,191c-21.27,0-34.72-9.21-43-23.09C3.34,156.6,0,141.76,0,124.85Z"></path><path class="cls-2" d="M24.49,37.3C38.73,15.35,59.28,0,82.85,0c13.65,0,27.22,4,41.39,15.61,15.5,12.65,32,33.48,52.63,67.81l7.39,12.32c17.84,29.72,28,45,33.93,52.22,7.64,9.26,13,12,19.94,12,17.63,0,22-16.2,22-34.74l27.4-.86c0,19.38-3.82,33.62-10.32,44.87C271,180.13,258.72,191,238.13,191c-12.8,0-24.14-2.78-36.68-14.61-9.64-9.08-20.91-25.21-29.58-39.71L146.08,93.6c-12.94-21.62-24.81-37.74-31.68-45C107,40.71,97.51,31.23,82.35,31.23c-12.27,0-22.69,8.61-31.41,21.78Z"></path><path class="cls-3" d="M82.35,31.23c-12.27,0-22.69,8.61-31.41,21.78C38.61,71.62,31.06,99.34,31.06,126c0,11,2.41,19.41,5.56,24.51L10.14,167.91C3.34,156.6,0,141.76,0,124.85,0,94.1,8.44,62.05,24.49,37.3,38.73,15.35,59.28,0,82.85,0Z"></path></svg>
    </a>
  </td>
  <td>
    <a href="https://github.com/ParisNeo/chatgpt-personality-selector" style:"padding-left:10px;">
        <img src="https://cdn.jsdelivr.net/npm/simple-icons@v3/icons/github.svg" width="25" height="25" alt="GitHub Repository">
    </a>
  </td>
</table>
</div>  

</footer>`;
  credits.classList.add("text-footer");

  optionsDiv.appendChild(language_div);
  optionsDiv.appendChild(category_select_div);
  optionsDiv.appendChild(personality_select_div);
  optionsDiv.appendChild(voice_select_div);

  optionsDiv.appendChild(autoread_div);
  optionsDiv.appendChild(show_at_startup_div);
  optionsDiv.appendChild(submit_personality);

  // Append the new div to the floating div
  optionsDiv.appendChild(credits);

  console.log("Done updating ui");

  if (!global["show_help_at_startup"]) {
    floatingDiv.style.display = "none";
  }
  add_audio_in_ui();
}
// Audio code
function splitString(string, maxLength) {
  const sentences = string.match(/[^.!?]+[.!?]/g);
  const strings = [];
  let currentString = "";

  if (sentences) {
    for (const sentence of sentences) {
      if (currentString.length + sentence.length > maxLength) {
        strings.push(currentString);
        currentString = "";
      }

      currentString += `${sentence} `;
    }
  } else {
    strings.push(string);
  }

  if (currentString) {
    strings.push(currentString);
  }

  return strings;
}
function addListeners(button, utterThis) {
  console.log("Adding listeners");
  utterThis.onstart = (event) => {
    isSpeaking = true;
    button.style.backgroundColor = "red";
    button.style.boxShadow = "2px 2px 0.5px #808080";
  };

  utterThis.onend = (event) => {
    isSpeaking = false;
    button.style.backgroundColor = "";
    button.style.boxShadow = "";
  };
}

function attachAudio_modules(div) {
  console.log("Adding audio tag");
  if (div.parentNode.getElementsByClassName("audio-out-button").length > 0) {
    return;
  }
  const audio_out_button = document.createElement("button");
  audio_out_button.id = "audio-out-button";
  audio_out_button.classList.add("audio_btn");
  audio_out_button.innerHTML = "🕪";
  div.classList.add("flex-1");
  audio_out_button.classList.add("audio-out-button");
  div.parentNode.appendChild(audio_out_button);

  function play_audio() {
    if (isSpeaking) {
      console.log("stopping audio");

      audio_out_button.style.backgroundColor = "";
      audio_out_button.style.boxShadow = "";
      synth.cancel();
      isSpeaking = false;
    } else {
      console.log("starting audio");
      isSpeaking = true;
      text = audio_out_button.previousSibling.textContent;
      console.log(text);

      const selectedOption =
        voice_select.selectedOptions[0].getAttribute("data-name");
      var selectedVoice = null;
      console.log(`Found selected voice : ${selectedOption}`);
      for (let i = 0; i < voices.length; i++) {
        if (voices[i].name === selectedOption) {
          selectedVoice = voices[i];
          console.log("Found selected voice");
        }
      }
      console.log(selectedVoice.voiceURI);
      if (selectedVoice && selectedVoice.voiceURI === "native") {
        console.log("native");
        const utterThis = new SpeechSynthesisUtterance(text);
        utterThis.voice = selectedVoice;
        addListeners(audio_out_button, utterThis);
        synth.speak(utterThis);
      } else {
        console.log("Not native");
        texts = splitString(text, 200);
        texts.forEach((text) => {
          const utterThis = new SpeechSynthesisUtterance(text);
          utterThis.voice = selectedVoice;
          addListeners(audio_out_button, utterThis);
          synth.speak(utterThis);
        });
      }
    }
  }
  audio_out_button.addEventListener("click", () => {
    play_audio();
  });
  if (global["auto_audio"]) {
    play_audio();
  }
}

console.log("Running Chat GPT personality selector code");
function callback(mutationsList, observer) {
  if (observer.isRunning || !mutationsList.length) {
    return;
  }
  add_audio_in_ui();
  observer.isRunning = true;
  var lastDivWithText = get_lastdiv_with_text();
  try {
    if (lastDivWithText) {
      if (
        lastDivWithText.parentNode.parentNode.parentNode.querySelectorAll(
          "button"
        ).length > 0
      ) {
        parent =
          lastDivWithText.parentNode.parentNode.parentNode.querySelectorAll(
            "button"
          )[0].parentNode;
        if (parent.classList.contains("visible")) {
          if (
            lastDivWithText.parentNode.getElementsByClassName(
              "audio-out-button"
            ).length == 0
          ) {
            attachAudio_modules(lastDivWithText);
          }
        }
      }
    }
    var link = document.querySelector("a[href='https://discord.gg/openai']");
    if (link.parentNode.querySelector("#settings-btn") === null) {
      const settings_button = document.createElement("button");
      settings_button.classList.add("personality-settings");
      settings_button.id = "settings-btn";

      settings_button.innerHTML = `🪛 Personality settings`;
      //settings_button.classList.add("flex py-3 px-3 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm")
      settings_button.addEventListener("click", () => {
        floatingDiv.style.display = "block";
      });

      link.parentNode.insertBefore(settings_button, link.nextSibling);
    }
  } catch {}
  requestAnimationFrame(() => {
    observer.isRunning = false;
  });
}

window.addEventListener("load", (event) => {
  var main = document.querySelector("main");

  chrome.storage.sync.get(["global"], (data) => {
    global = data.global;
  });

  setTimeout(build_ui, 1000);
  console.log("Chatgpt Personality selector module");

  observer = new MutationObserver(callback);
  observer.isRunning = false;

  observer.observe(document.body, {
    childList: true,
    characterData: true,
    subtree: true,
  });
});

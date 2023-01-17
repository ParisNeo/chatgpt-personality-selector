let isProcessing = false;
var global={
    "selected_personality":0,
    "language":0
}

var textarea;


chrome.storage.sync.get(["global"], (data) => {
    global =  data.global ;
});


function showErrorMessage(e) {
    console.log(e);
    var errorDiv = document.createElement("div");
    errorDiv.classList.add("chatgpt-personality-selector-error", "absolute", "bottom-0", "right-1", "text-white", "bg-red-500", "p-4", "rounded-lg", "mb-4", "mr-4", "text-sm");
    errorDiv.innerHTML = "<b>An error occurred</b><br>" + e + "<br><br>Check the console for more details.";
    document.body.appendChild(errorDiv);
    setTimeout(() => { errorDiv.remove(); }, 5000);
}

function conditionChatGPT(results, query) {
    let counter = 1;
    let formattedResults = `Current date: ${new Date().toLocaleDateString()}\n\nSubject :  ${query}.\n\n`;
    
    formattedResults = formattedResults + `Instructions:
    Act as an AI specialized in papers analysis and article generation.
    The AI knows how to write different text formats such as latex.
    In addition to natural interaction, the AI can respond to those commands :
    summerize,mksurvey,showperspectives,critisize,list,latex.
    Make sure to cite results using [[number](URL)] notation after the reference.
    Be precise and use academic english.
    Stick to the user requests.
    The user can formulate requests concerning the articles. respond in a formal manner.\n\n
    After recovering the Articles web search data, just answer with welcome message and wait for the user command.\n
    Welcome message "Welcome to SearchAI, your personal web browser.\nSubject recovered. Please specify one of the following options:
    - summerize : Write a brief summary. \n
    - mksurvey : Write a scientific survey (Write at least ${global["num_papers"]} paragraphs). \n
    - showperspectives : Write a paragraph about the perspectives and future evolutions of the work.\n
    - critisize : Criticise the subject.\n
    - list : list articles source links. \n
    - latex : write a latex article about the subject\n    
    "`
    formattedResults = formattedResults + `Articles web search results:\n\n`
    formattedResults = formattedResults + results.reduce((acc, result) => acc += `[${counter++}] "${result.body}"\nSource: ${result.href}\n\n`, "");

    textarea.value = formattedResults;
}

function pressEnter() {
    textarea.focus();
    const enterEvent = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: 'Enter',
        code: 'Enter'
    });
    textarea.dispatchEvent(enterEvent);
}

// use max_results= to set the maximum number of results expoected
async function api_search(query) {
    var url = `https://ddg-webapp-aagd.vercel.app/search?&q=${query}`;
    console.log(url);
    const response = await fetch(url);
    return await response.json();
}


var commands;
function onSubmit(event) {
    console.log(`On submit triggered with ${commands}`);
    if (event.shiftKey && event.key === 'Enter') {
        console.log("shift detected");
        return;
    }
    // Save global
    chrome.storage.sync.set({ "global": global });
    if (!isProcessing) {
        console.log("Processing")
        isProcessing = true;

        try {
            if(commands.value == "")
            {
                let query = textarea.value;
                if(query==="")
                {
                    alert("To use this personality, first write the query you want to search on the internet in the query textarea then press the red button.\nuse max_results=5 to set the maximum number of results expoected to 5 or any other value")
                }
                textarea.value = "";
    
                query = query.trim();
    
                if (query === "") {
                    isProcessing = false;
                    return;
                }
    
                api_search(query, global["num_papers"], global["content_type"], global["subject_area"], global["start_year"], global["end_year"], global["sort_by"])
                    .then(results => {
                    conditionChatGPT(results, query);
                    pressEnter();
                    isProcessing = false;
                    });
            }
            else
            {
                console.log("Setting text data")
                textarea.value=commands.value;
                console.log("Pressig enter")
                pressEnter();
            }
        } catch (error) {
            isProcessing = false;
            showErrorMessage(error);
        }
    }
}


function build_option(option_name, select_options_list){
  var dropDown = document.createElement("select");
  dropDown.classList.add("text-white", "ml-0", "bg-gray-900", "border", "w-full");

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

function updateUI() {

    if (document.querySelector(".chatgpt-personality-selector-options")) {
        return;
    }

    console.log("Updating UI");

   
    textarea = document.querySelector("textarea");
    var textareaWrapper = textarea.parentNode;

    var submit_personality = document.createElement("button");
    submit_personality.innerHTML=`<svg stroke="red" fill="red" stroke-width="0" viewBox="0 0 20 20" class="h-4 w-4 rotate-90" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>`

    commands = document.createElement("select");
    commands.style.width="100%";
    commands.style.color="black";
    commands.style.borderRadius="10px";
    commands.style.marginRight="20px";

    // Initialize the list of commands and options
    let commands_options_list = [{ value: "", label: "" }];

    // Read the CSV file
    let fileUrl = chrome.runtime.getURL("prompts.csv");
    // Use PapaParse to parse the CSV file
    fetch(fileUrl)
    .then((response) => response.text())
    .then((data) => {
        // Use PapaParse to parse the CSV file
        Papa.parse(data, {
            header: true,
            complete: function(results) {
                // Iterate through the rows of the CSV file
            console.log(`csv file received : ${results.data}`);
            results.data.forEach((row) => {
                console.log(`adding : ${row.act}`);

                // Add the act and prompt columns to the list of commands and options
                var optionElement = document.createElement("option");
                optionElement.value = row.prompt;
                optionElement.innerHTML = row.act;
                optionElement.classList.add("text-white");
                commands.appendChild(optionElement);
                optionElement.style.color="black";
            });
            },
        })
    });

    // textarea.addEventListener("keydown", onSubmit);
    submit_personality.addEventListener("click", onSubmit);




    var divider = document.createElement("hr");

    var optionsDiv = document.createElement("div");
    optionsDiv.classList.add("chatgpt-personality-selector-options", "p-4", "space-y-2");
    optionsDiv.style.maxHeight = "200px";
    optionsDiv.style.overflowY = "scroll";
  

    var title = document.createElement("h4");
    title.innerHTML = "ChatGPT Personality selector";
    title.classList.add("text-white", "pb-4", "text-lg", "font-bold");

    var credits = document.createElement("a");
    credits.innerHTML = `<footer style="text-align:center;">
    This app is built by Saif with the help of ChatGPT<br>
    <a href="https://twitter.com/share?url=https://github.com/ParisNeo/chatgpt-personality-selector/&amp;text=Here is a live Todolist app built with the help of chatgpt: TodoList" target="_blank">
       <svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" role="none" class="twtr-color-fill--blue-logo"> 
        <path fill-rule="evenodd" clip-rule="evenodd" d="M7.04128 17.7861C4.53883 17.7861 2.21078 17.0602 0.25 15.8165C0.596807 15.857 0.949401 15.8773 1.30683 15.8773C3.38266 15.8773 5.29282 15.1764 6.80944 14.0003C4.87 13.9646 3.23461 12.6968 2.67056 10.9547C2.94041 11.0059 3.21803 11.0338 3.50342 11.0338C3.90767 11.0338 4.2993 10.9798 4.67133 10.8796C2.64431 10.4775 1.11689 8.70468 1.11689 6.5808C1.11689 6.56156 1.11689 6.54327 1.11792 6.52489C1.71505 6.85368 2.39787 7.05133 3.12448 7.07347C1.93514 6.28783 1.15299 4.94488 1.15299 3.42361C1.15299 2.62053 1.37213 1.86754 1.75297 1.21971C3.93781 3.87277 7.20298 5.61776 10.885 5.80097C10.8091 5.47987 10.7701 5.14535 10.7701 4.80118C10.7701 2.38039 12.7543 0.416626 15.2012 0.416626C16.4753 0.416626 17.6267 0.949734 18.4351 1.80197C19.4444 1.60535 20.392 1.23997 21.2484 0.737722C20.9172 1.76154 20.2148 2.62053 19.3002 3.1633C20.1963 3.0572 21.0506 2.82194 21.8444 2.47297C21.2512 3.35223 20.4993 4.12445 19.6342 4.7433C19.643 4.93129 19.6469 5.12031 19.6469 5.31018C19.6469 11.1042 15.1905 17.7861 7.04128 17.7861Z" fill="#1DA1F2"></path> 
       </svg>
    </a>
    <a href="https://www.linkedin.com/shareArticle?mini=true&amp;url=https://github.com/ParisNeo/chatgpt-personality-selector/&amp;title=Here is a live Todolist app built with the help of chatgpt: TodoList" target="_blank">
      <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 72 72" width="72"><g fill="none" fill-rule="evenodd"><path d="M8,72 L64,72 C68.418278,72 72,68.418278 72,64 L72,8 C72,3.581722 68.418278,-8.11624501e-16 64,0 L8,0 C3.581722,8.11624501e-16 -5.41083001e-16,3.581722 0,8 L0,64 C5.41083001e-16,68.418278 3.581722,72 8,72 Z" fill="#007EBB"></path><path d="M62,62 L51.315625,62 L51.315625,43.8021149 C51.315625,38.8127542 49.4197917,36.0245323 45.4707031,36.0245323 C41.1746094,36.0245323 38.9300781,38.9261103 38.9300781,43.8021149 L38.9300781,62 L28.6333333,62 L28.6333333,27.3333333 L38.9300781,27.3333333 L38.9300781,32.0029283 C38.9300781,32.0029283 42.0260417,26.2742151 49.3825521,26.2742151 C56.7356771,26.2742151 62,30.7644705 62,40.051212 L62,62 Z M16.349349,22.7940133 C12.8420573,22.7940133 10,19.9296567 10,16.3970067 C10,12.8643566 12.8420573,10 16.349349,10 C19.8566406,10 22.6970052,12.8643566 22.6970052,16.3970067 C22.6970052,19.9296567 19.8566406,22.7940133 16.349349,22.7940133 Z M11.0325521,62 L21.769401,62 L21.769401,27.3333333 L11.0325521,27.3333333 L11.0325521,62 Z" fill="#FFF"></path></g></svg>
   </a>    
   <a href="https://www.facebook.com/sharer/sharer.php&amp;u=https://github.com/ParisNeo/chatgpt-personality-selector/&amp;title=Here is a live Todolist app built with the help of chatgpt: TodoList" target="_blank">
    <svg width="22" height="18" id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 287.56 191"><defs><style>.cls-1{fill:#0081fb;}.cls-2{fill:url(#linear-gradient);}.cls-3{fill:url(#linear-gradient-2);}</style><linearGradient id="linear-gradient" x1="62.34" y1="101.45" x2="260.34" y2="91.45" gradientTransform="matrix(1, 0, 0, -1, 0, 192)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0064e1"></stop><stop offset="0.4" stop-color="#0064e1"></stop><stop offset="0.83" stop-color="#0073ee"></stop><stop offset="1" stop-color="#0082fb"></stop></linearGradient><linearGradient id="linear-gradient-2" x1="41.42" y1="53" x2="41.42" y2="126" gradientTransform="matrix(1, 0, 0, -1, 0, 192)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0082fb"></stop><stop offset="1" stop-color="#0064e0"></stop></linearGradient></defs><title>facebook-meta</title><path class="cls-1" d="M31.06,126c0,11,2.41,19.41,5.56,24.51A19,19,0,0,0,53.19,160c8.1,0,15.51-2,29.79-21.76,11.44-15.83,24.92-38,34-52l15.36-23.6c10.67-16.39,23-34.61,37.18-47C181.07,5.6,193.54,0,206.09,0c21.07,0,41.14,12.21,56.5,35.11,16.81,25.08,25,56.67,25,89.27,0,19.38-3.82,33.62-10.32,44.87C271,180.13,258.72,191,238.13,191V160c17.63,0,22-16.2,22-34.74,0-26.42-6.16-55.74-19.73-76.69-9.63-14.86-22.11-23.94-35.84-23.94-14.85,0-26.8,11.2-40.23,31.17-7.14,10.61-14.47,23.54-22.7,38.13l-9.06,16c-18.2,32.27-22.81,39.62-31.91,51.75C84.74,183,71.12,191,53.19,191c-21.27,0-34.72-9.21-43-23.09C3.34,156.6,0,141.76,0,124.85Z"></path><path class="cls-2" d="M24.49,37.3C38.73,15.35,59.28,0,82.85,0c13.65,0,27.22,4,41.39,15.61,15.5,12.65,32,33.48,52.63,67.81l7.39,12.32c17.84,29.72,28,45,33.93,52.22,7.64,9.26,13,12,19.94,12,17.63,0,22-16.2,22-34.74l27.4-.86c0,19.38-3.82,33.62-10.32,44.87C271,180.13,258.72,191,238.13,191c-12.8,0-24.14-2.78-36.68-14.61-9.64-9.08-20.91-25.21-29.58-39.71L146.08,93.6c-12.94-21.62-24.81-37.74-31.68-45C107,40.71,97.51,31.23,82.35,31.23c-12.27,0-22.69,8.61-31.41,21.78Z"></path><path class="cls-3" d="M82.35,31.23c-12.27,0-22.69,8.61-31.41,21.78C38.61,71.62,31.06,99.34,31.06,126c0,11,2.41,19.41,5.56,24.51L10.14,167.91C3.34,156.6,0,141.76,0,124.85,0,94.1,8.44,62.05,24.49,37.3,38.73,15.35,59.28,0,82.85,0Z"></path></svg>
  </a>    

</footer>`;
    credits.classList.add("text-sm", "text-gray-500");


    optionsDiv.style.width="100%";
    optionsDiv.appendChild(title);
    optionsDiv.appendChild(commands);
    optionsDiv.appendChild(submit_personality);
    optionsDiv.appendChild(credits);



    var navMenu = document.querySelector('nav');
    navMenu.appendChild(divider);
    navMenu.appendChild(optionsDiv);
}


console.log("Running Chat GPT paper survey code");


window.onload = function() {
    const titleEl = document.querySelector('title');
    const observer = new MutationObserver(() => {
        setTimeout(updateUI, 2000); //updateUI();
    });

    observer.observe(titleEl, {
        childList: true
    });
};
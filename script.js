let btn = document.querySelector("#btn");
let content = document.querySelector("#content");
let voice = document.querySelector("#voice");
let synth = window.speechSynthesis;

function speak(text, callback = null) {
    synth.cancel();
    let text_speak = new SpeechSynthesisUtterance(text);
    text_speak.rate = 1;
    text_speak.pitch = 1;
    text_speak.volume = 1;
    text_speak.lang = /[\u0900-\u097F]/.test(text) ? "hi-IN" : "en-US";
    
    text_speak.onend = () => {
        if (callback) callback();
    };
    synth.speak(text_speak);
}

function getGreeting() {
    let day = new Date();
    let hours = day.getHours();
    let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let today = day.toLocaleDateString('en-US', options);
    let greeting = "";
    
    if (hours >= 0 && hours < 12) {
        greeting = "Good Morning";
    } else if (hours >= 12 && hours < 16) {
        greeting = "Good Afternoon";
    } else if (hours >= 16 && hours < 21) {
        greeting = "Good Evening";
    } else {
        greeting = "Good Night";
    }
    return `${greeting} Sir! Today is ${today}. How can I assist you?`;
}

window.addEventListener("load", () => {
    speak(getGreeting());
});

let speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = new speechRecognition();

recognition.onresult = async (event) => {
    synth.cancel();
    let transcript = event.results[event.resultIndex][0].transcript.toLowerCase().trim();
    console.log("User said: ", transcript);
    content.innerText = transcript;
    await takeCommand(transcript);
};

recognition.onspeechend = () => recognition.stop();
recognition.onend = () => setTimeout(() => {
    voice.style.display = "none";
    btn.style.display = "flex";
}, 3000);

btn.addEventListener("click", () => {
    synth.cancel();
    recognition.start();
    btn.style.display = "none";
    voice.style.display = "block";
});

async function fetchAnswer(query) {
    let googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    speak("Let me find the answer for you.");
    setTimeout(() => {
        window.open(googleSearchUrl, "_blank");
    }, 1000);
    
    try {
        let response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`);
        let data = await response.json();
        let answer = data.AbstractText || "I couldn't find any information, but you can check on Google.";
        speak(answer);
        return answer;
    } catch (error) {
        console.error("Error fetching answer: ", error);
        let fallbackAnswer = "I am facing network issues. Please check your connection.";
        speak(fallbackAnswer);
        return fallbackAnswer;
    }
}

async function getJoke() {
    try {
        let response = await fetch("https://v2.jokeapi.dev/joke/Any?type=single");
        let data = await response.json();
        speak(data.joke);
    } catch (error) {
        speak("I couldn't fetch a joke at the moment.");
    }
}

async function getWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            let lat = position.coords.latitude;
            let lon = position.coords.longitude;
            try {
                let response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
                let data = await response.json();
                let weather = data.current_weather.temperature + "°C with " + data.current_weather.weathercode;
                speak("The current temperature is " + weather);
            } catch (error) {
                speak("Sorry, I couldn't fetch the weather.");
            }
        }, () => {
            speak("Location access denied. Cannot fetch weather updates.");
        });
    } else {
        speak("Geolocation is not supported by your browser.");
    }
}

async function takeCommand(message) {
    btn.style.display = "flex";
    voice.style.display = "none";
    console.log("Processing Command:", message);

    let commands = {
        "open youtube": "https://www.youtube.com/",
        "open facebook": "https://www.facebook.com/",
        "open instagram": "https://www.instagram.com/",
        "open twitter": "https://twitter.com/",
        "open whatsapp": "whatsapp://",
        "open google": "https://www.google.com/",
        "open github": "https://github.com/",
        "open linkedin": "https://www.linkedin.com/",
        "open reddit": "https://www.reddit.com/",
        "open discord": "https://discord.com/",
        "open telegram": "https://web.telegram.org/",
        "open netflix": "https://www.netflix.com/",
        "open snapchat": "https://www.snapchat.com/",
        "open pinterest": "https://www.pinterest.com/",
        "open tiktok": "https://www.tiktok.com/",
        "open tumblr": "https://www.tumblr.com/",
        "open chatgpt": "https://chat.openai.com/",
        "open bard": "https://bard.google.com/",
        "open copilot": "https://copilot.microsoft.com/",
        "open claude": "https://claude.ai/",
        "open midjourney": "https://www.midjourney.com/",
        "open stable diffusion": "https://stablediffusionweb.com/",
        "open quora": "https://www.quora.com/",
        "open stackoverflow": "https://stackoverflow.com/",
        "open notepad": "notepad",
        "open control panel": "control"
    };
    
    for (let command in commands) {
        if (message.includes(command)) {
            speak(`Opening ${command.replace("open ", "")}`, () => {
                setTimeout(() => {
                    window.open(commands[command], "_blank");
                }, 500);
            });
            return;
        }
    }
    
    if (["hello", "hi", "hey"].some(greet => message.includes(greet))) {
        speak("Hello sir! How are you? How can I assist you?");
    } else if (message.includes("who are you")) {
        speak("I am your virtual assistant, created by Mr. Rahul Sahani Sir.");
    } else if (message.includes("what is the time")) {
        speak(`The current time is ${new Date().toLocaleTimeString()}`);
    } else if (message.includes("weather")) {   // **Changed if → else if**
        getWeather();
    } else if (message.includes("tell me a joke")) {  // **Changed if → else if**
        getJoke();
    } else {
        let answer = await fetchAnswer(message);
        speak(answer);
    }
}


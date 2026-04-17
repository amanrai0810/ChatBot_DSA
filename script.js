// DSA ChatBot - script.js
// NOTE: Replace the API_KEY below with your actual Gemini API key
const API_KEY = "YOUR_API_KEY";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const SYSTEM_INSTRUCTION = `You are a Data structure and Algorithm Instructor. You will only reply to the problem related to 
Data structure and Algorithm. You have to solve query of user in simplest way.
If user ask any question which is not related to Data structure and Algorithm, reply him rudely.
Example: If user ask, How are you
You will reply: You dumb ask me some sensible question, like this message you can reply anything more rudely.
You have to reply him rudely if question is not related to Data structure and Algorithm.
Else reply him politely with simple explanation.
Use markdown-like formatting when needed: wrap code in triple backticks, use **bold** for key terms.`;

let conversationHistory = [];

async function sendMessage() {
  const input = document.getElementById('userInput');
  const text = input.value.trim();
  if (!text) return;

  const welcome = document.getElementById('welcome');
  if (welcome) welcome.remove();

  appendMessage('user', text);

  
  input.value = '';
  autoResize(input);

  conversationHistory.push({
    role: 'user',
    parts: [{ text }]
  });

  const typingEl = appendTyping();

  try {
    const body = {
      system_instruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }]
      },
      contents: conversationHistory
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'API request failed');
    }

    const data = await response.json();
    const reply = data.candidates[0].content.parts[0].text;

    conversationHistory.push({
      role: 'model',
      parts: [{ text: reply }]
    });

    typingEl.remove();

    const isRude = detectRude(reply);
    appendMessage('bot', reply, isRude);

  } catch (err) {
    typingEl.remove();
    appendError('❌ Error: ' + err.message);
  }
}

function detectRude(text) {
  const rudeWords = ['dumb', 'stupid', 'idiot', 'fool', 'nonsense', 'sensible question', 'irrelevant', 'off-topic'];
  return rudeWords.some(w => text.toLowerCase().includes(w));
}

function appendMessage(role, text, rude = false) {
  const chatbox = document.getElementById('chatbox');

  const div = document.createElement('div');
  div.className = `msg ${role}${rude ? ' rude' : ''}`;

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = role === 'user' ? '👤' : (rude ? '😤' : '🤖');

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = formatText(text);

  div.appendChild(avatar);
  div.appendChild(bubble);
  chatbox.appendChild(div);
  chatbox.scrollTop = chatbox.scrollHeight;
}

function appendTyping() {
  const chatbox = document.getElementById('chatbox');

  const div = document.createElement('div');
  div.className = 'msg bot';
  div.id = 'typing';

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = '🧩';

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';

  div.appendChild(avatar);
  div.appendChild(bubble);
  chatbox.appendChild(div);
  chatbox.scrollTop = chatbox.scrollHeight;
  return div;
}

function appendError(msg) {
  const chatbox = document.getElementById('chatbox');
  const div = document.createElement('div');
  div.className = 'error-note';
  div.textContent = msg;
  chatbox.appendChild(div);
}

function formatText(text) {
  text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  text = text.replace(/\n/g, '<br/>');
  return text;
}

function askTopic(q) {
  const input = document.getElementById('userInput');
  input.value = q;
  autoResize(input);
  sendMessage();
}

function clearChat() {
  conversationHistory = [];
  const chatbox = document.getElementById('chatbox');
  chatbox.innerHTML = `
    <div class="welcome" id="welcome">
      <span class="welcome-icon">🧑‍💻</span>
      <h1>DSA Instructor</h1>
      <p>Ask me anything about Data Structures & Algorithms.<br/>
      I explain things simply — but ask me something off-topic<br/>and I won't be so gentle 😈</p>
      <div class="quick-chips">
        <div class="chip" onclick="askTopic('What is a heap and how does it work?')">Heap</div>
        <div class="chip" onclick="askTopic('Explain merge sort with code')">Merge Sort</div>
        <div class="chip" onclick="askTopic('What is a trie?')">Trie</div>
        <div class="chip" onclick="askTopic('Explain Dijkstra algorithm')">Dijkstra</div>
        <div class="chip" onclick="askTopic('What is memoization?')">Memoization</div>
        <div class="chip" onclick="askTopic('Explain two pointer technique')">Two Pointers</div>
      </div>
    </div>`;
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

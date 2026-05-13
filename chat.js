// ── FanPit AI Chat Logic ──
// Add this system prompt at the top of your JS file
let SYSTEM_PROMPT = `You are FanPit AI, a football-obsessed best friend 
who watches every match. You explain football to casual fans in the 
most fun, simple, relatable way.
- Talk like a friend texting, never like a commentator
- Use simple analogies, no jargon
- Keep responses under 4 lines
- Use emojis naturally but not too much
- Never say "certainly" or "great question"
Current match: Man City vs Arsenal, 2-1 to Man City, 79 mins. 
Haaland scored twice, Saka scored for Arsenal.`;

const API_KEY = window.ENV?.GEMINI_API_KEY || "";

// Keep track of conversation history for context
let conversationHistory = [];

async function getAIResponse(userMessage) {
  // Add the user's message to the ongoing history
  conversationHistory.push({
    role: "user",
    parts: [{ text: userMessage }]
  });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        contents: conversationHistory
      })
    }
  );
  const data = await response.json();
  console.log("Gemini response:", data);
  
  const aiReply = data.candidates[0].content.parts[0].text;

  // Add the AI's response to the history so it remembers for next time
  conversationHistory.push({
    role: "model",
    parts: [{ text: aiReply }]
  });

  return aiReply;
}

// Replace your handleSend function with this
async function handleSend(e) {
  if (e) e.preventDefault();
  
  const text = chatInput.value.trim();
  if (!text) return;
  
  addUserMessage(text);
  chatInput.value = '';

  // Show typing indicator
  addAIMessage("typing...");
  const allMessages = chatMessages.querySelectorAll('.ai-message');
  const typingBubble = allMessages[allMessages.length - 1]
                       .querySelector('.chat-bubble');
  
  try {
    const reply = await getAIResponse(text);
    typingBubble.textContent = '';
    
    // Typewriter on real response
    let i = 0;
    function typeWriter() {
      if (i < reply.length) {
        typingBubble.textContent += reply.charAt(i);
        i++;
        scrollToBottom();
        setTimeout(typeWriter, 30);
      }
    }
    typeWriter();

  } catch (err) {
    typingBubble.textContent = "oops something broke 😅 try again!";
  }
}


const chatBtn = document.getElementById('aiChatBtn');
const chatPanel = document.getElementById('aiChatPanel');
const chatClose = document.getElementById('aiChatClose');
const chatForm = document.getElementById('aiChatForm');
const chatInput = document.getElementById('aiChatInput');
const chatMessages = document.getElementById('aiChatMessages');
const quickChips = document.querySelectorAll('.ai-chip');

// Hook up the new Ask AI buttons on the player cards
const cardAskAiBtns = document.querySelectorAll('.card-ask-ai-btn');
cardAskAiBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent the card from flipping back when clicking the button
    const player = btn.getAttribute('data-player');
    
    // Open chat panel if closed
    chatPanel.classList.remove('hidden');
    chatBtn.style.display = 'none';
    
    // Auto-send the query
    chatInput.value = `Tell me about ${player}`;
    handleSend();
  });
});

// Toggle panel
chatBtn.addEventListener('click', () => {
  chatPanel.classList.remove('hidden');
  chatBtn.style.display = 'none';
  chatInput.focus();
});

chatClose.addEventListener('click', () => {
  chatPanel.classList.add('hidden');
  chatBtn.style.display = 'flex';
});

// Auto-scroll to bottom
function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add User Message
function addUserMessage(text) {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-message user-message';
  
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.textContent = text;
  
  msgDiv.appendChild(bubble);
  chatMessages.appendChild(msgDiv);
  scrollToBottom();
}

// Add AI Message (with Typewriter effect)
function addAIMessage(text) {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-message ai-message';
  
  const avatar = document.createElement('div');
  avatar.className = 'chat-avatar';
  avatar.textContent = '⚽';
  
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  
  msgDiv.appendChild(avatar);
  msgDiv.appendChild(bubble);
  chatMessages.appendChild(msgDiv);
  
  // Typewriter effect
  let i = 0;
  const speed = 30; // ms per char
  
  function typeWriter() {
    if (i < text.length) {
      bubble.textContent += text.charAt(i);
      i++;
      scrollToBottom();
      setTimeout(typeWriter, speed);
    }
  }
  
  typeWriter();
}

// Event Listeners
chatForm.addEventListener('submit', handleSend);

quickChips.forEach(chip => {
  chip.addEventListener('click', (e) => {
    e.preventDefault();
    chatInput.value = chip.textContent;
    handleSend();
  });
});
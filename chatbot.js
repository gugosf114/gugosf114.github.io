/**
 * My Baking Creations - AI Chatbot Widget
 *
 * CONFIGURATION:
 * Update WORKER_URL below with your Cloudflare Worker URL after deployment
 */

(function() {
  'use strict';

  // ===========================================
  // CONFIGURATION - UPDATE THIS!
  // ===========================================
  const WORKER_URL = 'https://mbc-chatbot.summer-lake-b6ea.workers.dev';
  const PHONE_NUMBER = '(415) 568-8060'; // My Baking Creations business phone
  const PHONE_LINK = 'tel:+14155688060'; // Click-to-call link

  // ===========================================
  // State
  // ===========================================
  let isOpen = false;
  let isLoading = false;
  let conversationHistory = [];

  // ===========================================
  // Initialize when DOM is ready
  // ===========================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    createChatbotHTML();
    attachEventListeners();
    showWelcomeMessage();
  }

  // ===========================================
  // Create Chatbot HTML Structure
  // ===========================================
  function createChatbotHTML() {
    const container = document.createElement('div');
    container.id = 'chatbot-container';
    container.innerHTML = `
      <!-- Floating Toggle Button -->
      <button id="chatbot-toggle" aria-label="Open chat assistant" title="Chat with us!">
        <svg class="chat-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
          <circle cx="8" cy="10" r="1.5"/>
          <circle cx="12" cy="10" r="1.5"/>
          <circle cx="16" cy="10" r="1.5"/>
        </svg>
        <svg class="close-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
        <span class="notification-dot" id="chatbot-notification"></span>
      </button>

      <!-- Chat Window -->
      <div id="chatbot-window" role="dialog" aria-label="Chat assistant">
        <!-- Header -->
        <div id="chatbot-header">
          <div id="chatbot-header-info">
            <div id="chatbot-avatar"><img src="logo_icon.png" alt="My Baking Creations" style="width:100%;height:100%;object-fit:contain;border-radius:50%;"></div>
            <div id="chatbot-header-text">
              <h4>My Baking Creations</h4>
              <span>Ask me anything!</span>
            </div>
          </div>
          <button id="chatbot-close" aria-label="Close chat">&times;</button>
        </div>

        <!-- Messages -->
        <div id="chatbot-messages" role="log" aria-live="polite"></div>

        <!-- Input Area -->
        <div id="chatbot-input-area">
          <input
            type="text"
            id="chatbot-input"
            placeholder="Type your message..."
            aria-label="Type your message"
            autocomplete="off"
          >
          <button id="chatbot-send" aria-label="Send message">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(container);
  }

  // ===========================================
  // Event Listeners
  // ===========================================
  function attachEventListeners() {
    const toggle = document.getElementById('chatbot-toggle');
    const closeBtn = document.getElementById('chatbot-close');
    const sendBtn = document.getElementById('chatbot-send');
    const input = document.getElementById('chatbot-input');

    // Toggle chat open/close
    toggle.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', closeChat);

    // Send message
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeChat();
      }
    });

    // Handle clicks outside chat window on mobile
    document.addEventListener('click', (e) => {
      const container = document.getElementById('chatbot-container');
      if (isOpen && window.innerWidth <= 480 && !container.contains(e.target)) {
        // Don't close on mobile - full screen mode
      }
    });
  }

  // ===========================================
  // Chat Window Controls
  // ===========================================
  function toggleChat() {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  }

  function openChat() {
    const window = document.getElementById('chatbot-window');
    const toggle = document.getElementById('chatbot-toggle');
    const notification = document.getElementById('chatbot-notification');
    const input = document.getElementById('chatbot-input');

    window.classList.add('open');
    toggle.classList.add('open');
    notification.style.display = 'none';
    isOpen = true;

    // Focus input after animation
    setTimeout(() => {
      input.focus();
    }, 300);

    // Prevent body scroll on mobile
    if (window.innerWidth <= 480) {
      document.body.style.overflow = 'hidden';
    }
  }

  function closeChat() {
    const window = document.getElementById('chatbot-window');
    const toggle = document.getElementById('chatbot-toggle');

    window.classList.remove('open');
    toggle.classList.remove('open');
    isOpen = false;

    // Restore body scroll
    document.body.style.overflow = '';
  }

  // ===========================================
  // Message Handling
  // ===========================================
  function showWelcomeMessage() {
    const messagesContainer = document.getElementById('chatbot-messages');
    messagesContainer.innerHTML = `
      <div class="chatbot-welcome">
        <h3>Hi there! 👋</h3>
        <p>I'm here to help with your baking questions and orders. What can I help you with today?</p>
        <div class="chatbot-quick-replies">
          <button class="chatbot-quick-reply" data-message="What products do you offer?">Products</button>
          <button class="chatbot-quick-reply" data-message="How do I place an order?">Order Info</button>
          <button class="chatbot-quick-reply" data-message="What areas do you deliver to?">Delivery</button>
          <button class="chatbot-quick-reply" data-message="How far in advance should I order?">Timing</button>
        </div>
      </div>
    `;

    // Attach quick reply listeners
    messagesContainer.querySelectorAll('.chatbot-quick-reply').forEach(btn => {
      btn.addEventListener('click', () => {
        const message = btn.getAttribute('data-message');
        addUserMessage(message);
        sendToAPI(message);
      });
    });
  }

  function addUserMessage(text) {
    const messagesContainer = document.getElementById('chatbot-messages');

    // Clear welcome message if present
    const welcome = messagesContainer.querySelector('.chatbot-welcome');
    if (welcome) {
      welcome.remove();
    }

    const messageEl = document.createElement('div');
    messageEl.className = 'chatbot-message user';
    messageEl.textContent = text;
    messagesContainer.appendChild(messageEl);
    scrollToBottom();
  }

  function addBotMessage(text, showPhone = false) {
    const messagesContainer = document.getElementById('chatbot-messages');

    const messageEl = document.createElement('div');
    messageEl.className = 'chatbot-message bot';
    messageEl.textContent = text;
    messagesContainer.appendChild(messageEl);

    // Show phone card if needed
    if (showPhone) {
      const phoneCard = document.createElement('div');
      phoneCard.className = 'chatbot-phone-card';
      phoneCard.innerHTML = `
        <span>📞 Call us directly:</span>
        <a href="${PHONE_LINK}">${PHONE_NUMBER}</a>
      `;
      messagesContainer.appendChild(phoneCard);
    }

    scrollToBottom();
  }

  function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatbot-messages');

    const typing = document.createElement('div');
    typing.className = 'chatbot-typing';
    typing.id = 'chatbot-typing-indicator';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messagesContainer.appendChild(typing);
    scrollToBottom();
  }

  function hideTypingIndicator() {
    const typing = document.getElementById('chatbot-typing-indicator');
    if (typing) {
      typing.remove();
    }
  }

  function scrollToBottom() {
    const messagesContainer = document.getElementById('chatbot-messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // ===========================================
  // API Communication
  // ===========================================
  async function sendMessage() {
    const input = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send');
    const text = input.value.trim();

    if (!text || isLoading) return;

    // Clear input and show user message
    input.value = '';
    addUserMessage(text);

    // Send to API
    await sendToAPI(text);
  }

  async function sendToAPI(message) {
    const input = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send');

    // Check if worker URL is configured
    if (WORKER_URL === 'YOUR_CLOUDFLARE_WORKER_URL_HERE') {
      addBotMessage("I'm not fully set up yet! Please contact us directly for assistance.", true);
      return;
    }

    isLoading = true;
    sendBtn.disabled = true;
    showTypingIndicator();

    // Add to conversation history
    conversationHistory.push({ role: 'user', content: message });

    try {
      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationHistory
        }),
      });

      const data = await response.json();

      hideTypingIndicator();

      if (data.error) {
        addBotMessage(data.error, data.showPhone);
      } else if (data.reply) {
        // Add to conversation history
        conversationHistory.push({ role: 'assistant', content: data.reply });

        // Check if response mentions phone/contact for showing phone card
        const shouldShowPhone = data.reply.toLowerCase().includes('call us') ||
                               data.reply.toLowerCase().includes('phone') ||
                               data.reply.toLowerCase().includes('immediate assistance');

        addBotMessage(data.reply, shouldShowPhone);
      }

    } catch (error) {
      console.error('Chatbot error:', error);
      hideTypingIndicator();
      addBotMessage("I'm having trouble connecting right now. Please try again or contact us directly!", true);
    } finally {
      isLoading = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

})();

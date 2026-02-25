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
  const WHATSAPP_NUMBER = '14155688060'; // WhatsApp Business number (no + or dashes)
  const WHATSAPP_LINK = 'https://wa.me/14155688060'; // WhatsApp click-to-chat link

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

      // Also show WhatsApp button
      const whatsappCard = document.createElement('div');
      whatsappCard.className = 'chatbot-whatsapp-card';
      whatsappCard.innerHTML = `
        <a href="${WHATSAPP_LINK}?text=Hi!%20I%20have%20a%20question%20about%20an%20order." target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" width="20" height="20" style="fill:#fff;vertical-align:middle;margin-right:8px;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Chat on WhatsApp
        </a>
      `;
      messagesContainer.appendChild(whatsappCard);
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
        const replyLower = data.reply.toLowerCase();
        const userMsgLower = message.toLowerCase();
        const shouldShowPhone = replyLower.includes('call us') ||
                               replyLower.includes('phone') ||
                               replyLower.includes('immediate assistance') ||
                               replyLower.includes('415') ||
                               replyLower.includes('whatsapp') ||
                               userMsgLower.includes('call') ||
                               userMsgLower.includes('phone') ||
                               userMsgLower.includes('contact') ||
                               userMsgLower.includes('whatsapp');

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

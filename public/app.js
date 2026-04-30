document.addEventListener("DOMContentLoaded", () => {
  // ── Tab Navigation ────────────────────────────────────────
  const tabs = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".tab-panel");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-tab");
      
      // Update UI
      tabs.forEach(t => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
        t.setAttribute("tabindex", "-1");
      });
      panels.forEach(p => p.classList.remove("active"));
      
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      tab.setAttribute("tabindex", "0");
      document.getElementById(`panel-${target}`).classList.add("active");
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // ── Keyboard Navigation for Tabs (Accessibility) ──────────
  const tabNav = document.getElementById("tab-nav");
  tabNav.addEventListener("keydown", (e) => {
    const tabList = Array.from(tabs);
    const currentIndex = tabList.indexOf(document.activeElement);
    if (currentIndex === -1) return;
    
    let newIndex;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      newIndex = (currentIndex + 1) % tabList.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      newIndex = (currentIndex - 1 + tabList.length) % tabList.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      newIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      newIndex = tabList.length - 1;
    } else {
      return;
    }
    
    tabList[newIndex].focus();
    tabList[newIndex].click();
  });

  // ── Chat Logic ────────────────────────────────────────────
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const chatMessages = document.getElementById("chat-messages");
  const suggestionChips = document.querySelectorAll(".suggestion-chip");
  let sessionId = null;

  async function sendMessage(text) {
    if (!text.trim()) return;

    // Add user message to UI
    appendMessage("user", text);
    chatInput.value = "";
    
    // Typing indicator
    const typingId = appendTypingIndicator();
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId })
      });

      const data = await response.json();
      
      // Remove typing indicator and add bot response
      document.getElementById(typingId).remove();
      
      if (data.reply) {
        appendMessage("bot", data.reply);
        if (data.sessionId) sessionId = data.sessionId;
      } else {
        appendMessage("bot", "I'm sorry, I'm having trouble connecting right now. Please try again.");
      }
    } catch (error) {
      document.getElementById(typingId).remove();
      appendMessage("bot", "Network error. Please check if the server is running.");
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function appendMessage(role, text) {
    const div = document.createElement("div");
    div.className = `message ${role}-message animate-in`;
    
    // Parse markdown-ish bold and lists
    const formattedText = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>")
      .replace(/• (.*?)<br>/g, "<li>$1</li>")
      .replace(/- (.*?)<br>/g, "<li>$1</li>");

    div.innerHTML = `
      <div class="message-avatar">${role === "bot" ? "🗳️" : "👤"}</div>
      <div class="message-bubble">${formattedText}</div>
    `;
    
    chatMessages.appendChild(div);
  }

  function appendTypingIndicator() {
    const id = "typing-" + Date.now();
    const div = document.createElement("div");
    div.id = id;
    div.className = "message bot-message";
    div.innerHTML = `
      <div class="message-avatar">🗳️</div>
      <div class="message-bubble">
        <div class="typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    chatMessages.appendChild(div);
    return id;
  }

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    sendMessage(chatInput.value);
  });

  suggestionChips.forEach(chip => {
    chip.addEventListener("click", () => {
      sendMessage(chip.getAttribute("data-msg"));
    });
  });

  // ── Quiz Logic ────────────────────────────────────────────
  let currentQuiz = [];
  let currentQuestionIndex = 0;
  let score = 0;

  const quizStart = document.getElementById("quiz-start");
  const quizLoading = document.getElementById("quiz-loading");
  const quizQuestionArea = document.getElementById("quiz-question-area");
  const quizResults = document.getElementById("quiz-results");
  const quizStartBtn = document.getElementById("quiz-start-btn");
  const quizNextBtn = document.getElementById("quiz-next-btn");
  const quizRetryBtn = document.getElementById("quiz-retry-btn");

  const quizQuestionText = document.getElementById("quiz-question-text");
  const quizOptionsList = document.getElementById("quiz-options-list");
  const quizExplanation = document.getElementById("quiz-explanation");
  const quizCounter = document.getElementById("quiz-counter");
  const quizProgressFill = document.getElementById("quiz-progress-fill");

  async function startQuiz() {
    quizStart.classList.add("hidden");
    quizLoading.classList.remove("hidden");

    const difficulty = document.querySelector("#difficulty-pills .pill.active").getAttribute("data-value");
    const topic = document.querySelector("#topic-pills .pill.active").getAttribute("data-value");

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty, topic })
      });
      const data = await response.json();
      currentQuiz = data.questions || [];
      
      if (currentQuiz.length > 0) {
        currentQuestionIndex = 0;
        score = 0;
        showQuestion();
      }
    } catch (error) {
      alert("Failed to load quiz. Please try again.");
      quizStart.classList.remove("hidden");
    } finally {
      quizLoading.classList.add("hidden");
    }
  }

  function showQuestion() {
    const q = currentQuiz[currentQuestionIndex];
    quizQuestionText.textContent = q.question;
    quizOptionsList.innerHTML = "";
    quizExplanation.classList.add("hidden");
    quizNextBtn.classList.add("hidden");
    
    // Update progress
    const progress = ((currentQuestionIndex + 1) / currentQuiz.length) * 100;
    quizProgressFill.style.width = `${progress}%`;
    quizCounter.textContent = `${currentQuestionIndex + 1} / ${currentQuiz.length}`;

    q.options.forEach((opt, idx) => {
      const btn = document.createElement("button");
      btn.className = "quiz-opt-btn";
      btn.textContent = opt;
      btn.addEventListener("click", () => handleAnswer(idx, btn));
      quizOptionsList.appendChild(btn);
    });

    quizQuestionArea.classList.remove("hidden");
    quizResults.classList.add("hidden");
  }

  function handleAnswer(selectedIndex, btn) {
    const q = currentQuiz[currentQuestionIndex];
    const options = quizOptionsList.querySelectorAll(".quiz-opt-btn");
    
    // Disable all buttons
    options.forEach(b => b.disabled = true);

    if (selectedIndex === q.correct) {
      btn.classList.add("correct");
      score++;
    } else {
      btn.classList.add("wrong");
      options[q.correct].classList.add("correct");
    }

    quizExplanation.textContent = q.explanation;
    quizExplanation.classList.remove("hidden");
    quizNextBtn.classList.remove("hidden");
  }

  quizNextBtn.addEventListener("click", () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuiz.length) {
      showQuestion();
    } else {
      showResults();
    }
  });

  function showResults() {
    quizQuestionArea.classList.add("hidden");
    quizResults.classList.remove("hidden");
    
    document.getElementById("score-text").textContent = `${score} / ${currentQuiz.length}`;
    
    // Score circle animation
    const circle = document.getElementById("score-fill");
    const pct = score / currentQuiz.length;
    const offset = 339.29 * (1 - pct);
    circle.style.strokeDashoffset = offset;

    const resultsTitle = document.getElementById("results-title");
    const resultsMsg = document.getElementById("results-message");

    if (score === currentQuiz.length) {
      resultsTitle.textContent = "Constitutional Expert! 🏆";
      resultsMsg.textContent = "Perfect score! You truly understand the democratic process.";
    } else if (score >= 3) {
      resultsTitle.textContent = "Great Job! 👏";
      resultsMsg.textContent = "You have a solid understanding of how elections work.";
    } else {
      resultsTitle.textContent = "Keep Learning! 📚";
      resultsMsg.textContent = "Don't worry! Democracy is a journey. Keep exploring the guide!";
    }
  }

  // Pill selectors
  document.querySelectorAll(".pill").forEach(pill => {
    pill.addEventListener("click", () => {
      const group = pill.parentElement;
      group.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
    });
  });

  quizStartBtn.addEventListener("click", startQuiz);
  quizRetryBtn.addEventListener("click", () => quizStart.classList.remove("hidden"));

  // ── Flashcard Logic ───────────────────────────────────────
  const flashcardGrid = document.getElementById("flashcard-grid");
  const flashcardLoading = document.getElementById("flashcard-loading");
  const loadFlashcardsBtn = document.getElementById("load-flashcards-btn");

  async function loadFlashcards() {
    flashcardGrid.innerHTML = "";
    flashcardLoading.classList.remove("hidden");

    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "general" })
      });
      const data = await response.json();
      
      if (data.flashcards) {
        data.flashcards.forEach(card => {
          const cardEl = createFlashcard(card);
          flashcardGrid.appendChild(cardEl);
        });
      }
    } catch (error) {
      console.error("Flashcards load error:", error);
    } finally {
      flashcardLoading.classList.add("hidden");
    }
  }

  function createFlashcard(data) {
    const card = document.createElement("div");
    card.className = "flashcard";
    card.innerHTML = `
      <div class="flashcard-inner">
        <div class="flashcard-front">
          <div class="card-emoji">${data.emoji || "🗳️"}</div>
          <h3>${data.term}</h3>
          <div class="card-category">${data.category || "Term"}</div>
        </div>
        <div class="flashcard-back">
          <p>${data.definition}</p>
        </div>
      </div>
    `;
    
    card.addEventListener("click", () => {
      card.classList.toggle("flipped");
    });
    
    return card;
  }

  loadFlashcardsBtn.addEventListener("click", loadFlashcards);
  
  // Initial flashcard load when tab clicked
  document.getElementById("tab-flashcards").addEventListener("click", () => {
    if (flashcardGrid.children.length === 0) loadFlashcards();
  });

  // ── Particle Background ──────────────────────────────────
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  document.getElementById("particles").appendChild(canvas);

  let particles = [];
  function initParticles() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.5 - 0.25,
        opacity: Math.random() * 0.5
      });
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(animateParticles);
  }

  window.addEventListener("resize", initParticles);
  initParticles();
  animateParticles();
});

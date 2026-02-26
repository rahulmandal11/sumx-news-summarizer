let isProcessing = false;

const articleText = document.getElementById('articleText');
const summarizeBtn = document.getElementById('summarizeBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const summaryCard = document.getElementById('summaryCard');
const summaryText = document.getElementById('summaryText');
const errorAlert = document.getElementById('errorAlert');
const errorMessage = document.getElementById('errorMessage');
const wordCount = document.getElementById('wordCount');
const loadDemo = document.getElementById('loadDemo');
const statsRow = document.getElementById('statsRow');
const referenceCard = document.getElementById('referenceCard');
const referenceText = document.getElementById('referenceText');
const charCount = document.getElementById('charCount');
const demoPlaceholder = document.getElementById('demo-placeholder');

// Update word count live
if (articleText) {
  articleText.addEventListener('input', updateWordCount);
}

function updateWordCount() {
  const text = articleText.value;
  const currLength = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).filter(w => w.length).length : 0;
  
  if (wordCount) wordCount.textContent = words + ' words';
  if (charCount) charCount.textContent = currLength + ' characters';
}

// Summarize button
if (summarizeBtn) {
  summarizeBtn.addEventListener('click', summarizeArticle);
}

async function summarizeArticle() {
  if (isProcessing) return;

  const text = articleText.value.trim();
  if (!text) {
    showError('Please paste an article first!');
    return;
  }

  resetUI();
  isProcessing = true;
  summarizeBtn.disabled = true;
  summarizeBtn.innerHTML = '<span class="position-relative z-1 d-flex align-items-center justify-content-center fw-bold text-uppercase tracking-wide"><i class="fas fa-spinner fa-spin me-2"></i>Processing...</span>';
  loadingSpinner.classList.remove('d-none');

  try {
    const response = await fetch('/summarize', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({text})
    });

    const data = await response.json();

    if (data.summary) {
      summaryText.textContent = data.summary;
      summaryCard.classList.remove('d-none');
      summaryCard.classList.add('d-flex');

      // Update stats
      if (data.stats) {
        document.getElementById('inputWords').textContent = data.stats.input_words;
        document.getElementById('summaryWords').textContent = data.stats.summary_words;
        document.getElementById('compressionRate').textContent = data.stats.compression_rate;
        statsRow.classList.remove('d-none');
      }
    } else {
      showError(data.error || 'Summarization failed');
    }
  } catch (error) {
    showError('Network error: ' + error.message);
  } finally {
    isProcessing = false;
    summarizeBtn.disabled = false;
    summarizeBtn.innerHTML = '<span class="position-relative z-1 d-flex align-items-center justify-content-center fw-bold text-uppercase tracking-wide">Initialize Summarization <i class="fas fa-bolt ms-2 text-warning"></i></span>';
    loadingSpinner.classList.add('d-none');
  }
}

// Load demo
if (loadDemo) {
  loadDemo.addEventListener('click', loadDemoArticle);
}

async function loadDemoArticle() {
  resetUI();
  loadDemo.disabled = true;
  loadDemo.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Loading...';

  try {
    const response = await fetch('/demo');
    const data = await response.json();

    if (data.document) {
      articleText.value = data.document;
      updateWordCount();

      if (data.reference_summary) {
        referenceText.textContent = data.reference_summary;
        referenceCard.classList.remove('d-none');
      }
    } else {
      showError(data.error || 'Failed to load demo');
    }
  } catch (error) {
    showError('Network error: ' + error.message);
  } finally {
    loadDemo.disabled = false;
    loadDemo.innerHTML = '<i class="fas fa-magic text-primary me-2"></i> Load Article';
  }
}

// Utility functions
function resetUI() {
  if (summaryCard) {
    summaryCard.classList.add('d-none');
    summaryCard.classList.remove('d-flex');
  }
  if (statsRow) statsRow.classList.add('d-none');
  if (referenceCard) referenceCard.classList.add('d-none');
  if (errorAlert) errorAlert.classList.add('d-none');
  if (demoPlaceholder) {
    demoPlaceholder.classList.add('d-none');
    demoPlaceholder.classList.remove('is-visible');
  }
}

function showError(message) {
  if (errorMessage && errorAlert) {
    errorMessage.textContent = message;
    errorAlert.classList.remove('d-none');
    setTimeout(() => errorAlert.classList.add('d-none'), 5000);
  }
}

window.copySummary = function() {
  if (!summaryText) return;
  navigator.clipboard.writeText(summaryText.textContent);
  
  const btn = document.getElementById('copyBtn') || event.currentTarget;
  const original = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-check me-1"></i> Copied!';
  btn.classList.add('btn-success', 'text-white');
  btn.classList.remove('btn-outline-pill', 'bg-white', 'text-primary');
  
  setTimeout(() => {
    btn.innerHTML = original;
    btn.classList.remove('btn-success', 'text-white');
    btn.classList.add('btn-outline-pill', 'bg-white');
  }, 2000);
}

window.clearAll = function() {
  if (articleText) articleText.value = '';
  updateWordCount();
  resetUI();
  if (demoPlaceholder) {
    demoPlaceholder.classList.remove('d-none');
    // small timeout to allow display block to apply before adding opacity class
    setTimeout(() => demoPlaceholder.classList.add('is-visible'), 50);
  }
}

// Simulated API Status Check for Footer and Flow Card
function checkSystemStatus() {
  // Finds all "Systems Operational" spans
  const statusIndicators = document.querySelectorAll('.text-success.fw-bold.small');
  if (!statusIndicators.length) return;
  
  // Simulate checking an endpoint (could be fetch('/api/health'))
  setTimeout(() => {
     const isOnline = true; // Toggle this to false to see the offline state
     
     statusIndicators.forEach(indicator => {
         if (isOnline) {
             indicator.innerHTML = '<span class="d-inline-block bg-success rounded-circle me-2" style="width: 6px; height: 6px; box-shadow: 0 0 6px var(--success);"></span> Systems Operational';
         } else {
             indicator.innerHTML = '<span class="d-inline-block bg-danger rounded-circle me-2" style="width: 6px; height: 6px; box-shadow: 0 0 6px #dc3545;"></span> Systems Offline';
             indicator.classList.remove('text-success');
             indicator.classList.add('text-danger');
         }
     });
  }, 1000);
}

// ==========================================
// Initializations & Event Listeners
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // --- Scroll Reveal Animations ---
  const faders = document.querySelectorAll('.fade-in-section, .fade-in');
  
  const appearOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const appearOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        return;
      } else {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, appearOptions);

  faders.forEach(fader => {
    appearOnScroll.observe(fader);
  });

  // --- Navbar Scroll Effect ---
  const navbar = document.getElementById('mainNavbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled', 'py-2');
        navbar.classList.remove('py-3');
      } else {
        navbar.classList.remove('scrolled', 'py-2');
        navbar.classList.add('py-3');
      }
    });
  }

  // --- Initialize the fake system status ping ---
  checkSystemStatus();
});
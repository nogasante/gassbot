/**
 * Resource Request Modal Bottom Sheet Component
 * iOS / Telegram native ergonomics with grab handle and accessible form controls
 */
const RequestModal = (() => {
  function init() {
    const modalHtml = `
      <div class="modal-overlay" id="request-modal-overlay" onclick="RequestModal.handleOverlayClick(event)">
        <div class="modal-sheet">
          <div class="modal-grab-bar"></div>
          <div class="modal-header">
            <h3 class="modal-title">Request Academic Material</h3>
            <button class="modal-close" onclick="RequestModal.close()" aria-label="Close modal">✕</button>
          </div>
          <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 18px; line-height: 1.4;">
            Notify the GASS Academic Committee to source, verify, and upload your missing slides or past exams.
          </p>

          <form id="resource-request-form" onsubmit="RequestModal.handleSubmit(event)">
            <div class="form-group">
              <label class="form-label" for="req-course-code">Course Code or Subject</label>
              <input type="text" id="req-course-code" class="form-input" placeholder="e.g. STAT 266 or Python" autocomplete="off" />
            </div>

            <div class="form-group">
              <label class="form-label" for="req-topic-title">Document Title / Topic *</label>
              <input type="text" id="req-topic-title" class="form-input" placeholder="e.g. 2023 End of Semester Past Questions" required autocomplete="off" />
            </div>

            <div class="form-group">
              <label class="form-label" for="req-details">Additional Details (Optional)</label>
              <textarea id="req-details" class="form-textarea" placeholder="Include lecturer name, semester, or specific topic area..."></textarea>
            </div>

            <button type="submit" class="btn-primary" id="req-submit-btn" style="width: 100%; justify-content: center; padding: 13px; font-size: 14px; margin-top: 8px;">
              Submit Request to Executives
            </button>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  function open(defaults = {}) {
    TelegramBridge.haptic('medium');
    const overlay = document.getElementById('request-modal-overlay');
    if (!overlay) return;

    const courseInput = document.getElementById('req-course-code');
    const topicInput = document.getElementById('req-topic-title');
    const detailsInput = document.getElementById('req-details');

    if (courseInput) courseInput.value = defaults.courseCode || '';
    if (topicInput) topicInput.value = defaults.topicTitle || '';
    if (detailsInput) detailsInput.value = defaults.details || '';

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    TelegramBridge.haptic('light');
    const overlay = document.getElementById('request-modal-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  function handleOverlayClick(event) {
    if (event.target.id === 'request-modal-overlay') {
      close();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const submitBtn = document.getElementById('req-submit-btn');
    const courseCode = document.getElementById('req-course-code').value.trim();
    const topicTitle = document.getElementById('req-topic-title').value.trim();
    const details = document.getElementById('req-details').value.trim();
    const user = TelegramBridge.getUser();

    if (!topicTitle) return;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting Request...';
    }

    try {
      await API.submitRequest({
        courseCode: courseCode || 'General',
        topicTitle,
        details: details || `Requested material for ${courseCode || 'general topic'}: ${topicTitle}`,
        userId: user.id
      });

      TelegramBridge.haptic('success');
      close();
      TelegramBridge.showToast('Request submitted! Queued for academic review.', 'success');
    } catch (err) {
      TelegramBridge.haptic('error');
      alert(`Could not submit request: ${err.message}`);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Request to Executives';
      }
    }
  }

  return {
    init,
    open,
    close,
    handleOverlayClick,
    handleSubmit
  };
})();

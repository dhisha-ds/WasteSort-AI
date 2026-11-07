/**
 * WasteSort AI — Waste Classification JavaScript
 * Implements drag-and-drop file upload, instant image preview,
 * file validation, removal, and ML model readiness messaging.
 */

document.addEventListener('DOMContentLoaded', function () {
  const dropZone = document.getElementById('wsDropZone');
  const fileInput = document.getElementById('wsFileInput');
  const uploadPrompt = document.getElementById('wsUploadPrompt');
  const previewContainer = document.getElementById('wsPreviewContainer');
  const previewImage = document.getElementById('wsPreviewImage');
  const fileNameDisplay = document.getElementById('wsFileName');
  const fileSizeDisplay = document.getElementById('wsFileSize');
  const removeBtn = document.getElementById('wsRemoveBtn');
  const classifyBtn = document.getElementById('wsClassifyBtn');
  const statusBanner = document.getElementById('wsStatusBanner');
  const resultsContainer = document.getElementById('wsResultsContainer');

  let selectedFile = null;

  if (!dropZone || !fileInput) return;

  // Click to select file
  dropZone.addEventListener('click', function (e) {
    if (e.target !== removeBtn && !previewContainer.contains(e.target)) {
      fileInput.click();
    }
  });

  // Drag and drop events
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, function (e) {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('drag-over');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, function (e) {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('drag-over');
    });
  });

  // Handle dropped file
  dropZone.addEventListener('drop', function (e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  });

  // Handle file input change
  fileInput.addEventListener('change', function () {
    if (this.files.length > 0) {
      handleFile(this.files[0]);
    }
  });

  // Process chosen file
  function handleFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    selectedFile = file;

    // Display image preview
    const reader = new FileReader();
    reader.onload = function (e) {
      previewImage.src = e.target.result;
      fileNameDisplay.textContent = file.name;
      fileSizeDisplay.textContent = formatBytes(file.size);

      uploadPrompt.style.display = 'none';
      previewContainer.style.display = 'flex';
      classifyBtn.disabled = false;

      // Hide previous results/banners on new file
      if (statusBanner) statusBanner.style.display = 'none';
      if (resultsContainer) resultsContainer.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }

  // Remove file handler
  if (removeBtn) {
    removeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      resetUpload();
    });
  }

  function resetUpload() {
    selectedFile = null;
    fileInput.value = '';
    previewImage.src = '';
    uploadPrompt.style.display = 'flex';
    previewContainer.style.display = 'none';
    classifyBtn.disabled = true;
    if (statusBanner) statusBanner.style.display = 'none';
    if (resultsContainer) resultsContainer.style.display = 'none';
  }

  // Classify waste click
  if (classifyBtn) {
    classifyBtn.addEventListener('click', function () {
      if (!selectedFile) return;

      // Show friendly loading state
      const originalText = classifyBtn.innerHTML;
      classifyBtn.disabled = true;
      classifyBtn.innerHTML = `
        <svg class="ws-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
        </svg>
        Analyzing Image...
      `;

      setTimeout(function () {
        classifyBtn.disabled = false;
        classifyBtn.innerHTML = originalText;

        // Display truthful message per user requirements:
        // "Until the real ML model is integrated, display 'AI classification is not connected yet' instead of inventing predictions."
        if (statusBanner) {
          statusBanner.style.display = 'flex';
          statusBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 700);
    });
  }

  function formatBytes(bytes, decimals = 1) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
});

const supportForm = document.getElementById('support-form');

const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const subjectInput = document.getElementById('subject');
const messageInput = document.getElementById('message');

const nameError = document.getElementById('name-error');
const emailError = document.getElementById('email-error');
const subjectError = document.getElementById('subject-error');
const messageError = document.getElementById('message-error');

const formSuccess = document.getElementById('form-success');

// Simple email regex for validation
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Clear all error and success messages
function clearMessages() {
  nameError.textContent = '';
  emailError.textContent = '';
  subjectError.textContent = '';
  messageError.textContent = '';
  formSuccess.textContent = '';
}

supportForm.addEventListener('submit', (e) => {
  e.preventDefault();
  clearMessages();

  let valid = true;

  if (!nameInput.value.trim()) {
    nameError.textContent = 'Name is required.';
    valid = false;
  }
  if (!emailInput.value.trim()) {
    emailError.textContent = 'Email is required.';
    valid = false;
  } else if (!isValidEmail(emailInput.value.trim())) {
    emailError.textContent = 'Please enter a valid email.';
    valid = false;
  }
  if (!subjectInput.value.trim()) {
    subjectError.textContent = 'Subject is required.';
    valid = false;
  }
  if (!messageInput.value.trim()) {
    messageError.textContent = 'Message is required.';
    valid = false;
  }

  if (!valid) return;

  // Simulate sending message
  formSuccess.textContent = 'Your message has been sent! We will get back to you shortly.';
  supportForm.reset();
});

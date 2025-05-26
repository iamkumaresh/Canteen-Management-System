const loginForm = document.getElementById('login-form');
const roleSelect = document.getElementById('role');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePasswordCheckbox = document.getElementById('toggle-password');
const roleError = document.getElementById('role-error');
const emailError = document.getElementById('email-error');
const passwordError = document.getElementById('password-error');

togglePasswordCheckbox.addEventListener('change', () => {
  passwordInput.type = togglePasswordCheckbox.checked ? 'text' : 'password';
});

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  let valid = true;

  roleError.textContent = '';
  emailError.textContent = '';
  passwordError.textContent = '';

  if (!roleSelect.value) {
    roleError.textContent = 'Please select a login role.';
    valid = false;
  }
  if (!emailInput.value.trim()) {
    emailError.textContent = 'Email is required.';
    valid = false;
  } else if (!validateEmail(emailInput.value.trim())) {
    emailError.textContent = 'Please enter a valid email.';
    valid = false;
  }
  if (!passwordInput.value.trim()) {
    passwordError.textContent = 'Password is required.';
    valid = false;
  }

  if (!valid) {
    return;
  }

  // Simulate login processing and redirection
  const selectedRole = roleSelect.value;
  if (selectedRole === 'Admin') {
    window.location.href = 'admin.html';
  } else if (selectedRole === 'Customer') {
    window.location.href = 'customer.html';
  } else {
    alert('Invalid role selected.');
  }
});

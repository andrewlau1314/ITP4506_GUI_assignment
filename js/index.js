$(document).ready(function () {
  //Switch Role Animation
  $("#role").change(function () {
    if ($(this).val() === "sales") {
      $("#staff-field").slideDown(300);
      $("#staff-id").focus();
    } else {
      $("#staff-field").slideUp(300);
      $("#staff-id").val("");
    }
  });

  //Register
  $("#register-form").submit(async function (e) {
    e.preventDefault();
    $(".error-msg").hide();

    // Cached selectors to avoid duplicated jQuery selector warnings
    const $name = $("#name");
    const $phone = $("#phone");
    const $email = $("#email");
    const $password = $("#password");
    const $confirm = $("#confirm-password");
    const $role = $("#role");
    const $staffId = $("#staff-id");
    const $terms = $("#terms");

    let valid = true;
    const name = $name.val().trim();
    const phone = $phone.val().trim();
    const email = $email.val().trim();
    const password = $password.val();
    const confirmPassword = $confirm.val();
    const role = $role.val();
    const staffId = role === "sales" ? $staffId.val().trim() : null;

    if (!$terms.is(":checked")) {
      $terms.siblings(".error-msg").show();
      $terms.focus();
      valid = false;
    }

    if (confirmPassword !== password) {
      $confirm.siblings(".error-msg").show();
      $confirm.focus();
      valid = false;
    }
    if (password.length < 8) {
      $password.siblings(".error-msg").show();
      $password.focus();
      valid = false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      $email.siblings(".error-msg").show();
      $email.focus();
      valid = false;
    }

    if (!/^\d{8}$/.test(phone)) {
      $phone.siblings(".error-msg").show();
      $phone.focus();
      valid = false;
    }

    if (!name) {
      $name.siblings(".error-msg").show();
      $name.focus();
      valid = false;
    }

    if (role === "sales" && !staffId) {
      $staffId.siblings(".error-msg").show();
      $staffId.focus();
      valid = false;
    }

    if (!valid) return;

    let localUsers = JSON.parse(localStorage.getItem("users") || "[]");
    let jsonUsers = [];

    try {
      const response = await fetch("../data/users.json");
      if (response.ok) {
        jsonUsers = await response.json();
      } else {
        console.warn("Error: Cant load users.json");
      }
    } catch (err) {
      console.error("Error: Fail to load users.json:", err);
    }

    if (localUsers.length === 0 && jsonUsers.length > 0) {
      localUsers = [...jsonUsers];
      localStorage.setItem("users", JSON.stringify(localUsers));
    }

    const allUsers = [...jsonUsers, ...localUsers];

    const allEmails = allUsers.map((u) => u.email);
    const allPhones = allUsers.map((u) => u.phone);
    const allStaffIds = allUsers.filter((u) => u.staffId).map((u) => u.staffId);

    if (allEmails.includes(email)) {
      alert("This email address is already registered!");
      $email.focus();
      return;
    }

    if (allPhones.includes(phone)) {
      alert("This phone is already registered!");
      $phone.focus();
      return;
    }

    if (role === "sales" && allStaffIds.includes(staffId)) {
      alert("This Staff ID is already registered!");
      $staffId.focus();
      return;
    }

    const newUser = {
      role,
      name,
      phone,
      email,
      password,
      ...(role === "sales" && { staffId }),
    };

    localUsers.push(newUser);
    localStorage.setItem("users", JSON.stringify(localUsers));

    alert("Registration successful! Please log in.");
    window.location.href = "login.html";
  });

  //Login
  $("#login-form").submit(async function (e) {
    e.preventDefault();

    let valid = true;
    const $loginEmail = $("#login-email");
    const $loginPassword = $("#login-password");
    const inputEmail = $loginEmail.val().trim();
    const inputPassword = $loginPassword.val();

    if (!inputEmail || !/\S+@\S+\.\S+/.test(inputEmail)) {
      $loginEmail.siblings(".error-msg").show();;
      $loginEmail.focus();
      valid = false;
    }
    
    if (!inputPassword) {
      $loginPassword.siblings(".error-msg").show();
      $loginPassword.focus();
      valid = false;
    }

    if (!valid) return;

    let localUsers = JSON.parse(localStorage.getItem("users") || "[]");
    let jsonUsers = [];

    try {
      const response = await fetch("../data/users.json");
      if (response.ok) {
        jsonUsers = await response.json();
      }
    } catch (err) {
      console.error("Error: Fail to load users.json:", err);
    }

    if (localUsers.length === 0 && jsonUsers.length > 0) {
      localUsers = [...jsonUsers];
      localStorage.setItem("users", JSON.stringify(localUsers));
    }

    const allUsers = [...jsonUsers, ...localUsers];

    const user = allUsers.find(
      (u) => u.email === inputEmail && (u.password === inputPassword || u.pass === inputPassword)
    );

    if (user) {
      alert(`Welcome! ${user.name}`);
      // normalize currentUser and store via setCurrentUser
      setCurrentUser(user);
      if (user.role === "sales") {
        window.location.href = "../staff/dashboard.html";
      } else {
        window.location.href = "../customer/dashboard.html";
      }
      return;
    }

    alert("Email or password worng!");
    $loginPassword.val("").focus();
  });

  //Set Current User
  function loginSuccess(user) {
    // kept for compatibility with older code that may call loginSuccess
    setCurrentUser(user);
    if (user.role === "sales") {
      window.location.href = "../staff/dashboard.html";
    } else {
      window.location.href = "../customer/dashboard.html";
    }
  }
});

// Authentication helpers: add login(), logout(), getCurrentUser(), etc.

function normalizeType(t) {
  if (!t) return null;
  t = String(t).toLowerCase();
  if (t === 'sales' || t === 'staff') return 'Staff';
  if (t === 'customer' || t === 'user') return 'Customer';
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function getLocalUsers() {
  try {
    return JSON.parse(localStorage.getItem('users') || '[]');
  } catch (e) {
    return [];
  }
}

function findUserByCredentials(email, password) {
  if (!email || !password) return null;
  var local = getLocalUsers();
  var u = local.find(function (x) { return x.email === email && (x.password === password || x.pass === password || x.password === password); });
  return u || null;
}

function setCurrentUser(user) {
  if (!user) { localStorage.removeItem('currentUser'); return; }
  var cu = Object.assign({}, user);
  // normalize type
  cu.type = normalizeType(cu.type || cu.role);
  localStorage.setItem('currentUser', JSON.stringify(cu));
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
  } catch (e) {
    return null;
  }
}

function login() {
  // supports both common/login.html (#login-email/#login-password) and legacy (#email/#pass)
  var emailEl = document.getElementById('login-email') || document.getElementById('email');
  var passEl = document.getElementById('login-password') || document.getElementById('pass');
  if (!emailEl || !passEl) { alert('Login form not found'); return; }
  var email = (emailEl.value || '').trim();
  var password = passEl.value || '';
  if (!email || !/\S+@\S+\.\S+/.test(email)) { alert('Please enter a valid email'); return; }
  if (!password) { alert('Please enter password'); return; }

  var user = findUserByCredentials(email, password);
  if (!user) {
    alert('Email or password wrong!');
    try { passEl.value = ''; passEl.focus(); } catch (e) {}
    return;
  }

  setCurrentUser(user);
  alert('Welcome, ' + (user.name || user.email) + '!');
  var type = normalizeType(user.type || user.role);
  if (type === 'Customer') window.location.href = '../customer/dashboard.html';
  else if (type === 'Staff') window.location.href = '../staff/dashboard.html';
  else window.location.href = '../customer/dashboard.html';
}

function logout() {
  localStorage.removeItem('currentUser');
  // redirect to common login (relative paths work from most pages)
  window.location.href = '../common/login.html';
}

// expose globally for other pages
window.getCurrentUser = getCurrentUser;
window.login = login;
window.logout = logout;


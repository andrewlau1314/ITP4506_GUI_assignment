$(document).ready(function () {
  $(".error-msg").hide();

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

    let valid = true;
    const name = $("#name").val().trim();
    const phone = $("#phone").val().trim();
    const email = $("#email").val().trim();
    const password = $("#password").val();
    const confirmPassword = $("#confirm-password").val();
    const role = $("#role").val();
    const staffId = role === "sales" ? $("#staff-id").val().trim() : null;

    if (!$("#terms").is(":checked")) {
      $("#terms").siblings(".error-msg").show();
      $("#terms").focus();
      valid = false;
    }

    if (confirmPassword !== password) {
      $("#confirm-password").siblings(".error-msg").show();
      $("#confirm-password").focus();
      valid = false;
    }
    if (password.length < 8) {
      $("#password").siblings(".error-msg").show();
      $("#password").focus();
      valid = false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      $("#email").siblings(".error-msg").show();
      $("#email").focus();
      valid = false;
    }

    if (!/^\d{8}$/.test(phone)) {
      $("#phone").siblings(".error-msg").show();
      $("#phone").focus();
      valid = false;
    }

    if (!name) {
      $("#name").siblings(".error-msg").show();
      $("#name").focus();
      valid = false;
    }

    if (role === "sales" && !staffId) {
      $("#staff-id").siblings(".error-msg").show();
      $("#staff-id").focus();
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
      $("#email").focus();
      return;
    }

    if (allPhones.includes(phone)) {
      alert("This phone is already registered!");
      $("#phone").focus();
      return;
    }

    if (role === "sales" && allStaffIds.includes(staffId)) {
      alert("This Staff ID is already registered!");
      $("#staff-id").focus();
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
    const inputEmail = $("#login-email").val().trim();
    const inputPassword = $("#login-password").val();

    if (!inputEmail || !/\S+@\S+\.\S+/.test(inputEmail)) {
      alert("Please enter a valid email!");
      $("#login-email").focus();
      return;
    }

    if (!inputPassword) {
      alert("Please enter password!");
      $("#login-password").focus();
      return;
    }

    let localUsers = JSON.parse(localStorage.getItem("users") || "[]");
    let jsonUsers = [];

    try {
      const response = await fetch("../data/users.json");
      if (response.ok) {
        jsonUsers = await response.json();
      }
    } catch (err) {
      console.error("載入 users.json 失敗:", err);
    }

    if (localUsers.length === 0 && jsonUsers.length > 0) {
      localUsers = [...jsonUsers];
      localStorage.setItem("users", JSON.stringify(localUsers));
    }

    const allUsers = [...jsonUsers, ...localUsers];

    const user = allUsers.find(
      (u) => u.email === inputEmail && u.password === inputPassword
    );

    if (user) {
      alert(`Welcome! ${user.name}`);
      loginSuccess(user);
      return;
    }

    alert("Email or password worng!");
    $("#login-password").val("").focus();
  });

  //Set Current User
  function loginSuccess(user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    if (user.role === "sales") {
      window.location.href = "../staff/dashboard.html";
    } else {
      window.location.href = "../customer/dashboard.html";
    }
  }
});

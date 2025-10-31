$(document).ready(function () {
  $(".error-msg").hide();

  $("#role").change(function () {
    if ($(this).val() === "sales") {
      $("#staff-field").slideDown(300);
      $("#staff-id").focus();
    } else {
      $("#staff-field").slideUp(300);
      $("#staff-id").val("");
    }
  });


  $("#register-form").submit(function (e) {
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

    if (!name) {
      $("#name").siblings(".error-msg").show();
      valid = false;
    }

    if (!/^\d{8}$/.test(phone)) {
      $("#phone").siblings(".error-msg").show();
      valid = false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      $("#email").siblings(".error-msg").show();
      valid = false;
    }

    if (password.length < 8) {
      $("#password").siblings(".error-msg").show();
      valid = false;
    }

    if (confirmPassword !== password) {
      $("#confirm-password").siblings(".error-msg").show();
      valid = false;
    }

    if (!$("#terms").is(":checked")) {
      $("#terms").siblings(".error-msg").show();
      valid = false;
    }

    if (role === "sales" && !staffId) {
      $("#staff-id").siblings(".error-msg").show();
      valid = false;
    }

    if (valid) {
      let localUsers = JSON.parse(localStorage.getItem("users") || "[]");
      let allEmails = localUsers.map(u => u.email);
      let allPhones = localUsers.map(u => u.phone);
      let allStaffIds = localUsers.filter(u => u.staffId).map(u => u.staffId);

      $.ajax({
        url: "USERS.TXT",
        async: false,
        dataType: "text",
        success: function (data) {
          data.trim().split("\n").forEach(line => {
            let parts = line.split("|");
            allEmails.push(parts[1]);
            allPhones.push(parts[4]);
            if (parts[5]) allStaffIds.push(parts[5]);
          });
        }
      });

      if (allEmails.includes(email)) {
        alert("This email address is already registered!");
        return;
      }
      
      if (allPhones.includes(phone)) {
        $("#phone").siblings(".error-msg").text("此電話號碼已註冊").show();
        return;
      }

      if (role === "sales" && allStaffIds.includes(staffId)) {
        $("#staff-id").siblings(".error-msg").text("此員工編號已使用").show();
        return;
      }

      const newUser = { role, name, phone, email, password, staffId };
      localUsers.push(newUser);
      localStorage.setItem("users", JSON.stringify(localUsers));

      alert("Registration successful! Please log in.");
      window.location.href = "login.html";
    }
  });

  $("#login-form").submit(function (e) {
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

    const localUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const localUser = localUsers.find(u => u.email === inputEmail && u.password === inputPassword);

    if (localUser) {
      loginSuccess(localUser);
      return;
    }

    $.get("USERS.TXT", function (data) {
      const lines = data.trim().split("\n");
      for (let line of lines) {
        const parts = line.split("|");
        const [role, email, password, name, phone, staffId] = parts;

        if (email === inputEmail && password === inputPassword) {
          const user = { role, name, email, phone, staffId: staffId || null };
          loginSuccess(user);
          return;
        }
      }
      alert("Email or password worng!");
      $("#login-password").val("").focus();
    }).fail(function () {
      alert("Error: Cant load USERS.TXT");
    });
  });


  function loginSuccess(user) {
    localStorage.setItem("currentUser", JSON.stringify({
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
      staffId: user.staffId
    }));
    alert(`Welcome, ${user.name}!`);
    window.location.href = user.role === "customer" 
      ? "dashboard_customer.html" 
      : "dashboard_sales.html";
  }

});
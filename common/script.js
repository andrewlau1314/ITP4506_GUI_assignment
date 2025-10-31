$(document).ready(function () {
  $(".error-msg").hide();

  $("#role").change(function () {
    if ($(this).val() === "sales") {
      $("#staff-field").slideDown(300);
      $("#staffId").focus();
    } else {
      $("#staff-field").slideUp(300);
      $("#staffId").val("");
    }
  });


  $("#register-form").submit(function (e) {
    e.preventDefault();
    $(".error-msg").hide();
    
    let valid = true;
    const name = $("#name").val().trim();
    const phone = $("#phone").val().trim();
    const email = $("#email").val().trim();
    const pass = $("#pass").val();
    const confirmPassword = $("#confirm-password").val();
    const role = $("#role").val();
    const staffId = role === "sales" ? $("#staffId").val().trim() : null;

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

    if (pass.length < 8) {
      $("#pass").siblings(".error-msg").show();
      valid = false;
    }

    if (confirmPassword !== pass) {
      $("#confirm-password").siblings(".error-msg").show();
      valid = false;
    }

    if (!$("#terms").is(":checked")) {
      $("#terms").siblings(".error-msg").show();
      valid = false;
    }

    if (role === "sales" && !staffId) {
      $("#staffId").siblings(".error-msg").show();
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
        $("#staffId").siblings(".error-msg").text("此員工編號已使用").show();
        return;
      }

      // Store user using auth.js schema: { email, pass, type, name, phone, staffId }
      const newUser = { email, pass, type: role === 'sales' ? 'Staff' : 'Customer', name, phone, staffId };
      localUsers.push(newUser);
      localStorage.setItem("users", JSON.stringify(localUsers));

      alert("Registration successful! Please log in.");
      window.location.href = "login.html";
    }
  });


});
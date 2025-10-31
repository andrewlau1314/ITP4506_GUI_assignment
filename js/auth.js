// USERS.TXT → localStorage on first load
if (!localStorage.getItem('users')) {
    const users = [
        {email:'customer1@email.com', pass:'pass123', type:'Customer', name:'Alice Wong', phone:'91234567'},
        {email:'customer2@email.com', pass:'pass456', type:'Customer', name:'Bob Chan', phone:'98765432'},
        {email:'staff1@smile.com', pass:'staff123', type:'Staff', name:'Sam Lee', staffId:'S001'},
        {email:'staff2@smile.com', pass:'staff456', type:'Staff', name:'Tina Ho', staffId:'S002'}
    ];
    localStorage.setItem('users', JSON.stringify(users));
}

function register() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const pass = document.getElementById('pass').value;
    const type = document.querySelector('input[name="type"]:checked').value;
    const staffId = type === 'Staff' ? document.getElementById('staffId').value : '';

    if (!name || !email || !phone || !pass || (type==='Staff' && !staffId)) {
        alert('All fields required!');
        return;
    }

    let users = JSON.parse(localStorage.getItem('users'));
    if (users.find(u => u.email === email)) {
        alert('Email already exists!');
        return;
    }

    users.push({email, pass, type, name, phone, staffId});
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registered! Please login.');
    window.location.href = 'login.html';
}

function login() {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;

    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.email === email && u.pass === pass);

    if (!user) {
        alert('Invalid email or password');
        return;
    }

    localStorage.setItem('currentUser', JSON.stringify(user));
    if (user.type === 'Customer') {
        window.location.href = '../customer/dashboard.html';
    } else {
        window.location.href = '../staff/dashboard.html';
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '../common/login.html';
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}
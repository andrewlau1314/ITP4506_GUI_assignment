// js/staff.js
function loadQuoteRequests() {
    let quotes = JSON.parse(localStorage.getItem('quotes') || '[]');
    const pending = quotes.filter(q =>
        q.status === 'Submitted' || q.status === 'Pending'
    );

    const tbody = document.getElementById('requests');
    tbody.innerHTML = '';

    if (pending.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#999;">No pending requests</td></tr>';
        return;
    }

    pending.forEach((q, i) => {
        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${q.id}</td>
      <td>${q.customerEmail}</td>
      <td>${q.toy.quantity}</td>
      <td><span class="status-${q.status.toLowerCase()}">${q.status}</span></td>
      <td><a href="view-request.html?id=${q.id}" class="btn btn-primary">View & Quote</a></td>
    `;
        tbody.appendChild(row);

        // Animation
        setTimeout(() => row.classList.add('show'), i * 100);
    });
}

// Auto-run when page loads
document.addEventListener('DOMContentLoaded', () => {
    const user = getCurrentUser();
    if (!user || user.type !== 'Staff') {
        alert('Staff access only');
        window.location.href = '../common/login.html';
    } else {
        loadQuoteRequests();
    }
});
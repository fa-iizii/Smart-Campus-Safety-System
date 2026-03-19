async function handleLogin() {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;

    const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
    });

    const data = await res.json();
    if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('username', u);

        if (data.role === 'security') window.location.href = 'security.html';
        else window.location.href = 'user-portal.html';
    } else {
        alert(data.message || 'Login failed');
    }
}
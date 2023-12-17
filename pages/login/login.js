document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const message = document.getElementById('message');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();

        if (data.email === 'admin@gmail.com') {
          window.location.href = '../admin/admin.html';
        } else {
          window.location.href = `../user/user.html?email=${email}`;
        }
      } else {
        const data = await response.json();
        message.textContent = data.message || 'Ошибка при входе';
      }
    } catch (error) {
      console.error('Ошибка:', error);
      message.textContent = 'Ошибка при отправке запроса';
    }
  });
});

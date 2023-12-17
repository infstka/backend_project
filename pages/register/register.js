document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const message = document.getElementById('message');

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const firstName = document.getElementById('registerFirstName').value;
    const lastName = document.getElementById('registerLastName').value;
    const password = document.getElementById('registerPassword').value;

    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, firstName, lastName, password })
      });

      if (response.ok) {
        message.textContent = 'Регистрация прошла успешно';
        setTimeout(() => {
          window.location.href = '../login/login.html'; 
        }, 2000)
      } else {
        const data = await response.json();
        message.textContent = data.message || 'Ошибка при регистрации';
      }
    } catch (error) {
      console.error('Ошибка:', error);
      message.textContent = 'Ошибка при отправке запроса';
    }
  });
});

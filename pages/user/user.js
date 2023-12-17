document.addEventListener('DOMContentLoaded', () => {
  const updateForm = document.getElementById('updateForm');
  const deleteForm = document.getElementById('deleteForm');
  const generatePDF = document.getElementById('generatePDF');
  const getPDF = document.getElementById('getPDF');
  const message = document.getElementById('message');
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get('email');
    
updateForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  //const new_email = document.getElementById('updateEmail').value; 
  const firstName = document.getElementById('updateFirstName').value;
  const lastName = document.getElementById('updateLastName').value;
  const password = document.getElementById('updatePassword').value; 
  const image = document.getElementById('updateImage').files[0];

  const formData = new FormData();
  //formData.append('email', new_email);
  formData.append('firstName', firstName);
  formData.append('lastName', lastName);
  formData.append('password', password); 
  formData.append('image', image);

  try {
    const response = await fetch(`/users/${email}`, {
      method: 'PUT',
      body: formData
    });

    if (response.ok) {
      message.textContent = 'Информация о пользователе обновлена';
    } else {
      const data = await response.json();
      message.textContent = data.message || 'Ошибка при обновлении пользователя';
    }
  } catch (error) {
    console.error('Ошибка:', error);
    message.textContent = 'Ошибка при отправке запроса';
  }
});

  deleteForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`/users/${email}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        message.textContent = 'Пользователь удален';
        window.location.href = '../start/start.html';
      } else {
        const data = await response.json();
        message.textContent = data.message || 'Ошибка при удалении пользователя';
      }
    } catch (error) {
      console.error('Ошибка:', error);
      message.textContent = 'Ошибка при отправке запроса';
    }
  });

  generatePDF.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        message.textContent = 'PDF успешно создан и сохранен в базе данных';
      } else {
        const data = await response.json();
        message.textContent = data.message || 'Ошибка при генерации PDF';
      }
    } catch (error) {
      console.error('Ошибка:', error);
      message.textContent = 'Ошибка при отправке запроса';
    }
  });

  getPDF.addEventListener('click', async () => {
    try {
      const response = await fetch(`/users/${email}/pdf`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${email}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        const data = await response.json();
        message.textContent = data.message || 'Ошибка при получении PDF';
      }
    } catch (error) {
      console.error('Ошибка:', error);
      message.textContent = 'Ошибка при отправке запроса';
    }
  });
});

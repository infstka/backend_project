document.addEventListener('DOMContentLoaded', () => {
    const getAllUsersButton = document.getElementById('getAllUsers');
    const usersTable = document.getElementById('usersTable');
    const usersBody = document.getElementById('usersBody');

    getAllUsersButton.addEventListener('click', async () => {
        try {
            const response = await fetch('/allusers');
            if (response.ok) {
                const usersData = await response.json();
                displayUsers(usersData);
            } else {
                console.error('Ошибка получения пользователей');
            }
        } catch (error) {
            console.error('Ошибка:', error);
        }
    });

    function displayUsers(users) {
        usersBody.innerHTML = ''; //очистка таблицы

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
        <td>${user.id}</td>
        <td>${user.email}</td>
        <td>${user.firstName}</td>
        <td>${user.lastName}</td>
        <td>${user.image}</td>
        <td>${user.pdf ? `<button onclick="getPDF('${user.email}')">Получить PDF</button>` : `<button onclick="generatePDF('${user.email}')">Создать PDF</button>`}</td>
        <td>
          <button onclick="updateUser('${user.email}')">Обновить</button>
          <button onclick="deleteUser('${user.email}')">Удалить</button>
        </td>
      `;
            usersBody.appendChild(row);
        });
    }

    window.updateUser = async (email) => {
        const confirmed = confirm(`Вы уверены, что хотите обновить пользователя с email: ${email}?`);
        if (confirmed) {
            const newEmail = prompt('Введите новый email:');
            const newFirstName = prompt('Введите новое имя:');
            const newLastName = prompt('Введите новую фамилию:');
            const newPassword = prompt('Введите новый пароль:');

            const requestBody = {};
            if (newEmail !== null) {
                requestBody.email = newEmail;
            }
            if (newFirstName !== null) {
                requestBody.firstName = newFirstName;
            }
            if (newLastName !== null) {
                requestBody.lastName = newLastName;
            }
            if (newPassword !== null) {
                requestBody.password = newPassword;
            }

            try {
                const response = await fetch(`/users/${email}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });
                if (response.ok) {
                    alert('Информация о пользователе успешно обновлена');
                    const newResponse = await fetch('/allusers');
                    if (newResponse.ok) {
                        const usersData = await newResponse.json();
                        displayUsers(usersData);
                    } else {
                        console.error('Ошибка получения пользователей');
                    }
                } else {
                    const data = await response.json();
                    alert(data.message || 'Ошибка при обновлении пользователя');
                }
            } catch (error) {
                console.error('Ошибка:', error);
            }
        }
    };

    window.deleteUser = async (email) => {
        try {
            const response = await fetch(`/users/${email}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                alert('Пользователь удален');
                const newResponse = await fetch('/allusers');
                if (newResponse.ok) {
                    const usersData = await newResponse.json();
                    displayUsers(usersData);
                } else {
                    console.error('Ошибка получения пользователей');
                }
            } else {
                const data = await response.json();
                alert(data.message || 'Ошибка при удалении пользователя');
            }
        } catch (error) {
            console.error('Ошибка:', error);
        }
    };

    window.getPDF = async (email) => {
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
                alert(data.message || 'Ошибка при получении PDF');
            }
        } catch (error) {
            console.error('Ошибка:', error);
        }
    };

    window.generatePDF = async (email) => {
        try {
            const response = await fetch('/generate-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email
                })
            });
            if (response.ok) {
                alert('PDF успешно создан и сохранен в базе данных');
                const newResponse = await fetch('/allusers');
                if (newResponse.ok) {
                    const usersData = await newResponse.json();
                    displayUsers(usersData);
                } else {
                    console.error('Ошибка получения пользователей');
                }
            } else {
                const data = await response.json();
                alert(data.message || 'Ошибка при создании PDF');
            }
        } catch (error) {
            console.error('Ошибка:', error);
        }
    };
});
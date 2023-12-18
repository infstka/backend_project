import * as express from 'express';
import * as bodyParser from 'body-parser';
import { Sequelize, DataTypes } from 'sequelize';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import { Readable } from 'stream';
import { promisify } from 'util';
import * as bcrypt from 'bcryptjs';

const path = require('path');
const multer = require('multer');
const app = express();
app.use(bodyParser.json());

const pagesPath = path.join(__dirname, 'pages');
app.use(express.static(pagesPath));
app.get('/', (req, res) => {
  res.sendFile(path.join(pagesPath, 'start', 'start.html'));
});

//настройки и подключение к MySQL
const sequelize = new Sequelize('backendtask', 'task_user', 'password', {
    host: 'mysql-db',
    dialect: 'mysql',
});

//модель User
const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pdf: {
    type: DataTypes.BLOB('long'),
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING, 
    allowNull: false,
  },
});

//создание таблицы в БД, если ее нет
sequelize.sync({ force: false })
  .then(() => {
    console.log('Таблица User создана или уже существует');
  })
  .catch((err) => {
    console.error('Ошибка при создании или проверке таблицы:', err);
  });

//регистрация
app.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10); //хэширование пароля

    const newUser = await User.create({ email, firstName, lastName, password: hashedPassword });

    res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при регистрации пользователя', error: error.message });
  }
});

//вход
app.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Неверный пароль' });
    }

    //генерация токена доступа или установка сессии 
    //TODO
   
    res.status(200).json({ email: user.email, message: 'Успешный вход' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при входе пользователя', error: error.message });
  }
});

//PDF
app.post('/generate-pdf', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    //нахождение пользователя по email в БД
    const user = await User.findOne({ where: { email } });

    if (user) {
      //генерация PDF
      const doc = new PDFDocument();
      const chunks: any[] = []; //массив для хранения данных PDF в виде бинарного массива
      doc.on('data', (chunk) => {
        chunks.push(chunk);
      });
      doc.on('end', async () => {
        const pdfData = Buffer.concat(chunks); //объединение бинарных данных в PDF

        //сохранение содержимого PDF в базе данных как BLOB
        user.pdf = pdfData;
        await user.save();

        res.status(200).json({ message: 'PDF успешно создан и сохранен в базе данных' });
      });

      doc.text(`First Name: ${user.firstName}`);
      doc.text(`Last Name: ${user.lastName}`);
      // Если у пользователя есть изображение, оно добавляется в документ
      if (user.image) {
        doc.image(user.image, { fit: [250, 250], align: 'center', valign: 'center' });
      }

      doc.end();
    } else {
      res.status(404).json({ message: 'Пользователь не найден' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при создании и сохранении PDF в базе данных', error: error.message });
  }
});

//настройка middleware для загрузки файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'Вы не выбрали файл для загрузки.' });
      return;
    }
    
    const image = req.file.path;
    
    //получение email пользователя из запроса
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (user) {
      user.image = image; //Сохранение пути к изображению в базе данных
      await user.save();
      res.status(200).json({ image });
    } else {
      res.status(404).json({ message: 'Пользователь не найден' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Ошибка загрузки файла.', error: error.message });
  }
});

//CRUD-операции над пользователем
//получение всех пользователей
app.get('/allusers', async (req, res) => {
  try {
    const users = await User.findAll();
    const usersData = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      image: user.image,
      pdf: !!user.pdf
    }));

    res.status(200).json(usersData);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении пользователей', error: error.message });
  }
});


//создание пользователя
app.post('/users', async (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ email, firstName, lastName, password: hashedPassword });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//Получение пользователя по email
app.get('/users/:email', async (req: Request, res: Response) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ where: { email } });
    if (user) {
      const userData = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        password: user.password,
        image: user.image,
        pdf: !!user.pdf 
      };

      res.status(200).json(userData);
    } else {
      res.status(404).json({ message: 'Пользователь не найден' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//обновление пользователя по email
app.put('/users/:email', upload.single('image'), async (req, res) => {
  try {
    const emailParam = req.params.email;
    const { email, firstName, lastName, password } = req.body;

    let image = '';

    if (req.file) {
      image = req.file.path;
    }

    const user = await User.findOne({ where: { email: emailParam } });

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (email) {
      user.email = email;
    }

    if (firstName) {
      user.firstName = firstName;
    }

    if (lastName) {
      user.lastName = lastName;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    if (image !== '') {
      user.image = image;
    }

    await user.save();

    res.status(200).json({ message: 'Информация о пользователе обновлена' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//удаление пользователя по email
app.delete('/users/:email', async (req: Request, res: Response) => {
  try {
    const email = req.params.email;
    const deletedRowCount = await User.destroy({ where: { email } });
    if (deletedRowCount > 0) {
      res.status(200).json({ message: 'Пользователь удален' });
    } else {
      res.status(404).json({ message: 'Пользователь не найден' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/users/:email/pdf', async (req: Request, res: Response) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ where: { email } });

    if (user && user.pdf) {
      // Передача содержимого PDF в ответе
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${user.email}.pdf`);

      // Отправка содержимого PDF как ответ на запрос
      res.send(user.pdf);
    } else {
      res.status(404).json({ message: 'PDF для пользователя не найден' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении PDF', error: error.message });
  }
});

//запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

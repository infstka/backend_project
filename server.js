"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var bodyParser = require("body-parser");
var sequelize_1 = require("sequelize");
var PDFDocument = require("pdfkit");
var bcrypt = require("bcryptjs");
var path = require('path');
var multer = require('multer');
var app = express();
app.use(bodyParser.json());
var pagesPath = path.join(__dirname, 'pages');
app.use(express.static(pagesPath));
//настройки и подключение к MySQL
var sequelize = new sequelize_1.Sequelize('backendtask', 'task_user', '', {
    host: 'mysql-db',
    dialect: 'mysql',
    port: 3307
});
//модель User
var User = sequelize.define('User', {
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    firstName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    image: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    pdf: {
        type: sequelize_1.DataTypes.BLOB('long'),
        allowNull: true,
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
});
//создание таблицы в БД, если ее нет
sequelize.sync({ force: false })
    .then(function () {
    console.log('Таблица User создана или уже существует');
})
    .catch(function (err) {
    console.error('Ошибка при создании или проверке таблицы:', err);
});
//регистрация
app.post('/register', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, firstName, lastName, password, hashedPassword, newUser, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, email = _a.email, firstName = _a.firstName, lastName = _a.lastName, password = _a.password;
                return [4 /*yield*/, bcrypt.hash(password, 10)];
            case 1:
                hashedPassword = _b.sent();
                return [4 /*yield*/, User.create({ email: email, firstName: firstName, lastName: lastName, password: hashedPassword })];
            case 2:
                newUser = _b.sent();
                res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
                return [3 /*break*/, 4];
            case 3:
                error_1 = _b.sent();
                res.status(500).json({ message: 'Ошибка при регистрации пользователя', error: error_1.message });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
//вход
app.post('/login', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, user, passwordMatch, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, email = _a.email, password = _a.password;
                return [4 /*yield*/, User.findOne({ where: { email: email } })];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(404).json({ message: 'Пользователь не найден' })];
                }
                return [4 /*yield*/, bcrypt.compare(password, user.password)];
            case 2:
                passwordMatch = _b.sent();
                if (!passwordMatch) {
                    return [2 /*return*/, res.status(401).json({ message: 'Неверный пароль' })];
                }
                //генерация токена доступа или установка сессии 
                //TODO
                res.status(200).json({ email: user.email, message: 'Успешный вход' });
                return [3 /*break*/, 4];
            case 3:
                error_2 = _b.sent();
                res.status(500).json({ message: 'Ошибка при входе пользователя', error: error_2.message });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
//PDF
app.post('/generate-pdf', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var email, user_1, doc, chunks_1, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                email = req.body.email;
                return [4 /*yield*/, User.findOne({ where: { email: email } })];
            case 1:
                user_1 = _a.sent();
                if (user_1) {
                    doc = new PDFDocument();
                    chunks_1 = [];
                    doc.on('data', function (chunk) {
                        chunks_1.push(chunk);
                    });
                    doc.on('end', function () { return __awaiter(void 0, void 0, void 0, function () {
                        var pdfData;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    pdfData = Buffer.concat(chunks_1);
                                    //сохранение содержимого PDF в базе данных как BLOB
                                    user_1.pdf = pdfData;
                                    return [4 /*yield*/, user_1.save()];
                                case 1:
                                    _a.sent();
                                    res.status(200).json({ message: 'PDF успешно создан и сохранен в базе данных' });
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    doc.text("First Name: ".concat(user_1.firstName));
                    doc.text("Last Name: ".concat(user_1.lastName));
                    // Если у пользователя есть изображение, оно добавляется в документ
                    if (user_1.image) {
                        doc.image(user_1.image, { fit: [250, 250], align: 'center', valign: 'center' });
                    }
                    doc.end();
                }
                else {
                    res.status(404).json({ message: 'Пользователь не найден' });
                }
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                res.status(500).json({ message: 'Ошибка при создании и сохранении PDF в базе данных', error: error_3.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
//настройка middleware для загрузки файлов
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
var upload = multer({ storage: storage });
app.post('/upload', upload.single('image'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var image, email, user, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                if (!req.file) {
                    res.status(400).json({ message: 'Вы не выбрали файл для загрузки.' });
                    return [2 /*return*/];
                }
                image = req.file.path;
                email = req.body.email;
                return [4 /*yield*/, User.findOne({ where: { email: email } })];
            case 1:
                user = _a.sent();
                if (!user) return [3 /*break*/, 3];
                user.image = image; //Сохранение пути к изображению в базе данных
                return [4 /*yield*/, user.save()];
            case 2:
                _a.sent();
                res.status(200).json({ image: image });
                return [3 /*break*/, 4];
            case 3:
                res.status(404).json({ message: 'Пользователь не найден' });
                _a.label = 4;
            case 4: return [3 /*break*/, 6];
            case 5:
                error_4 = _a.sent();
                res.status(500).json({ message: 'Ошибка загрузки файла.', error: error_4.message });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
//CRUD-операции над пользователем
//получение всех пользователей
app.get('/allusers', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var users, usersData, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, User.findAll()];
            case 1:
                users = _a.sent();
                usersData = users.map(function (user) { return ({
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    image: user.image,
                    pdf: !!user.pdf
                }); });
                res.status(200).json(usersData);
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                res.status(500).json({ message: 'Ошибка при получении пользователей', error: error_5.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
//создание пользователя
app.post('/users', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, firstName, lastName, password, hashedPassword, newUser, error_6;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, email = _a.email, firstName = _a.firstName, lastName = _a.lastName, password = _a.password;
                return [4 /*yield*/, bcrypt.hash(password, 10)];
            case 1:
                hashedPassword = _b.sent();
                return [4 /*yield*/, User.create({ email: email, firstName: firstName, lastName: lastName, password: hashedPassword })];
            case 2:
                newUser = _b.sent();
                res.status(201).json(newUser);
                return [3 /*break*/, 4];
            case 3:
                error_6 = _b.sent();
                res.status(400).json({ message: error_6.message });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
//Получение пользователя по email
app.get('/users/:email', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var email, user, userData, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                email = req.params.email;
                return [4 /*yield*/, User.findOne({ where: { email: email } })];
            case 1:
                user = _a.sent();
                if (user) {
                    userData = {
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        password: user.password,
                        image: user.image,
                        pdf: !!user.pdf
                    };
                    res.status(200).json(userData);
                }
                else {
                    res.status(404).json({ message: 'Пользователь не найден' });
                }
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                res.status(400).json({ message: error_7.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
//обновление пользователя по email
app.put('/users/:email', upload.single('image'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var emailParam, _a, email, firstName, lastName, password, image, user, hashedPassword, error_8;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                emailParam = req.params.email;
                _a = req.body, email = _a.email, firstName = _a.firstName, lastName = _a.lastName, password = _a.password;
                image = '';
                if (req.file) {
                    image = req.file.path;
                }
                return [4 /*yield*/, User.findOne({ where: { email: emailParam } })];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(404).json({ message: 'Пользователь не найден' })];
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
                if (!password) return [3 /*break*/, 3];
                return [4 /*yield*/, bcrypt.hash(password, 10)];
            case 2:
                hashedPassword = _b.sent();
                user.password = hashedPassword;
                _b.label = 3;
            case 3:
                if (image !== '') {
                    user.image = image;
                }
                return [4 /*yield*/, user.save()];
            case 4:
                _b.sent();
                res.status(200).json({ message: 'Информация о пользователе обновлена' });
                return [3 /*break*/, 6];
            case 5:
                error_8 = _b.sent();
                res.status(400).json({ message: error_8.message });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
//удаление пользователя по email
app.delete('/users/:email', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var email, deletedRowCount, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                email = req.params.email;
                return [4 /*yield*/, User.destroy({ where: { email: email } })];
            case 1:
                deletedRowCount = _a.sent();
                if (deletedRowCount > 0) {
                    res.status(200).json({ message: 'Пользователь удален' });
                }
                else {
                    res.status(404).json({ message: 'Пользователь не найден' });
                }
                return [3 /*break*/, 3];
            case 2:
                error_9 = _a.sent();
                res.status(400).json({ message: error_9.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/users/:email/pdf', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var email, user, error_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                email = req.params.email;
                return [4 /*yield*/, User.findOne({ where: { email: email } })];
            case 1:
                user = _a.sent();
                if (user && user.pdf) {
                    // Передача содержимого PDF в ответе
                    res.setHeader('Content-Type', 'application/pdf');
                    res.setHeader('Content-Disposition', "attachment; filename=".concat(user.email, ".pdf"));
                    // Отправка содержимого PDF как ответ на запрос
                    res.send(user.pdf);
                }
                else {
                    res.status(404).json({ message: 'PDF для пользователя не найден' });
                }
                return [3 /*break*/, 3];
            case 2:
                error_10 = _a.sent();
                res.status(500).json({ message: 'Ошибка при получении PDF', error: error_10.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
//запуск сервера
var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log("\u0421\u0435\u0440\u0432\u0435\u0440 \u0437\u0430\u043F\u0443\u0449\u0435\u043D \u043D\u0430 \u043F\u043E\u0440\u0442\u0443 ".concat(PORT));
});

-- Seed subjects
INSERT INTO subjects (code, title, icon_url, is_mandatory, category, max_score) VALUES
  ('history-kz', 'История Казахстана', '', true, NULL, 25),
  ('math-literacy', 'Математическая грамотность', '', true, NULL, 20),
  ('reading-literacy', 'Грамотность чтения', '', true, NULL, 20),
  ('physics', 'Физика', '', false, 'natural-sciences', 40),
  ('chemistry', 'Химия', '', false, 'natural-sciences', 40),
  ('biology', 'Биология', '', false, 'natural-sciences', 40),
  ('world-history', 'Всемирная история', '', false, 'social-sciences', 40),
  ('geography', 'География', '', false, 'social-sciences', 40),
  ('english', 'Английский язык', '', false, 'social-sciences', 40),
  ('creative-exam', 'Творческий экзамен', '', false, 'creative', 40);

-- Seed questions and options
INSERT INTO questions (text, points, explanation, subject_id) VALUES
  ('В каком году была принята Декларация о государственном суверенитете Казахстана?', 1, '', (SELECT id FROM subjects WHERE code = 'history-kz')),
  ('Кто был первым Президентом Республики Казахстан?', 1, '', (SELECT id FROM subjects WHERE code = 'history-kz')),
  ('Какой город был столицей Казахстана до Астаны?', 1, '', (SELECT id FROM subjects WHERE code = 'history-kz')),
  ('Если 25% от числа равно 50, чему равно это число?', 1, '', (SELECT id FROM subjects WHERE code = 'math-literacy')),
  ('В магазине скидка 20% на товар стоимостью 5000 тенге. Какова окончательная цена?', 1, '', (SELECT id FROM subjects WHERE code = 'math-literacy')),
  ('Площадь прямоугольника равна 48 см². Если длина равна 8 см, чему равна ширина?', 1, '', (SELECT id FROM subjects WHERE code = 'math-literacy')),
  ('Какой жанр литературы характеризуется наличием вымышленных персонажей и событий?', 1, '', (SELECT id FROM subjects WHERE code = 'reading-literacy')),
  ('Что означает термин "аллегория" в литературе?', 1, '', (SELECT id FROM subjects WHERE code = 'reading-literacy')),
  ('Кто написал роман "Путь Абая"?', 1, '', (SELECT id FROM subjects WHERE code = 'reading-literacy')),
  ('Какова единица измерения силы в системе СИ?', 1, '', (SELECT id FROM subjects WHERE code = 'physics')),
  ('Скорость света в вакууме приблизительно равна:', 1, '', (SELECT id FROM subjects WHERE code = 'physics')),
  ('Первый закон Ньютона также называется законом:', 1, '', (SELECT id FROM subjects WHERE code = 'physics')),
  ('Какой химический символ у золота?', 1, '', (SELECT id FROM subjects WHERE code = 'chemistry')),
  ('Сколько протонов содержится в атоме углерода?', 1, '', (SELECT id FROM subjects WHERE code = 'chemistry')),
  ('Какой газ образуется при реакции кислоты и карбоната?', 1, '', (SELECT id FROM subjects WHERE code = 'chemistry')),
  ('ДНК расшифровывается как:', 1, '', (SELECT id FROM subjects WHERE code = 'biology')),
  ('Основная единица живого организма:', 1, '', (SELECT id FROM subjects WHERE code = 'biology')),
  ('Органелла, отвечающая за выработку энергии в клетке:', 1, '', (SELECT id FROM subjects WHERE code = 'biology')),
  ('В каком году началась Вторая мировая война?', 1, '', (SELECT id FROM subjects WHERE code = 'world-history')),
  ('Кто был лидером Великобритании в начале Второй мировой войны?', 1, '', (SELECT id FROM subjects WHERE code = 'world-history')),
  ('Великая Французская революция началась в:', 1, '', (SELECT id FROM subjects WHERE code = 'world-history')),
  ('Самая высокая гора мира — это:', 1, '', (SELECT id FROM subjects WHERE code = 'geography')),
  ('Столица Австралии:', 1, '', (SELECT id FROM subjects WHERE code = 'geography')),
  ('Самая длинная река в мире:', 1, '', (SELECT id FROM subjects WHERE code = 'geography')),
  ('Прошедшая форма глагола "go":', 1, '', (SELECT id FROM subjects WHERE code = 'english')),
  ('Выберите правильный артикль: ___ apple', 1, '', (SELECT id FROM subjects WHERE code = 'english')),
  ('Множественное число слова "child":', 1, '', (SELECT id FROM subjects WHERE code = 'english')),
  ('Что такое композиция в искусстве?', 1, '', (SELECT id FROM subjects WHERE code = 'creative-exam')),
  ('Какой цвет относится к теплым?', 1, '', (SELECT id FROM subjects WHERE code = 'creative-exam')),
  ('Основной инструмент для рисования углем:', 1, '', (SELECT id FROM subjects WHERE code = 'creative-exam'));

INSERT INTO options (text, is_correct, question_id) VALUES
  ('1989', false, (SELECT id FROM questions WHERE text = 'В каком году была принята Декларация о государственном суверенитете Казахстана?')),
  ('1990', true, (SELECT id FROM questions WHERE text = 'В каком году была принята Декларация о государственном суверенитете Казахстана?')),
  ('1991', false, (SELECT id FROM questions WHERE text = 'В каком году была принята Декларация о государственном суверенитете Казахстана?')),
  ('1992', false, (SELECT id FROM questions WHERE text = 'В каком году была принята Декларация о государственном суверенитете Казахстана?')),

  ('Динмухамед Кунаев', false, (SELECT id FROM questions WHERE text = 'Кто был первым Президентом Республики Казахстан?')),
  ('Нурсултан Назарбаев', true, (SELECT id FROM questions WHERE text = 'Кто был первым Президентом Республики Казахстан?')),
  ('Касым-Жомарт Токаев', false, (SELECT id FROM questions WHERE text = 'Кто был первым Президентом Республики Казахстан?')),
  ('Серикболсын Абдильдин', false, (SELECT id FROM questions WHERE text = 'Кто был первым Президентом Республики Казахстан?')),

  ('Шымкент', false, (SELECT id FROM questions WHERE text = 'Какой город был столицей Казахстана до Астаны?')),
  ('Караганда', false, (SELECT id FROM questions WHERE text = 'Какой город был столицей Казахстана до Астаны?')),
  ('Алматы', true, (SELECT id FROM questions WHERE text = 'Какой город был столицей Казахстана до Астаны?')),
  ('Актобе', false, (SELECT id FROM questions WHERE text = 'Какой город был столицей Казахстана до Астаны?')),

  ('100', false, (SELECT id FROM questions WHERE text = 'Если 25% от числа равно 50, чему равно это число?')),
  ('150', false, (SELECT id FROM questions WHERE text = 'Если 25% от числа равно 50, чему равно это число?')),
  ('200', true, (SELECT id FROM questions WHERE text = 'Если 25% от числа равно 50, чему равно это число?')),
  ('250', false, (SELECT id FROM questions WHERE text = 'Если 25% от числа равно 50, чему равно это число?')),

  ('4500 тенге', false, (SELECT id FROM questions WHERE text = 'В магазине скидка 20% на товар стоимостью 5000 тенге. Какова окончательная цена?')),
  ('4000 тенге', true, (SELECT id FROM questions WHERE text = 'В магазине скидка 20% на товар стоимостью 5000 тенге. Какова окончательная цена?')),
  ('3500 тенге', false, (SELECT id FROM questions WHERE text = 'В магазине скидка 20% на товар стоимостью 5000 тенге. Какова окончательная цена?')),
  ('3000 тенге', false, (SELECT id FROM questions WHERE text = 'В магазине скидка 20% на товар стоимостью 5000 тенге. Какова окончательная цена?')),

  ('4 см', false, (SELECT id FROM questions WHERE text = 'Площадь прямоугольника равна 48 см². Если длина равна 8 см, чему равна ширина?')),
  ('5 см', false, (SELECT id FROM questions WHERE text = 'Площадь прямоугольника равна 48 см². Если длина равна 8 см, чему равна ширина?')),
  ('6 см', true, (SELECT id FROM questions WHERE text = 'Площадь прямоугольника равна 48 см². Если длина равна 8 см, чему равна ширина?')),
  ('7 см', false, (SELECT id FROM questions WHERE text = 'Площадь прямоугольника равна 48 см². Если длина равна 8 см, чему равна ширина?')),

  ('Документальная проза', false, (SELECT id FROM questions WHERE text = 'Какой жанр литературы характеризуется наличием вымышленных персонажей и событий?')),
  ('Художественная литература', true, (SELECT id FROM questions WHERE text = 'Какой жанр литературы характеризуется наличием вымышленных персонажей и событий?')),
  ('Научная статья', false, (SELECT id FROM questions WHERE text = 'Какой жанр литературы характеризуется наличием вымышленных персонажей и событий?')),
  ('Биография', false, (SELECT id FROM questions WHERE text = 'Какой жанр литературы характеризуется наличием вымышленных персонажей и событий?')),

  ('Повторение звуков', false, (SELECT id FROM questions WHERE text = 'Что означает термин "аллегория" в литературе?')),
  ('Скрытый смысл через образы', true, (SELECT id FROM questions WHERE text = 'Что означает термин "аллегория" в литературе?')),
  ('Прямое сравнение', false, (SELECT id FROM questions WHERE text = 'Что означает термин "аллегория" в литературе?')),
  ('Описание природы', false, (SELECT id FROM questions WHERE text = 'Что означает термин "аллегория" в литературе?')),

  ('Мухтар Ауэзов', true, (SELECT id FROM questions WHERE text = 'Кто написал роман "Путь Абая"?')),
  ('Абай Кунанбаев', false, (SELECT id FROM questions WHERE text = 'Кто написал роман "Путь Абая"?')),
  ('Ильяс Есенберлин', false, (SELECT id FROM questions WHERE text = 'Кто написал роман "Путь Абая"?')),
  ('Мухтар Шаханов', false, (SELECT id FROM questions WHERE text = 'Кто написал роман "Путь Абая"?')),

  ('Джоуль', false, (SELECT id FROM questions WHERE text = 'Какова единица измерения силы в системе СИ?')),
  ('Ньютон', true, (SELECT id FROM questions WHERE text = 'Какова единица измерения силы в системе СИ?')),
  ('Ватт', false, (SELECT id FROM questions WHERE text = 'Какова единица измерения силы в системе СИ?')),
  ('Паскаль', false, (SELECT id FROM questions WHERE text = 'Какова единица измерения силы в системе СИ?')),

  ('300 000 м/с', false, (SELECT id FROM questions WHERE text = 'Скорость света в вакууме приблизительно равна:')),
  ('300 000 км/с', true, (SELECT id FROM questions WHERE text = 'Скорость света в вакууме приблизительно равна:')),
  ('30 000 км/с', false, (SELECT id FROM questions WHERE text = 'Скорость света в вакууме приблизительно равна:')),
  ('3 000 000 км/с', false, (SELECT id FROM questions WHERE text = 'Скорость света в вакууме приблизительно равна:')),

  ('Движения', false, (SELECT id FROM questions WHERE text = 'Первый закон Ньютона также называется законом:')),
  ('Инерции', true, (SELECT id FROM questions WHERE text = 'Первый закон Ньютона также называется законом:')),
  ('Действия', false, (SELECT id FROM questions WHERE text = 'Первый закон Ньютона также называется законом:')),
  ('Гравитации', false, (SELECT id FROM questions WHERE text = 'Первый закон Ньютона также называется законом:')),

  ('Go', false, (SELECT id FROM questions WHERE text = 'Какой химический символ у золота?')),
  ('Gd', false, (SELECT id FROM questions WHERE text = 'Какой химический символ у золота?')),
  ('Au', true, (SELECT id FROM questions WHERE text = 'Какой химический символ у золота?')),
  ('Ag', false, (SELECT id FROM questions WHERE text = 'Какой химический символ у золота?')),

  ('4', false, (SELECT id FROM questions WHERE text = 'Сколько протонов содержится в атоме углерода?')),
  ('6', true, (SELECT id FROM questions WHERE text = 'Сколько протонов содержится в атоме углерода?')),
  ('8', false, (SELECT id FROM questions WHERE text = 'Сколько протонов содержится в атоме углерода?')),
  ('12', false, (SELECT id FROM questions WHERE text = 'Сколько протонов содержится в атоме углерода?')),

  ('Кислород', false, (SELECT id FROM questions WHERE text = 'Какой газ образуется при реакции кислоты и карбоната?')),
  ('Водород', false, (SELECT id FROM questions WHERE text = 'Какой газ образуется при реакции кислоты и карбоната?')),
  ('Углекислый газ', true, (SELECT id FROM questions WHERE text = 'Какой газ образуется при реакции кислоты и карбоната?')),
  ('Азот', false, (SELECT id FROM questions WHERE text = 'Какой газ образуется при реакции кислоты и карбоната?')),

  ('Дезоксирибонуклеиновая кислота', true, (SELECT id FROM questions WHERE text = 'ДНК расшифровывается как:')),
  ('Динитронуклеиновая кислота', false, (SELECT id FROM questions WHERE text = 'ДНК расшифровывается как:')),
  ('Дихлорнуклеиновая кислота', false, (SELECT id FROM questions WHERE text = 'ДНК расшифровывается как:')),
  ('Диметилнуклеиновая кислота', false, (SELECT id FROM questions WHERE text = 'ДНК расшифровывается как:')),

  ('Ткань', false, (SELECT id FROM questions WHERE text = 'Основная единица живого организма:')),
  ('Клетка', true, (SELECT id FROM questions WHERE text = 'Основная единица живого организма:')),
  ('Орган', false, (SELECT id FROM questions WHERE text = 'Основная единица живого организма:')),
  ('Система органов', false, (SELECT id FROM questions WHERE text = 'Основная единица живого организма:')),

  ('Ядро', false, (SELECT id FROM questions WHERE text = 'Органелла, отвечающая за выработку энергии в клетке:')),
  ('Митохондрия', true, (SELECT id FROM questions WHERE text = 'Органелла, отвечающая за выработку энергии в клетке:')),
  ('Лизосома', false, (SELECT id FROM questions WHERE text = 'Органелла, отвечающая за выработку энергии в клетке:')),
  ('Рибосома', false, (SELECT id FROM questions WHERE text = 'Органелла, отвечающая за выработку энергии в клетке:')),

  ('1938', false, (SELECT id FROM questions WHERE text = 'В каком году началась Вторая мировая война?')),
  ('1939', true, (SELECT id FROM questions WHERE text = 'В каком году началась Вторая мировая война?')),
  ('1941', false, (SELECT id FROM questions WHERE text = 'В каком году началась Вторая мировая война?')),
  ('1945', false, (SELECT id FROM questions WHERE text = 'В каком году началась Вторая мировая война?')),

  ('Уинстон Черчилль', true, (SELECT id FROM questions WHERE text = 'Кто был лидером Великобритании в начале Второй мировой войны?')),
  ('Невилл Чемберлен', false, (SELECT id FROM questions WHERE text = 'Кто был лидером Великобритании в начале Второй мировой войны?')),
  ('Франклин Рузвельт', false, (SELECT id FROM questions WHERE text = 'Кто был лидером Великобритании в начале Второй мировой войны?')),
  ('Шарль де Голль', false, (SELECT id FROM questions WHERE text = 'Кто был лидером Великобритании в начале Второй мировой войны?')),

  ('1776', false, (SELECT id FROM questions WHERE text = 'Великая Французская революция началась в:')),
  ('1789', true, (SELECT id FROM questions WHERE text = 'Великая Французская революция началась в:')),
  ('1812', false, (SELECT id FROM questions WHERE text = 'Великая Французская революция началась в:')),
  ('1848', false, (SELECT id FROM questions WHERE text = 'Великая Французская революция началась в:')),

  ('Килиманджаро', false, (SELECT id FROM questions WHERE text = 'Самая высокая гора мира — это:')),
  ('Эверест', true, (SELECT id FROM questions WHERE text = 'Самая высокая гора мира — это:')),
  ('Эльбрус', false, (SELECT id FROM questions WHERE text = 'Самая высокая гора мира — это:')),
  ('Монблан', false, (SELECT id FROM questions WHERE text = 'Самая высокая гора мира — это:')),

  ('Сидней', false, (SELECT id FROM questions WHERE text = 'Столица Австралии:')),
  ('Канберра', true, (SELECT id FROM questions WHERE text = 'Столица Австралии:')),
  ('Мельбурн', false, (SELECT id FROM questions WHERE text = 'Столица Австралии:')),
  ('Перт', false, (SELECT id FROM questions WHERE text = 'Столица Австралии:')),

  ('Нил', true, (SELECT id FROM questions WHERE text = 'Самая длинная река в мире:')),
  ('Амазонка', false, (SELECT id FROM questions WHERE text = 'Самая длинная река в мире:')),
  ('Янцзы', false, (SELECT id FROM questions WHERE text = 'Самая длинная река в мире:')),
  ('Миссисипи', false, (SELECT id FROM questions WHERE text = 'Самая длинная река в мире:')),

  ('goed', false, (SELECT id FROM questions WHERE text = 'Прошедшая форма глагола "go":')),
  ('went', true, (SELECT id FROM questions WHERE text = 'Прошедшая форма глагола "go":')),
  ('gone', false, (SELECT id FROM questions WHERE text = 'Прошедшая форма глагола "go":')),
  ('going', false, (SELECT id FROM questions WHERE text = 'Прошедшая форма глагола "go":')),

  ('a', false, (SELECT id FROM questions WHERE text = 'Выберите правильный артикль: ___ apple')),
  ('an', true, (SELECT id FROM questions WHERE text = 'Выберите правильный артикль: ___ apple')),
  ('the', false, (SELECT id FROM questions WHERE text = 'Выберите правильный артикль: ___ apple')),
  ('no article', false, (SELECT id FROM questions WHERE text = 'Выберите правильный артикль: ___ apple')),

  ('childs', false, (SELECT id FROM questions WHERE text = 'Множественное число слова "child":')),
  ('childes', false, (SELECT id FROM questions WHERE text = 'Множественное число слова "child":')),
  ('children', true, (SELECT id FROM questions WHERE text = 'Множественное число слова "child":')),
  ('childrens', false, (SELECT id FROM questions WHERE text = 'Множественное число слова "child":')),

  ('Организация элементов на плоскости', true, (SELECT id FROM questions WHERE text = 'Что такое композиция в искусстве?')),
  ('Подбор кистей', false, (SELECT id FROM questions WHERE text = 'Что такое композиция в искусстве?')),
  ('Смешивание красок', false, (SELECT id FROM questions WHERE text = 'Что такое композиция в искусстве?')),
  ('Техника скульптуры', false, (SELECT id FROM questions WHERE text = 'Что такое композиция в искусстве?')),

  ('Синий', false, (SELECT id FROM questions WHERE text = 'Какой цвет относится к теплым?')),
  ('Красный', true, (SELECT id FROM questions WHERE text = 'Какой цвет относится к теплым?')),
  ('Фиолетовый', false, (SELECT id FROM questions WHERE text = 'Какой цвет относится к теплым?')),
  ('Зеленый', false, (SELECT id FROM questions WHERE text = 'Какой цвет относится к теплым?')),

  ('Уголь', true, (SELECT id FROM questions WHERE text = 'Основной инструмент для рисования углем:')),
  ('Маркер', false, (SELECT id FROM questions WHERE text = 'Основной инструмент для рисования углем:')),
  ('Ручка', false, (SELECT id FROM questions WHERE text = 'Основной инструмент для рисования углем:')),
  ('Пастель', false, (SELECT id FROM questions WHERE text = 'Основной инструмент для рисования углем:'));

-- Seed users (password = "password")
INSERT INTO users (email, username, password, full_name, role, created_at) VALUES
  ('aigul@example.com', 'aigul_student', '$2a$10$7EqJtq98hPqEX7fNZaFWoOQm3g6xYcE5gD1sYbF2GQ2yq1XZG5e12', 'Айгуль Сарсенова', 'STUDENT', '2024-09-01'),
  ('admin@entbridge.kz', 'admin', '$2a$10$7EqJtq98hPqEX7fNZaFWoOQm3g6xYcE5gD1sYbF2GQ2yq1XZG5e12', 'Администратор', 'ADMIN', '2024-01-01');

-- Seed test results for demo user
INSERT INTO test_results (user_id, subject_id, score, max_score, total_questions, correct_answers, completed_at) VALUES
  ((SELECT id FROM users WHERE username = 'aigul_student'), (SELECT id FROM subjects WHERE code = 'history-kz'), 17, 25, 3, 2, '2024-10-15'),
  ((SELECT id FROM users WHERE username = 'aigul_student'), (SELECT id FROM subjects WHERE code = 'math-literacy'), 20, 20, 3, 3, '2024-10-18'),
  ((SELECT id FROM users WHERE username = 'aigul_student'), (SELECT id FROM subjects WHERE code = 'physics'), 27, 40, 3, 2, '2024-10-20');

-- Seed video lessons
INSERT INTO video_lessons (title, subject_id, youtube_url, thumbnail, duration, description) VALUES
  ('История независимости Казахстана', (SELECT id FROM subjects WHERE code = 'history-kz'), 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', '25:30', 'Подробный урок о пути Казахстана к независимости'),
  ('Проценты и их применение', (SELECT id FROM subjects WHERE code = 'math-literacy'), 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', '18:45', 'Как решать задачи с процентами'),
  ('Законы Ньютона', (SELECT id FROM subjects WHERE code = 'physics'), 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', '30:15', 'Три закона Ньютона с примерами'),
  ('Периодическая таблица элементов', (SELECT id FROM subjects WHERE code = 'chemistry'), 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', '22:00', 'Структура и использование периодической таблицы'),
  ('Строение клетки', (SELECT id FROM subjects WHERE code = 'biology'), 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', '20:30', 'Органеллы клетки и их функции');

-- Seed homework
INSERT INTO homework (title, description, subject_id, due_date, assigned_by) VALUES
  ('Эссе о независимости Казахстана', 'Напишите эссе объемом 300-500 слов о значении независимости Казахстана.', (SELECT id FROM subjects WHERE code = 'history-kz'), '2024-11-15', 'admin'),
  ('Решение задач по физике', 'Решите задачи 1-10 из главы "Механика".', (SELECT id FROM subjects WHERE code = 'physics'), '2024-11-20', 'admin');

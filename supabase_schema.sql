-- ==========================================
-- TALENTRACK - SCHEMA DEFINITIVO (PROPUESTA USUARIO)
-- ==========================================

-- 1. TABLA: USERS
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL -- admin, matricula, profesor, alumno, director, coordinador
);

-- 2. TABLA: STUDENTS
CREATE TABLE students (
  id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  dni TEXT UNIQUE NOT NULL,
  email TEXT DEFAULT 'a@gmail.com', -- Nuevo campo para notificaciones
  birth_date DATE,
  level TEXT CHECK (level IN ('Primaria', 'Secundaria')),
  grade INTEGER,
  enrollment_paid BOOLEAN DEFAULT FALSE,
  points INTEGER DEFAULT 0,
  level_rank INTEGER DEFAULT 1
);

-- 3. TABLA: TEACHERS
CREATE TABLE teachers (
  id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  specialization TEXT,
  salary NUMERIC
);

-- 4. TABLA: CLASSROOMS
CREATE TABLE classrooms (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  level TEXT CHECK (level IN ('Primaria', 'Secundaria')),
  grade INTEGER,
  is_approved BOOLEAN DEFAULT FALSE
);

-- 5. TABLA: COURSES (Lista global de materias)
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

-- 6. RELACIÓN: CLASSROOM - STUDENTS
CREATE TABLE classroom_students (
  id SERIAL PRIMARY KEY,
  classroom_id INTEGER REFERENCES classrooms(id) ON DELETE CASCADE,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE(classroom_id, student_id)
);

-- 7. RELACIÓN: CLASSROOM - TEACHERS (Profesor por curso en cada salón)
CREATE TABLE classroom_teachers (
  id SERIAL PRIMARY KEY,
  classroom_id INTEGER REFERENCES classrooms(id) ON DELETE CASCADE,
  teacher_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE(classroom_id, course_id)
);

-- 8. TABLA: GRADES
CREATE TABLE grades (
  id SERIAL PRIMARY KEY,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
  classroom_id INTEGER REFERENCES classrooms(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  exam_number INTEGER CHECK (exam_number BETWEEN 1 AND 8),
  bimester INTEGER CHECK (bimester BETWEEN 1 AND 4),
  score NUMERIC CHECK (score BETWEEN 0 AND 20),
  UNIQUE(student_id, course_id, exam_number)
);

-- 9. TABLA: ACHIEVEMENTS
CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
  name TEXT,
  points INTEGER
);

-- 10. TABLA: CAREER RECOMMENDATIONS
CREATE TABLE career_recommendations (
  id SERIAL PRIMARY KEY,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
  career_name TEXT,
  score NUMERIC
);

-- INSERTAR DATOS INICIALES
INSERT INTO users (id, username, password, full_name, role)
VALUES ('admin-001', 'administracion', 'admin123', 'Administrador Global', 'admin')
ON CONFLICT DO NOTHING;

INSERT INTO courses (name) VALUES 
('Matemáticas'), ('Comunicación'), ('Ciencia y Tecnología'), ('Historia'), ('Arte y Cultura')
ON CONFLICT DO NOTHING;

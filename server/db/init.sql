CREATE DATABASE IF NOT EXISTS drive_school DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE drive_school;

DROP TABLE IF EXISTS simulator_bookings;
DROP TABLE IF EXISTS simulator_sessions;
DROP TABLE IF EXISTS simulator_info;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS time_slots;
DROP TABLE IF EXISTS coach_ratings;
DROP TABLE IF EXISTS subject_progress;
DROP TABLE IF EXISTS coaches;
DROP TABLE IF EXISTS students;

CREATE TABLE students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_no VARCHAR(32) UNIQUE NOT NULL,
  name VARCHAR(32) NOT NULL,
  avatar VARCHAR(255) DEFAULT '👨‍🎓',
  phone VARCHAR(20) NOT NULL,
  password VARCHAR(64) NOT NULL,
  school VARCHAR(64) DEFAULT '阳光驾校',
  enroll_date DATE NOT NULL,
  total_hours DECIMAL(5,1) DEFAULT 62,
  used_hours DECIMAL(5,1) DEFAULT 0,
  remaining_hours DECIMAL(5,1) DEFAULT 62,
  credits INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE subject_progress (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  subject TINYINT NOT NULL COMMENT '1-科一 2-科二 3-科三 4-科四',
  subject_name VARCHAR(32) NOT NULL,
  full_name VARCHAR(32) NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'not_started' COMMENT 'not_started/training/passed',
  icon VARCHAR(16) DEFAULT '📚',
  color VARCHAR(128) DEFAULT 'linear-gradient(135deg, #969799 0%, #b0b1b3 100%)',
  training_hours DECIMAL(5,1) DEFAULT 0,
  required_hours DECIMAL(5,1) DEFAULT 16,
  pass_date DATE DEFAULT NULL,
  score INT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_student_subject (student_id, subject),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE coaches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(32) NOT NULL,
  avatar VARCHAR(255) DEFAULT '👨‍🏫',
  gender VARCHAR(8) DEFAULT '男',
  age TINYINT DEFAULT 30,
  experience TINYINT DEFAULT 5,
  car_model VARCHAR(32) NOT NULL,
  car_no VARCHAR(32) NOT NULL,
  rating DECIMAL(2,1) DEFAULT 5.0,
  rating_count INT DEFAULT 0,
  students INT DEFAULT 0,
  pass_rate VARCHAR(8) DEFAULT '90%',
  tags VARCHAR(255) DEFAULT '',
  phone VARCHAR(20) NOT NULL,
  subject TINYINT NOT NULL COMMENT '2-科二 3-科三',
  rest_day TINYINT DEFAULT 1 COMMENT '周几休息 0-周日 1-周一 ... 6-周六',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE coach_ratings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  coach_id INT NOT NULL,
  attitude DECIMAL(2,1) DEFAULT 5.0,
  professionalism DECIMAL(2,1) DEFAULT 5.0,
  patience DECIMAL(2,1) DEFAULT 5.0,
  punctuality DECIMAL(2,1) DEFAULT 5.0,
  FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE time_slots (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(32) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  period VARCHAR(16) NOT NULL COMMENT 'morning/afternoon/evening',
  sort_order TINYINT DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  coach_id INT NOT NULL,
  coach_name VARCHAR(32) NOT NULL,
  coach_avatar VARCHAR(255) DEFAULT '👨‍🏫',
  course_date DATE NOT NULL,
  time_slot_id VARCHAR(32) NOT NULL,
  time_start TIME NOT NULL,
  time_end TIME NOT NULL,
  time_name VARCHAR(32) NOT NULL,
  time_period VARCHAR(16) NOT NULL,
  location VARCHAR(128) NOT NULL,
  subject TINYINT NOT NULL,
  hours DECIMAL(3,1) DEFAULT 2,
  status VARCHAR(16) NOT NULL DEFAULT 'upcoming' COMMENT 'upcoming/completed/cancelled',
  message VARCHAR(255) DEFAULT '',
  cancel_reason VARCHAR(255) DEFAULT NULL,
  cancelled_at DATETIME DEFAULT NULL,
  reviewed TINYINT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE,
  INDEX idx_student_date (student_id, course_date),
  INDEX idx_coach_date (coach_id, course_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  coach_id INT NOT NULL,
  student_id INT NOT NULL,
  student_name VARCHAR(32) NOT NULL,
  student_avatar VARCHAR(255) DEFAULT '🧑',
  course_id INT NOT NULL,
  attitude TINYINT DEFAULT 5,
  professionalism TINYINT DEFAULT 5,
  patience TINYINT DEFAULT 5,
  punctuality TINYINT DEFAULT 5,
  content VARCHAR(500) DEFAULT '',
  tags VARCHAR(255) DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE KEY uk_course (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE simulator_info (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(64) NOT NULL,
  description VARCHAR(255) NOT NULL,
  duration VARCHAR(32) DEFAULT '2小时/次',
  location VARCHAR(128) NOT NULL,
  notice TEXT,
  faq TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE simulator_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  session_date DATE NOT NULL,
  slot_id VARCHAR(32) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'available' COMMENT 'available/full/rest',
  price DECIMAL(6,2) DEFAULT 180.00,
  max_count INT DEFAULT 6,
  booked_count INT DEFAULT 0,
  UNIQUE KEY uk_date_slot (session_date, slot_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE simulator_bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  session_date DATE NOT NULL,
  slot_id VARCHAR(32) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  price DECIMAL(6,2) NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'upcoming' COMMENT 'upcoming/completed/cancelled',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  INDEX idx_student_date (student_id, session_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO students (student_no, name, phone, password, school, enroll_date, total_hours, used_hours, remaining_hours, credits) VALUES
('S2024001', '张同学', '13888888888', '123456', '阳光驾校', '2024-03-15', 62, 18.5, 43.5, 380);

INSERT INTO subject_progress (student_id, subject, subject_name, full_name, status, icon, color, training_hours, required_hours, pass_date, score) VALUES
(1, 1, '科一', '理论知识', 'passed', '📚', 'linear-gradient(135deg, #07c160 0%, #10b981 100%)', 0, 0, '2024-04-10', 96),
(1, 2, '科二', '场地驾驶', 'training', '🚗', 'linear-gradient(135deg, #1989fa 0%, #3da5ff 100%)', 8.5, 16, NULL, NULL),
(1, 3, '科三', '道路驾驶', 'not_started', '🛣️', 'linear-gradient(135deg, #969799 0%, #b0b1b3 100%)', 0, 16, NULL, NULL),
(1, 4, '科四', '文明驾驶', 'not_started', '🎯', 'linear-gradient(135deg, #969799 0%, #b0b1b3 100%)', 0, 0, NULL, NULL);

INSERT INTO coaches (name, avatar, gender, age, experience, car_model, car_no, rating, rating_count, students, pass_rate, tags, phone, subject, rest_day) VALUES
('李教练', '👨‍🏫', '男', 42, 12, '大众朗逸', '京A·12345学', 4.9, 328, 56, '95.8%', '耐心细致,通过率高,教学专业', '139****1234', 2, 1),
('王教练', '👩‍🏫', '女', 38, 8, '丰田卡罗拉', '京A·67890学', 4.8, 256, 42, '93.2%', '温柔耐心,讲解清晰,通过率高', '138****5678', 2, 3),
('陈教练', '🧑‍🏫', '男', 45, 15, '大众速腾', '京A·11111学', 4.7, 412, 68, '96.5%', '资深教练,教学严谨,经验丰富', '137****9012', 3, 6),
('刘教练', '👨‍🏫', '男', 36, 6, '雪铁龙爱丽舍', '京A·22222学', 4.6, 178, 35, '91.5%', '年轻活力,教学新颖,善于沟通', '136****3456', 2, 0);

INSERT INTO coach_ratings (coach_id, attitude, professionalism, patience, punctuality) VALUES
(1, 4.9, 4.9, 4.8, 5.0),
(2, 4.9, 4.7, 5.0, 4.7),
(3, 4.6, 4.9, 4.6, 4.8),
(4, 4.7, 4.5, 4.6, 4.5);

INSERT INTO time_slots (id, name, start_time, end_time, period, sort_order) VALUES
('morning1', '早班1', '08:00', '10:00', 'morning', 1),
('morning2', '早班2', '10:00', '12:00', 'morning', 2),
('afternoon1', '下午1', '14:00', '16:00', 'afternoon', 3),
('afternoon2', '下午2', '16:00', '18:00', 'afternoon', 4),
('evening', '晚班', '18:00', '20:00', 'evening', 5);

INSERT INTO courses (student_id, coach_id, coach_name, coach_avatar, course_date, time_slot_id, time_start, time_end, time_name, time_period, location, subject, hours, status, message, reviewed) VALUES
(1, 1, '李教练', '👨‍🏫', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'morning2', '10:00', '12:00', '早班2', 'morning', '阳光驾校训练场地A区 - 3号位', 2, 2, 'upcoming', '想练倒库', 0),
(1, 2, '王教练', '👩‍🏫', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'afternoon1', '14:00', '16:00', '下午1', 'afternoon', '阳光驾校训练场地B区 - 1号位', 2, 2, 'upcoming', '需要加强坡道起步', 0),
(1, 1, '李教练', '👨‍🏫', DATE_ADD(CURDATE(), INTERVAL 4 DAY), 'morning1', '08:00', '10:00', '早班1', 'morning', '阳光驾校训练场地A区 - 3号位', 2, 2, 'upcoming', '', 0),
(1, 1, '李教练', '👨‍🏫', DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'afternoon2', '16:00', '18:00', '下午2', 'afternoon', '阳光驾校训练场地A区 - 3号位', 2, 2, 'completed', '综合训练为主', 1),
(1, 2, '王教练', '👩‍🏫', DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'morning2', '10:00', '12:00', '早班2', 'morning', '阳光驾校训练场地B区 - 1号位', 2, 2, 'completed', '多练侧方停车', 0);

INSERT INTO reviews (coach_id, student_id, student_name, student_avatar, course_id, attitude, professionalism, patience, punctuality, content, tags) VALUES
(1, 1, '李同学', '👩‍🎓', 4, 5, 5, 5, 5, '李教练教得特别好，非常有耐心，每次练车都很有收获！倒库教的方法特别实用，一学就会。', '有耐心,讲解清晰,方法实用'),
(1, 1, '王同学', '👨‍🎓', 4, 5, 5, 4, 5, '教练非常专业，经验丰富，每次都能指出我操作中的问题，进步很快。', '经验丰富,专业细致'),
(2, 1, '赵同学', '👩‍🎓', 5, 5, 5, 5, 4, '王教练特别温柔，练车时从来不会紧张，坡道起步练了很多次才学会，教练一直很有耐心。', '温柔耐心,缓解紧张');

INSERT INTO simulator_info (name, description, duration, location, notice, faq) VALUES
('科二考场模拟训练', '1:1还原真实考场环境，助您熟悉考试流程', '2小时/次', '阳光驾校考场模拟中心',
'模拟训练需额外收费，不包含在学时卡内|请提前15分钟到达模拟中心签到|携带本人身份证原件|模拟训练前建议先完成16学时基础训练',
'模拟训练和真实考场一样吗？是的，我们采用1:1还原真实考场的场地布局、标线和设备。|可以反复模拟吗？可以，建议考前进行2-3次模拟训练，通过率提升明显。');

INSERT INTO simulator_sessions (session_date, slot_id, start_time, end_time, status, price, max_count, booked_count) VALUES
(DATE_ADD(CURDATE(), INTERVAL 1 DAY), 's1', '09:00', '11:00', 'available', 180.00, 6, 0),
(DATE_ADD(CURDATE(), INTERVAL 1 DAY), 's2', '13:00', '15:00', 'available', 180.00, 6, 0),
(DATE_ADD(CURDATE(), INTERVAL 1 DAY), 's3', '15:30', '17:30', 'full', 180.00, 6, 6),
(DATE_ADD(CURDATE(), INTERVAL 1 DAY), 's4', '18:00', '20:00', 'available', 200.00, 6, 0),
(DATE_ADD(CURDATE(), INTERVAL 2 DAY), 's1', '09:00', '11:00', 'full', 180.00, 6, 6),
(DATE_ADD(CURDATE(), INTERVAL 2 DAY), 's2', '13:00', '15:00', 'available', 180.00, 6, 0),
(DATE_ADD(CURDATE(), INTERVAL 2 DAY), 's3', '15:30', '17:30', 'available', 180.00, 6, 0),
(DATE_ADD(CURDATE(), INTERVAL 2 DAY), 's4', '18:00', '20:00', 'available', 200.00, 6, 0),
(DATE_ADD(CURDATE(), INTERVAL 3 DAY), 's1', '09:00', '11:00', 'available', 180.00, 6, 0),
(DATE_ADD(CURDATE(), INTERVAL 3 DAY), 's2', '13:00', '15:00', 'available', 180.00, 6, 0),
(DATE_ADD(CURDATE(), INTERVAL 3 DAY), 's3', '15:30', '17:30', 'full', 180.00, 6, 6),
(DATE_ADD(CURDATE(), INTERVAL 3 DAY), 's4', '18:00', '20:00', 'rest', 200.00, 6, 0),
(DATE_ADD(CURDATE(), INTERVAL 4 DAY), 's1', '09:00', '11:00', 'available', 180.00, 6, 0),
(DATE_ADD(CURDATE(), INTERVAL 4 DAY), 's2', '13:00', '15:00', 'available', 180.00, 6, 0),
(DATE_ADD(CURDATE(), INTERVAL 4 DAY), 's3', '15:30', '17:30', 'available', 180.00, 6, 0),
(DATE_ADD(CURDATE(), INTERVAL 4 DAY), 's4', '18:00', '20:00', 'available', 200.00, 6, 0),
(DATE_ADD(CURDATE(), INTERVAL 5 DAY), 's1', '09:00', '11:00', 'available', 180.00, 6, 0),
(DATE_ADD(CURDATE(), INTERVAL 5 DAY), 's2', '13:00', '15:00', 'rest', 180.00, 6, 0),
(DATE_ADD(CURDATE(), INTERVAL 5 DAY), 's3', '15:30', '17:30', 'available', 180.00, 6, 0),
(DATE_ADD(CURDATE(), INTERVAL 5 DAY), 's4', '18:00', '20:00', 'available', 200.00, 6, 0),
(DATE_ADD(CURDATE(), INTERVAL 6 DAY), 's1', '09:00', '11:00', 'available', 180.00, 6, 0),
(DATE_ADD(CURDATE(), INTERVAL 6 DAY), 's2', '13:00', '15:00', 'available', 180.00, 6, 0),
(DATE_ADD(CURDATE(), INTERVAL 6 DAY), 's3', '15:30', '17:30', 'available', 180.00, 6, 0),
(DATE_ADD(CURDATE(), INTERVAL 6 DAY), 's4', '18:00', '20:00', 'available', 200.00, 6, 0),
(DATE_ADD(CURDATE(), INTERVAL 7 DAY), 's1', '09:00', '11:00', 'available', 180.00, 6, 0),
(DATE_ADD(CURDATE(), INTERVAL 7 DAY), 's2', '13:00', '15:00', 'available', 180.00, 6, 0),
(DATE_ADD(CURDATE(), INTERVAL 7 DAY), 's3', '15:30', '17:30', 'available', 180.00, 6, 0),
(DATE_ADD(CURDATE(), INTERVAL 7 DAY), 's4', '18:00', '20:00', 'available', 200.00, 6, 0);

INSERT INTO simulator_bookings (student_id, session_date, slot_id, start_time, end_time, price, status) VALUES
(1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 's2', '13:00', '15:00', 180.00, 'completed');

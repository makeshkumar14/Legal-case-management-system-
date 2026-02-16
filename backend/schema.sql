-- ============================================================
--  Legal Case Management System — MySQL Database Setup
-- ============================================================
--  Run this script in MySQL Workbench or from the command line:
--    mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS legal_case_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE legal_case_db;

-- ── Users ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(150) NOT NULL,
  email           VARCHAR(150) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  role            ENUM('public', 'advocate', 'court') NOT NULL,
  phone           VARCHAR(20),
  avatar          VARCHAR(255),
  citizen_id      VARCHAR(50),
  bar_council_id  VARCHAR(50),
  specialization  VARCHAR(100),
  experience      VARCHAR(50),
  rating          FLOAT DEFAULT 0.0,
  active_cases    INT DEFAULT 0,
  court_name      VARCHAR(200),
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Courtrooms ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courtrooms (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  judge         VARCHAR(200),
  status        VARCHAR(20) DEFAULT 'available',
  current_case  VARCHAR(50),
  case_title    VARCHAR(300),
  start_time    VARCHAR(20),
  case_type     VARCHAR(50)
) ENGINE=InnoDB;

-- ── Cases ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cases (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  case_number     VARCHAR(50) NOT NULL UNIQUE,
  title           VARCHAR(300) NOT NULL,
  description     TEXT,
  case_type       VARCHAR(50) NOT NULL,
  status          VARCHAR(30) DEFAULT 'filed',
  priority        VARCHAR(10) DEFAULT 'medium',
  petitioner      VARCHAR(200) NOT NULL,
  respondent      VARCHAR(200) NOT NULL,
  advocate_id     INT,
  judge           VARCHAR(200),
  courtroom_id    INT,
  court_room_name VARCHAR(100),
  next_hearing    DATETIME,
  filing_date     DATE NOT NULL,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (advocate_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (courtroom_id) REFERENCES courtrooms(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ── Hearings ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hearings (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  case_id     INT NOT NULL,
  date        DATE NOT NULL,
  type        VARCHAR(100) NOT NULL,
  status      VARCHAR(20) DEFAULT 'scheduled',
  notes       TEXT,
  location    VARCHAR(200),
  start_time  DATETIME,
  end_time    DATETIME,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Case Timeline ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS case_timeline (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  case_id     INT NOT NULL,
  date        DATE NOT NULL,
  event       VARCHAR(200) NOT NULL,
  description VARCHAR(500),
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Documents (Evidence) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  case_id      INT NOT NULL,
  uploaded_by  INT NOT NULL,
  title        VARCHAR(300) NOT NULL,
  doc_type     VARCHAR(50) DEFAULT 'Document',
  file_type    VARCHAR(10) NOT NULL,
  file_path    VARCHAR(500),
  file_size    VARCHAR(20),
  verified     BOOLEAN DEFAULT FALSE,
  uploaded_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id)     REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Tasks ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  case_id     INT NOT NULL,
  user_id     INT NOT NULL,
  title       VARCHAR(300) NOT NULL,
  completed   BOOLEAN DEFAULT FALSE,
  priority    VARCHAR(10) DEFAULT 'medium',
  due_date    DATE,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Case Notes ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS case_notes (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  case_id     INT NOT NULL,
  user_id     INT NOT NULL,
  content     TEXT NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Notifications ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  type        VARCHAR(30) DEFAULT 'system',
  title       VARCHAR(300) NOT NULL,
  message     TEXT,
  priority    VARCHAR(10) DEFAULT 'low',
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Messages ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  sender_id    INT NOT NULL,
  receiver_id  INT NOT NULL,
  content      TEXT NOT NULL,
  is_read      BOOLEAN DEFAULT FALSE,
  sent_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id)   REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

SELECT 'All tables created successfully!' AS result;

-- =======================================================
-- Database Schema: student_management
-- Description: Core tables for Student Management System
-- Engine: InnoDB, Charset: utf8mb4
-- =======================================================

CREATE DATABASE IF NOT EXISTS `student_management`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `student_management`;

-- -------------------------------------------------------
-- Table 1: users (Stores Admin credentials)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('admin') DEFAULT 'admin',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- Table 2: courses (Stores Academic Course Details)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS `courses` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `course_name` VARCHAR(150) NOT NULL UNIQUE,
    `course_code` VARCHAR(30) NOT NULL UNIQUE,
    `duration` VARCHAR(50),
    `fees` DECIMAL(10,2) DEFAULT 0.00,
    `description` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_courses_code` (`course_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- Table 3: students (Stores Student Profile Details)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS `students` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_code` VARCHAR(30) NOT NULL UNIQUE,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `phone` VARCHAR(20) NOT NULL,
    `gender` ENUM('Male', 'Female', 'Other'),
    `date_of_birth` DATE,
    `address` TEXT,
    `course_id` INT NULL,
    `admission_date` DATE,
    `status` ENUM('Active', 'Inactive', 'Graduated') DEFAULT 'Active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_students_code` (`student_code`),
    INDEX `idx_students_email` (`email`),
    INDEX `idx_students_status` (`status`),
    INDEX `idx_students_course` (`course_id`),
    CONSTRAINT `fk_students_course`
        FOREIGN KEY (`course_id`)
        REFERENCES `courses`(`id`)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

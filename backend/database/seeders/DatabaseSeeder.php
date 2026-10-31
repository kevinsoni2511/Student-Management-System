<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Course;
use App\Models\Student;
use App\Models\Attendance;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Default Super Admin
        $admin = User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'System Administrator',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // 2. Create Standard Institute Courses
        $coursesData = [
            [
                'course_name' => 'Full Stack Web Development',
                'course_code' => 'CS-101',
                'duration' => '6 Months',
                'fees' => 1200.00,
                'description' => 'Comprehensive masterclass in React, Node, Laravel, and MySQL.',
                'status' => 'Active',
            ],
            [
                'course_name' => 'Data Science & Machine Learning',
                'course_code' => 'DS-201',
                'duration' => '8 Months',
                'fees' => 1500.00,
                'description' => 'Python, Pandas, TensorFlow, and predictive analytics.',
                'status' => 'Active',
            ],
            [
                'course_name' => 'Cyber Security & Ethical Hacking',
                'course_code' => 'SEC-301',
                'duration' => '4 Months',
                'fees' => 1100.00,
                'description' => 'Network defense, penetration testing, and security compliance.',
                'status' => 'Active',
            ],
            [
                'course_name' => 'Cloud Computing & DevOps',
                'course_code' => 'CLD-401',
                'duration' => '6 Months',
                'fees' => 1350.00,
                'description' => 'AWS, Docker, Kubernetes, and CI/CD pipelines.',
                'status' => 'Active',
            ]
        ];

        $courses = [];
        foreach ($coursesData as $c) {
            $courses[] = Course::updateOrCreate(['course_code' => $c['course_code']], $c);
        }

        // 3. Create Sample Students
        $studentsData = [
            [
                'student_code' => 'STU-2026-0001',
                'full_name' => 'Rahul Sharma',
                'email' => 'rahul.sharma@example.com',
                'phone' => '+91 98765 43210',
                'gender' => 'Male',
                'date_of_birth' => '2002-05-14',
                'address' => '42 MG Road, Bengaluru, Karnataka',
                'course_id' => $courses[0]->id,
                'admission_date' => Carbon::now()->subDays(20)->toDateString(),
                'status' => 'Active',
            ],
            [
                'student_code' => 'STU-2026-0002',
                'full_name' => 'Priya Patel',
                'email' => 'priya.patel@example.com',
                'phone' => '+91 98123 45678',
                'gender' => 'Female',
                'date_of_birth' => '2001-11-23',
                'address' => '15 SG Highway, Ahmedabad, Gujarat',
                'course_id' => $courses[1]->id,
                'admission_date' => Carbon::now()->subDays(15)->toDateString(),
                'status' => 'Active',
            ],
            [
                'student_code' => 'STU-2026-0003',
                'full_name' => 'Amit Verma',
                'email' => 'amit.verma@example.com',
                'phone' => '+91 97654 32109',
                'gender' => 'Male',
                'date_of_birth' => '2000-08-19',
                'address' => '102 Civil Lines, Lucknow, UP',
                'course_id' => $courses[2]->id,
                'admission_date' => Carbon::now()->subDays(180)->toDateString(),
                'status' => 'Graduated',
            ],
            [
                'student_code' => 'STU-2026-0004',
                'full_name' => 'Neha Singh',
                'email' => 'neha.singh@example.com',
                'phone' => '+91 99887 76655',
                'gender' => 'Female',
                'date_of_birth' => '2003-02-10',
                'address' => '78 Lake View, Bhopal, MP',
                'course_id' => $courses[0]->id,
                'admission_date' => Carbon::now()->subDays(8)->toDateString(),
                'status' => 'Active',
            ],
            [
                'student_code' => 'STU-2026-0005',
                'full_name' => 'Rohan Gupta',
                'email' => 'rohan.gupta@example.com',
                'phone' => '+91 91234 56789',
                'gender' => 'Male',
                'date_of_birth' => '2001-09-30',
                'address' => '23 Cyber City, Gurugram, Haryana',
                'course_id' => $courses[3]->id,
                'admission_date' => Carbon::now()->subDays(45)->toDateString(),
                'status' => 'Inactive',
            ],
            [
                'student_code' => 'STU-2026-0006',
                'full_name' => 'Ananya Roy',
                'email' => 'ananya.roy@example.com',
                'phone' => '+91 93456 78901',
                'gender' => 'Female',
                'date_of_birth' => '2002-12-05',
                'address' => '88 Park Street, Kolkata, West Bengal',
                'course_id' => $courses[1]->id,
                'admission_date' => Carbon::now()->subDays(5)->toDateString(),
                'status' => 'Active',
            ],
        ];

        $students = [];
        foreach ($studentsData as $st) {
            $students[] = Student::updateOrCreate(['student_code' => $st['student_code']], $st);
        }

        // 4. Create Sample Attendance records for active students
        $statuses = ['Present', 'Present', 'Present', 'Late', 'Absent'];
        for ($i = 1; $i <= 5; $i++) {
            $date = Carbon::now()->subDays($i)->toDateString();
            foreach ($students as $st) {
                if ($st->status === 'Active') {
                    Attendance::updateOrCreate(
                        [
                            'student_id' => $st->id,
                            'attendance_date' => $date
                        ],
                        [
                            'course_id' => $st->course_id,
                            'status' => $statuses[array_rand($statuses)],
                            'remarks' => 'Regular session attendance'
                        ]
                    );
                }
            }
        }
    }
}

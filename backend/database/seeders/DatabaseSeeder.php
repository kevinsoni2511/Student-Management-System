<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use App\Models\School;
use App\Models\User;
use App\Models\AcademicSession;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\Staff;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\FeeType;
use App\Models\FeeStructure;
use App\Models\StudentFee;
use App\Models\FeePayment;
use App\Models\Examination;
use App\Models\ExamMark;
use App\Models\Announcement;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Primary School
        $school = School::updateOrCreate(
            ['code' => 'DPGA-01'],
            [
                'name' => 'Delhi Public Global Academy',
                'email' => 'contact@delhiglobalschool.edu',
                'phone' => '+91 11 2345 6789',
                'address' => 'Institutional Area, Sector 14',
                'city' => 'New Delhi',
                'state' => 'Delhi',
                'country' => 'India',
                'currency' => '₹',
                'currency_code' => 'INR',
                'status' => 'Active',
            ]
        );

        // 2. Create Role-Based ERP Users
        $superAdmin = User::updateOrCreate(
            ['email' => 'superadmin@example.com'],
            [
                'name' => 'Super Administrator',
                'password' => Hash::make('admin123'),
                'role' => 'super_admin',
                'phone' => '+91 99999 88888',
                'status' => 'Active',
            ]
        );

        $schoolAdmin = User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'school_id' => $school->id,
                'name' => 'Dr. A. K. Banerjee (Principal)',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'phone' => '+91 98111 22233',
                'status' => 'Active',
            ]
        );

        $teacherUser = User::updateOrCreate(
            ['email' => 'teacher@example.com'],
            [
                'school_id' => $school->id,
                'name' => 'Dr. Rajesh Sharma',
                'password' => Hash::make('teacher123'),
                'role' => 'teacher',
                'phone' => '+91 98765 43210',
                'status' => 'Active',
            ]
        );

        $accountantUser = User::updateOrCreate(
            ['email' => 'accountant@example.com'],
            [
                'school_id' => $school->id,
                'name' => 'Sunita Rao (Accounts)',
                'password' => Hash::make('account123'),
                'role' => 'accountant',
                'phone' => '+91 98222 33445',
                'status' => 'Active',
            ]
        );

        // 3. Create Academic Sessions
        $activeSession = AcademicSession::updateOrCreate(
            ['school_id' => $school->id, 'session_name' => '2026-2027'],
            [
                'start_date' => '2026-04-01',
                'end_date' => '2027-03-31',
                'is_active' => true,
            ]
        );

        // 4. Create Classes & Sections
        $class10 = SchoolClass::updateOrCreate(
            ['school_id' => $school->id, 'class_name' => 'Class 10'],
            ['numeric_grade' => 10, 'status' => 'Active']
        );

        $class9 = SchoolClass::updateOrCreate(
            ['school_id' => $school->id, 'class_name' => 'Class 9'],
            ['numeric_grade' => 9, 'status' => 'Active']
        );

        $sec10A = Section::updateOrCreate(
            ['school_id' => $school->id, 'class_id' => $class10->id, 'section_name' => 'A'],
            ['capacity' => 45]
        );

        $sec10B = Section::updateOrCreate(
            ['school_id' => $school->id, 'class_id' => $class10->id, 'section_name' => 'B'],
            ['capacity' => 45]
        );

        $sec9A = Section::updateOrCreate(
            ['school_id' => $school->id, 'class_id' => $class9->id, 'section_name' => 'A'],
            ['capacity' => 40]
        );

        // 5. Create Core Subjects
        $subjectsData = [
            ['name' => 'Mathematics', 'code' => 'MATH-10', 'type' => 'Theory'],
            ['name' => 'Science', 'code' => 'SCI-10', 'type' => 'Both'],
            ['name' => 'English Language & Lit', 'code' => 'ENG-10', 'type' => 'Theory'],
            ['name' => 'Social Science', 'code' => 'SST-10', 'type' => 'Theory'],
            ['name' => 'Computer Applications', 'code' => 'COMP-10', 'type' => 'Practical'],
        ];

        $subjects = [];
        foreach ($subjectsData as $s) {
            $sub = Subject::updateOrCreate(
                ['school_id' => $school->id, 'subject_code' => $s['code']],
                ['subject_name' => $s['name'], 'subject_type' => $s['type'], 'status' => 'Active']
            );
            $subjects[] = $sub;
            $class10->subjects()->syncWithoutDetaching([$sub->id => ['school_id' => $school->id]]);
            $class9->subjects()->syncWithoutDetaching([$sub->id => ['school_id' => $school->id]]);
        }

        // 6. Create Faculty (Teachers)
        Teacher::updateOrCreate(
            ['school_id' => $school->id, 'employee_id' => 'TCH-2026-001'],
            [
                'user_id' => $teacherUser->id,
                'name' => 'Dr. Rajesh Sharma',
                'email' => 'teacher@example.com',
                'phone' => '+91 98765 43210',
                'gender' => 'Male',
                'qualification' => 'M.Sc, B.Ed, Ph.D (Mathematics)',
                'experience' => '12 Years',
                'joining_date' => '2018-06-15',
                'salary' => 65000.00,
                'status' => 'Active',
            ]
        );

        Teacher::updateOrCreate(
            ['school_id' => $school->id, 'employee_id' => 'TCH-2026-002'],
            [
                'name' => 'Priya Patel',
                'email' => 'priya.science@example.com',
                'phone' => '+91 98123 45678',
                'gender' => 'Female',
                'qualification' => 'M.Sc Physics, B.Ed',
                'experience' => '8 Years',
                'joining_date' => '2020-07-01',
                'salary' => 58000.00,
                'status' => 'Active',
            ]
        );

        // 7. Create Staff
        Staff::updateOrCreate(
            ['school_id' => $school->id, 'employee_id' => 'STF-2026-001'],
            [
                'user_id' => $accountantUser->id,
                'name' => 'Sunita Rao',
                'department' => 'Accounts & Finance',
                'designation' => 'Chief Accountant',
                'phone' => '+91 98222 33445',
                'email' => 'accountant@example.com',
                'joining_date' => '2019-03-10',
                'salary' => 52000.00,
                'status' => 'Active',
            ]
        );

        // 8. Create Students
        $studentsList = [
            [
                'admission_no' => 'ADM-2026-0001',
                'roll_no' => '101',
                'first_name' => 'Aarav',
                'last_name' => 'Mehta',
                'gender' => 'Male',
                'date_of_birth' => '2011-04-12',
                'blood_group' => 'O+',
                'email' => 'aarav.mehta@example.com',
                'phone' => '+91 98234 11111',
                'address' => 'B-402, Lotus Towers, Rohini',
                'city' => 'Delhi',
                'state' => 'Delhi',
                'parent_name' => 'Vikram Mehta',
                'parent_phone' => '+91 98234 00000',
                'parent_occupation' => 'Senior Architect',
                'admission_date' => '2026-04-05',
                'class_id' => $class10->id,
                'section_id' => $sec10A->id,
            ],
            [
                'admission_no' => 'ADM-2026-0002',
                'roll_no' => '102',
                'first_name' => 'Ananya',
                'last_name' => 'Sharma',
                'gender' => 'Female',
                'date_of_birth' => '2011-08-22',
                'blood_group' => 'B+',
                'email' => 'ananya.sharma@example.com',
                'phone' => '+91 98234 22222',
                'address' => '78, Green Park Extension',
                'city' => 'New Delhi',
                'state' => 'Delhi',
                'parent_name' => 'Deepak Sharma',
                'parent_phone' => '+91 98234 00002',
                'parent_occupation' => 'Chartered Accountant',
                'admission_date' => '2026-04-06',
                'class_id' => $class10->id,
                'section_id' => $sec10A->id,
            ],
            [
                'admission_no' => 'ADM-2026-0003',
                'roll_no' => '103',
                'first_name' => 'Rohan',
                'last_name' => 'Kapoor',
                'gender' => 'Male',
                'date_of_birth' => '2011-01-15',
                'blood_group' => 'A+',
                'email' => 'rohan.kapoor@example.com',
                'phone' => '+91 98234 33333',
                'address' => 'C-12, Vasant Vihar',
                'city' => 'New Delhi',
                'state' => 'Delhi',
                'parent_name' => 'Rajeev Kapoor',
                'parent_phone' => '+91 98234 00003',
                'parent_occupation' => 'Civil Engineer',
                'admission_date' => '2026-04-08',
                'class_id' => $class10->id,
                'section_id' => $sec10A->id,
            ],
            [
                'admission_no' => 'ADM-2026-0004',
                'roll_no' => '201',
                'first_name' => 'Ishita',
                'last_name' => 'Verma',
                'gender' => 'Female',
                'date_of_birth' => '2011-09-30',
                'blood_group' => 'AB+',
                'email' => 'ishita.verma@example.com',
                'phone' => '+91 98234 44444',
                'address' => 'Plot 90, Sector 21, Dwarka',
                'city' => 'New Delhi',
                'state' => 'Delhi',
                'parent_name' => 'Sanjay Verma',
                'parent_phone' => '+91 98234 00004',
                'parent_occupation' => 'Professor',
                'admission_date' => '2026-04-10',
                'class_id' => $class10->id,
                'section_id' => $sec10B->id,
            ],
            [
                'admission_no' => 'ADM-2026-0005',
                'roll_no' => '101',
                'first_name' => 'Kabir',
                'last_name' => 'Singh',
                'gender' => 'Male',
                'date_of_birth' => '2012-03-18',
                'blood_group' => 'O-',
                'email' => 'kabir.singh@example.com',
                'phone' => '+91 98234 55555',
                'address' => '14 Mall Road, Model Town',
                'city' => 'Delhi',
                'state' => 'Delhi',
                'parent_name' => 'Harpreet Singh',
                'parent_phone' => '+91 98234 00005',
                'parent_occupation' => 'Businessman',
                'admission_date' => '2026-04-12',
                'class_id' => $class9->id,
                'section_id' => $sec9A->id,
            ],
        ];

        $createdStudents = [];
        foreach ($studentsList as $st) {
            $createdStudents[] = Student::updateOrCreate(
                ['school_id' => $school->id, 'admission_no' => $st['admission_no']],
                array_merge($st, [
                    'school_id' => $school->id,
                    'academic_session_id' => $activeSession->id,
                    'status' => 'Active',
                ])
            );
        }

        // 9. Student Attendance Records
        $statuses = ['Present', 'Present', 'Present', 'Late', 'Absent'];
        for ($day = 1; $day <= 7; $day++) {
            $date = Carbon::now()->subDays($day)->toDateString();
            foreach ($createdStudents as $student) {
                StudentAttendance::updateOrCreate(
                    [
                        'school_id' => $school->id,
                        'student_id' => $student->id,
                        'attendance_date' => $date,
                    ],
                    [
                        'class_id' => $student->class_id,
                        'section_id' => $student->section_id,
                        'academic_session_id' => $activeSession->id,
                        'status' => $statuses[array_rand($statuses)],
                        'remarks' => 'Regular session attendance',
                        'marked_by' => $teacherUser->id,
                    ]
                );
            }
        }

        // 10. Fee Management Structure & Allocations
        $tuitionFee = FeeType::updateOrCreate(
            ['school_id' => $school->id, 'fee_name' => 'Tuition Fee (Quarterly)'],
            ['description' => 'Academic tuition and lab facility charges']
        );

        $examFee = FeeType::updateOrCreate(
            ['school_id' => $school->id, 'fee_name' => 'Examination Fee'],
            ['description' => 'Comprehensive evaluation and question paper charges']
        );

        $tuitionStruct10 = FeeStructure::updateOrCreate(
            [
                'school_id' => $school->id,
                'academic_session_id' => $activeSession->id,
                'class_id' => $class10->id,
                'fee_type_id' => $tuitionFee->id,
            ],
            [
                'amount' => 24000.00,
                'due_date' => '2026-06-30',
            ]
        );

        $examStruct10 = FeeStructure::updateOrCreate(
            [
                'school_id' => $school->id,
                'academic_session_id' => $activeSession->id,
                'class_id' => $class10->id,
                'fee_type_id' => $examFee->id,
            ],
            [
                'amount' => 3500.00,
                'due_date' => '2026-08-15',
            ]
        );

        // Assign fee to first student & generate receipt
        $student1 = $createdStudents[0];
        $stFee = StudentFee::updateOrCreate(
            [
                'school_id' => $school->id,
                'student_id' => $student1->id,
                'fee_structure_id' => $tuitionStruct10->id,
            ],
            [
                'academic_session_id' => $activeSession->id,
                'total_amount' => 24000.00,
                'discount' => 1000.00,
                'paid_amount' => 23000.00,
                'due_amount' => 0.00,
                'status' => 'Paid',
            ]
        );

        FeePayment::updateOrCreate(
            ['receipt_no' => 'RCP-2026-0001'],
            [
                'school_id' => $school->id,
                'student_fee_id' => $stFee->id,
                'student_id' => $student1->id,
                'amount_paid' => 23000.00,
                'payment_method' => 'UPI',
                'payment_date' => '2026-04-10',
                'transaction_ref' => 'UPI/2026/893412498',
                'remarks' => 'Quarter 1 Tuition Fee Paid via PhonePe',
                'received_by' => $accountantUser->id,
            ]
        );

        // 11. Examinations & Marks Ledger
        $exam = Examination::updateOrCreate(
            [
                'school_id' => $school->id,
                'academic_session_id' => $activeSession->id,
                'exam_name' => 'Mid-Term Evaluation 2026',
            ],
            [
                'start_date' => '2026-09-10',
                'end_date' => '2026-09-22',
                'status' => 'Completed',
            ]
        );

        foreach ($createdStudents as $student) {
            foreach ($subjects as $sub) {
                $obtained = rand(65, 98);
                $grade = $obtained >= 90 ? 'A+' : ($obtained >= 80 ? 'A' : ($obtained >= 70 ? 'B+' : 'B'));
                ExamMark::updateOrCreate(
                    [
                        'school_id' => $school->id,
                        'examination_id' => $exam->id,
                        'student_id' => $student->id,
                        'subject_id' => $sub->id,
                    ],
                    [
                        'class_id' => $student->class_id,
                        'max_marks' => 100.00,
                        'passing_marks' => 35.00,
                        'obtained_marks' => $obtained,
                        'grade' => $grade,
                        'remarks' => 'Good analytical comprehension',
                    ]
                );
            }
        }

        // 12. School Announcements
        Announcement::updateOrCreate(
            ['school_id' => $school->id, 'title' => 'Annual Inter-School Sports Olympiad 2026'],
            [
                'content' => 'Registration is now open for athletics, football, and badminton events taking place next month. Contact sports department for trial trials.',
                'target_role' => 'All',
                'publish_date' => '2026-10-15',
                'is_active' => true,
                'created_by' => $schoolAdmin->id,
            ]
        );

        Announcement::updateOrCreate(
            ['school_id' => $school->id, 'title' => 'Quarterly Parent-Teacher Meeting (PTM)'],
            [
                'content' => 'The PTM for Classes 9 and 10 will be conducted this Saturday from 9:00 AM to 1:00 PM. Parents are requested to adhere to their allotted time slots.',
                'target_role' => 'Parents',
                'publish_date' => '2026-10-25',
                'is_active' => true,
                'created_by' => $schoolAdmin->id,
            ]
        );
    }
}

    'use client';

    import { useState, useEffect } from 'react';
    import { useRouter } from 'next/navigation';
    import { auth, db } from '@/lib/firebaseConfig';
    import { collection, query, getDocs, orderBy, limit, where, Timestamp } from 'firebase/firestore';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { 
    Users, BookOpen, FileQuestion, BarChart3, 
    PlusCircle, BookMarked, CalendarDays, AlertCircle, 
    ArrowRight, PieChart 
    } from 'lucide-react';

    // Mock data types
    interface Student {
    id: string;
    name: string;
    email: string;
    joinDate: Timestamp;
    lastActive: Timestamp;
    quizzesTaken: number;
    averageScore: number;
    }

    interface Quiz {
    id: string;
    title: string;
    createdAt: Timestamp;
    questions: number;
    attempts: number;
    averageScore: number;
    }

    export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeStudents: 0,
        totalQuizzes: 0,
        quizzesCreatedThisMonth: 0,
        averageQuizScore: 0,
        quizAttempts: 0
    });
    const [recentStudents, setRecentStudents] = useState<Student[]>([]);
    const [popularQuizzes, setPopularQuizzes] = useState<Quiz[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
        try {
            // In a real implementation, these would be actual Firestore queries
            // For now, we'll use dummy data

            // Mock stats
            setStats({
            totalStudents: 156,
            activeStudents: 82,
            totalQuizzes: 48,
            quizzesCreatedThisMonth: 12,
            averageQuizScore: 78,
            quizAttempts: 1245
            });

            // Mock recent students
            setRecentStudents([
            {
                id: '1',
                name: 'Sarah Johnson',
                email: 'sarah.j@example.com',
                joinDate: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
                lastActive: Timestamp.fromDate(new Date()),
                quizzesTaken: 8,
                averageScore: 85
            },
            {
                id: '2',
                name: 'Michael Brown',
                email: 'michael.b@example.com',
                joinDate: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
                lastActive: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
                quizzesTaken: 5,
                averageScore: 72
            },
            {
                id: '3',
                name: 'Alex Rodriguez',
                email: 'alex.r@example.com',
                joinDate: Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
                lastActive: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
                quizzesTaken: 12,
                averageScore: 91
            }
            ]);

            // Mock popular quizzes
            setPopularQuizzes([
            {
                id: '1',
                title: 'Introduction to Physics',
                createdAt: Timestamp.fromDate(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)),
                questions: 25,
                attempts: 87,
                averageScore: 76
            },
            {
                id: '2',
                title: 'Advanced Mathematics',
                createdAt: Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)),
                questions: 30,
                attempts: 64,
                averageScore: 68
            },
            {
                id: '3',
                title: 'History of Science',
                createdAt: Timestamp.fromDate(new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)),
                questions: 40,
                attempts: 56,
                averageScore: 82
            }
            ]);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
        <div className="flex items-center justify-center h-full">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        );
    }

    return (
        <div className="space-y-8">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
            <Button onClick={() => router.push('/admin/dashboard/quizzes/create')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Quiz
            </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
                <p className="text-xs text-muted-foreground">
                {stats.activeStudents} active in last 30 days
                </p>
            </CardContent>
            </Card>
            
            <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Quizzes Created</CardTitle>
                <FileQuestion className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
                <p className="text-xs text-muted-foreground">
                {stats.quizzesCreatedThisMonth} created this month
                </p>
            </CardContent>
            </Card>
            
            <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Quiz Performance</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.averageQuizScore}%</div>
                <p className="text-xs text-muted-foreground">
                Average score across {stats.quizAttempts} attempts
                </p>
            </CardContent>
            </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Students */}
            <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Recent Students</CardTitle>
                <CardDescription>
                Students who recently joined your classes
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                {recentStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 dark:bg-blue-900 rounded-full h-10 w-10 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
                        {student.name.charAt(0)}
                        </div>
                        <div>
                        <p className="text-sm font-medium">{student.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{student.email}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm">{student.quizzesTaken} quizzes</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                        {student.averageScore}% avg. score
                        </p>
                    </div>
                    </div>
                ))}
                </div>
            </CardContent>
            <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => router.push('/admin/dashboard/students')}>
                View All Students
                <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
            </Card>

            {/* Popular Quizzes */}
            <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Popular Quizzes</CardTitle>
                <CardDescription>
                Your most attempted quizzes
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                {popularQuizzes.map((quiz) => (
                    <div key={quiz.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="bg-purple-100 dark:bg-purple-900 rounded-full h-10 w-10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <BookMarked className="h-5 w-5" />
                        </div>
                        <div>
                        <p className="text-sm font-medium">{quiz.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {quiz.questions} questions
                        </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm">{quiz.attempts} attempts</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                        {quiz.averageScore}% avg. score
                        </p>
                    </div>
                    </div>
                ))}
                </div>
            </CardContent>
            <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => router.push('/admin/dashboard/quizzes')}>
                View All Quizzes
                <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
            </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center justify-center space-y-2"
            onClick={() => router.push('/admin/dashboard/quizzes/create')}
            >
            <PlusCircle className="h-6 w-6" />
            <span>Create New Quiz</span>
            </Button>
            <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center justify-center space-y-2"
            onClick={() => router.push('/admin/dashboard/students/group')}
            >
            <Users className="h-6 w-6" />
            <span>Manage Student Groups</span>
            </Button>
            <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center justify-center space-y-2"
            onClick={() => router.push('/admin/dashboard/analytics')}
            >
            <PieChart className="h-6 w-6" />
            <span>View Analytics</span>
            </Button>
            <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center justify-center space-y-2"
            onClick={() => router.push('/admin/dashboard/calendar')}
            >
            <CalendarDays className="h-6 w-6" />
            <span>Schedule Quiz</span>
            </Button>
        </div>
        </div>
    );
    } 
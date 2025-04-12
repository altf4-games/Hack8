'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebaseConfig';
import { collection, query, getDocs, orderBy, where, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Users, Search, MoreHorizontal, Send, UserPlus, 
  FileText, BarChart3, Mail 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Mock student data interface
interface Student {
  id: string;
  name: string;
  email: string;
  joinDate: Timestamp;
  lastActive: Timestamp;
  quizzesTaken: number;
  averageScore: number;
  group: string;
}

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // In a production app, this would be a real Firestore query
        // For now, we'll use mock data
        const mockStudents: Student[] = [
          {
            id: '1',
            name: 'Sarah Johnson',
            email: 'sarah.j@example.com',
            joinDate: Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
            lastActive: Timestamp.fromDate(new Date()),
            quizzesTaken: 24,
            averageScore: 85,
            group: 'Science Class'
          },
          {
            id: '2',
            name: 'Michael Brown',
            email: 'michael.b@example.com',
            joinDate: Timestamp.fromDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)),
            lastActive: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
            quizzesTaken: 18,
            averageScore: 72,
            group: 'Math Group'
          },
          {
            id: '3',
            name: 'Alex Rodriguez',
            email: 'alex.r@example.com',
            joinDate: Timestamp.fromDate(new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)),
            lastActive: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
            quizzesTaken: 32,
            averageScore: 91,
            group: 'Science Class'
          },
          {
            id: '4',
            name: 'Jessica Williams',
            email: 'jessica.w@example.com',
            joinDate: Timestamp.fromDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)),
            lastActive: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
            quizzesTaken: 15,
            averageScore: 68,
            group: 'History Group'
          },
          {
            id: '5',
            name: 'David Miller',
            email: 'david.m@example.com',
            joinDate: Timestamp.fromDate(new Date(Date.now() - 120 * 24 * 60 * 60 * 1000)),
            lastActive: Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
            quizzesTaken: 28,
            averageScore: 79,
            group: 'Math Group'
          },
          {
            id: '6',
            name: 'Emma Davis',
            email: 'emma.d@example.com',
            joinDate: Timestamp.fromDate(new Date(Date.now() - 75 * 24 * 60 * 60 * 1000)),
            lastActive: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
            quizzesTaken: 21,
            averageScore: 88,
            group: 'Literature Club'
          },
          {
            id: '7',
            name: 'Ryan Wilson',
            email: 'ryan.w@example.com',
            joinDate: Timestamp.fromDate(new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)),
            lastActive: Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)),
            quizzesTaken: 12,
            averageScore: 65,
            group: 'Literature Club'
          },
          {
            id: '8',
            name: 'Olivia Martinez',
            email: 'olivia.m@example.com',
            joinDate: Timestamp.fromDate(new Date(Date.now() - 55 * 24 * 60 * 60 * 1000)),
            lastActive: Timestamp.fromDate(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)),
            quizzesTaken: 29,
            averageScore: 93,
            group: 'Science Class'
          }
        ];

        setStudents(mockStudents);
        setFilteredStudents(mockStudents);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching students:', error);
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Handle search
  useEffect(() => {
    if (searchQuery) {
      const filtered = students.filter(student => 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.group.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchQuery, students]);

  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 75) return 'text-blue-600 dark:text-blue-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Students</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => router.push('/admin/dashboard/students/group')}>
            <Users className="mr-2 h-4 w-4" />
            Manage Groups
          </Button>
          <Button onClick={() => router.push('/admin/dashboard/students/invite')}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Students
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Students</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                placeholder="Search students..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <CardDescription>
            Showing {filteredStudents.length} students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Quizzes</TableHead>
                <TableHead>Avg. Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <div className="bg-blue-100 dark:bg-blue-900 rounded-full h-8 w-8 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div>{student.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{student.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{student.group}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(student.joinDate)}</TableCell>
                  <TableCell>{formatDate(student.lastActive)}</TableCell>
                  <TableCell>{student.quizzesTaken}</TableCell>
                  <TableCell>
                    <span className={getScoreColor(student.averageScore)}>
                      {student.averageScore}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/admin/dashboard/students/${student.id}`)}>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          View Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/admin/dashboard/students/${student.id}/quizzes`)}>
                          <FileText className="mr-2 h-4 w-4" />
                          View Quizzes
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push(`/admin/dashboard/messages/new?studentId=${student.id}`)}>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/admin/dashboard/quizzes/assign?studentId=${student.id}`)}>
                          <Send className="mr-2 h-4 w-4" />
                          Assign Quiz
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 
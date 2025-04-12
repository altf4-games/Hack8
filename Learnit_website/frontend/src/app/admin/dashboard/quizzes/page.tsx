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
  PlusCircle, Search, MoreHorizontal, Copy, Pencil, 
  Trash2, Send, Eye, FileText, BarChart3, Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock quiz interface
interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  attempts: number;
  averageScore: number;
  status: 'draft' | 'published';
  category: string;
}

export default function QuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        // This would be a Firestore query in production
        // Mock data for development
        const mockQuizzes: Quiz[] = [
          {
            id: '1',
            title: 'Introduction to Physics',
            description: 'Basic concepts of physics including motion, energy, and forces.',
            questions: 25,
            createdAt: Timestamp.fromDate(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)),
            updatedAt: Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)),
            attempts: 78,
            averageScore: 76,
            status: 'published',
            category: 'Science'
          },
          {
            id: '2',
            title: 'Advanced Mathematics',
            description: 'College-level math covering calculus, algebra, and trigonometry.',
            questions: 30,
            createdAt: Timestamp.fromDate(new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)),
            updatedAt: Timestamp.fromDate(new Date(Date.now() - 18 * 24 * 60 * 60 * 1000)),
            attempts: 45,
            averageScore: 68,
            status: 'published',
            category: 'Mathematics'
          },
          {
            id: '3',
            title: 'Literature Classics',
            description: 'Quiz on famous literary works and authors throughout history.',
            questions: 20,
            createdAt: Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
            updatedAt: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
            attempts: 32,
            averageScore: 82,
            status: 'published',
            category: 'Literature'
          },
          {
            id: '4',
            title: 'World Geography',
            description: 'Test your knowledge of countries, capitals, and geographical features.',
            questions: 40,
            createdAt: Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)),
            updatedAt: Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)),
            attempts: 56,
            averageScore: 75,
            status: 'published',
            category: 'Geography'
          },
          {
            id: '5',
            title: 'Computer Science Fundamentals',
            description: 'Programming concepts, data structures, and algorithms.',
            questions: 35,
            createdAt: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
            updatedAt: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
            attempts: 0,
            averageScore: 0,
            status: 'draft',
            category: 'Computer Science'
          },
          {
            id: '6',
            title: 'Ancient History',
            description: 'Exploring ancient civilizations, events, and historical figures.',
            questions: 28,
            createdAt: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
            updatedAt: Timestamp.fromDate(new Date(Date.now() - 6 * 60 * 60 * 1000)),
            attempts: 0,
            averageScore: 0,
            status: 'draft',
            category: 'History'
          }
        ];

        setQuizzes(mockQuizzes);
        setFilteredQuizzes(mockQuizzes);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        setIsLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  // Filter quizzes based on search and active tab
  useEffect(() => {
    let filtered = [...quizzes];
    
    // Filter by tab
    if (activeTab === 'published') {
      filtered = filtered.filter(quiz => quiz.status === 'published');
    } else if (activeTab === 'drafts') {
      filtered = filtered.filter(quiz => quiz.status === 'draft');
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(quiz => 
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredQuizzes(filtered);
  }, [searchQuery, activeTab, quizzes]);

  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    return status === 'published' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
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
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Quizzes</h1>
        <Button onClick={() => router.push('/admin/dashboard/quizzes/create')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Quiz
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="all">All Quizzes</TabsTrigger>
                <TabsTrigger value="published">Published</TabsTrigger>
                <TabsTrigger value="drafts">Drafts</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                placeholder="Search quizzes..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <CardDescription>
            Showing {filteredQuizzes.length} quizzes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quiz</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Avg. Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{quiz.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                        {quiz.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{quiz.category}</Badge>
                  </TableCell>
                  <TableCell>{quiz.questions}</TableCell>
                  <TableCell>{formatDate(quiz.createdAt)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(quiz.status)}>
                      {quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{quiz.attempts}</TableCell>
                  <TableCell>
                    {quiz.status === 'published' && quiz.attempts > 0 ? `${quiz.averageScore}%` : '-'}
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
                        <DropdownMenuItem onClick={() => router.push(`/admin/dashboard/quizzes/${quiz.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Quiz
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/admin/dashboard/quizzes/${quiz.id}/edit`)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Quiz
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/admin/dashboard/quizzes/${quiz.id}/duplicate`)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push(`/admin/dashboard/quizzes/${quiz.id}/results`)}>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          View Results
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/admin/dashboard/quizzes/${quiz.id}/export`)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Export Results
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push(`/admin/dashboard/quizzes/assign?quizId=${quiz.id}`)}>
                          <Send className="mr-2 h-4 w-4" />
                          Assign to Students
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/admin/dashboard/quizzes/${quiz.id}/schedule`)}>
                          <Calendar className="mr-2 h-4 w-4" />
                          Schedule
                        </DropdownMenuItem>
                        {quiz.status === 'published' ? (
                          <DropdownMenuItem onClick={() => alert(`Quiz ${quiz.id} would be unpublished`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Unpublish
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => alert(`Quiz ${quiz.id} would be published`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Publish
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => alert(`Quiz ${quiz.id} would be deleted`)}
                          className="text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
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
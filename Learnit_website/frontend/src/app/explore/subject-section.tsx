import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, Star } from "lucide-react"

export interface Course {
  id: string
  title: string
  description: string
  instructor: string
  level: "Beginner" | "Intermediate" | "Advanced"
  duration: string
  students: number
  rating: number
  image: string
}

interface SubjectSectionProps {
  title: string
  description: string
  courses: Course[]
}

export function SubjectSection({ title, description, courses }: SubjectSectionProps) {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden flex flex-col h-full">
            <div className="h-48 overflow-hidden">
              <img
                src={course.image || "/placeholder.svg"}
                alt={course.title}
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{course.title}</CardTitle>
                <Badge
                  variant={
                    course.level === "Beginner"
                      ? "default"
                      : course.level === "Intermediate"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {course.level}
                </Badge>
              </div>
              <CardDescription>{course.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <Clock className="mr-2 h-4 w-4" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <Users className="mr-2 h-4 w-4" />
                <span>{course.students.toLocaleString()} students</span>
              </div>
              <div className="flex items-center text-sm">
                <Star className="mr-2 h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{course.rating.toFixed(1)}</span>
              </div>
              <p className="mt-4 text-sm">
                Instructor: <span className="font-medium">{course.instructor}</span>
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Enroll Now</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SubjectSection } from "./subject-section"
import { SignLanguageSection } from "./sign-language-section"
import { physicsData, pythonData, chemistryData, languageData } from "./data"

export default function ExplorePage() {
  return (
    <div className="w-full px-4 py-12">
      <div className="w-full max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-10 text-center">Explore Subjects</h1>

        <Tabs defaultValue="physics" className="w-full">
          <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-10">
            <TabsTrigger value="physics">Physics</TabsTrigger>
            <TabsTrigger value="python">Python</TabsTrigger>
            <TabsTrigger value="chemistry">Chemistry</TabsTrigger>
            <TabsTrigger value="sign-language">Sign Language</TabsTrigger>
            <TabsTrigger value="languages">Languages</TabsTrigger>
          </TabsList>

          <div className="space-y-12">
            <TabsContent value="physics">
              <SubjectSection
                title="Physics"
                description="Explore the fundamental laws that govern our universe"
                courses={physicsData}
              />
            </TabsContent>

            <TabsContent value="python">
              <SubjectSection
                title="Python"
                description="Learn one of the most popular programming languages"
                courses={pythonData}
              />
            </TabsContent>

            <TabsContent value="chemistry">
              <SubjectSection
                title="Chemistry"
                description="Discover the science of matter and its transformations"
                courses={chemistryData}
              />
            </TabsContent>

            <TabsContent value="sign-language">
              <SignLanguageSection />
            </TabsContent>

            <TabsContent value="languages">
              <SubjectSection
                title="Languages"
                description="Master new languages and connect with cultures around the world"
                courses={languageData}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

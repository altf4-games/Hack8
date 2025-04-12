import IndexRequestHelper from '../components/SEOHelper/IndexRequestHelper';

export const metadata = {
  title: 'SEO Tools | Quizitt - Improve Search Visibility',
  description: 'Tools to help improve the search engine visibility of Quizitt, including Google Search Console integration and indexing assistance.',
  alternates: {
    canonical: 'https://quizitt.com/seo-tools',
  },
};

export default function SEOToolsPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">SEO Tools & Indexing Manager</h1>
      <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
        Use these tools to improve Quizitt's search engine visibility, fix indexing issues, 
        and manage how your content appears in Google Search results.
      </p>
      
      <IndexRequestHelper />
    </div>
  );
} 
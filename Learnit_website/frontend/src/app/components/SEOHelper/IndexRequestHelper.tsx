'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

/**
 * This component helps website admins request Google to index their pages
 * and diagnose indexing issues with their website.
 */
const IndexRequestHelper: React.FC = () => {
  const [url, setUrl] = useState('https://quizitt.com');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // List of pages with indexing issues from Search Console
  const problematicPages = [
    '/dashboard',
    '/pdfquizgenerator',
    '/profile',
    '/quizPage',
    '/history',
  ];

  const checkUrl = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the index helper API to check the URL
      const response = await fetch(`/api/indexing-helper?url=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to check URL: ${response.statusText}`);
      }
      
      const data = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Failed to check URL');
    } finally {
      setLoading(false);
    }
  };

  const openGoogleSearchConsole = () => {
    // Open Google Search Console URL inspection
    const googleUrl = `https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent(url.split('/')[2])}&url=${encodeURIComponent(url)}`;
    window.open(googleUrl, '_blank');
  };

  const openGoogleCache = () => {
    // Check if the page is in Google's cache
    const cacheUrl = `https://webcache.googleusercontent.com/search?q=cache:${encodeURIComponent(url)}`;
    window.open(cacheUrl, '_blank');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Google Indexing Helper</CardTitle>
        <CardDescription>
          Check for indexing issues and request Google to index your pages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="check">
          <TabsList className="mb-4">
            <TabsTrigger value="check">Check URL</TabsTrigger>
            <TabsTrigger value="problematic">Problematic Pages</TabsTrigger>
            <TabsTrigger value="guide">Indexing Guide</TabsTrigger>
          </TabsList>
          
          <TabsContent value="check">
            <div className="space-y-4">
              <div className="flex items-end gap-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="url">URL to check</Label>
                  <Input 
                    id="url" 
                    value={url} 
                    onChange={(e) => setUrl(e.target.value)} 
                    placeholder="https://quizitt.com/page-to-check" 
                  />
                </div>
                <Button onClick={checkUrl} disabled={loading}>
                  {loading ? 'Checking...' : 'Check URL'}
                </Button>
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {results && (
                <div className="space-y-4 mt-4">
                  <h3 className="text-lg font-medium">Results for {results.url}</h3>
                  
                  {results.indexabilityChecks.hasRobotsNoindex && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Blocked by robots directive</AlertTitle>
                      <AlertDescription>
                        This page has a noindex directive which prevents Google from indexing it.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {results.indexabilityChecks.hasRedirect && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Redirect detected</AlertTitle>
                      <AlertDescription>
                        This URL redirects to {results.indexabilityChecks.redirectUrl}.
                        Update internal links to point directly to the final URL.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {!results.indexabilityChecks.hasMetaDescription && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Missing meta description</AlertTitle>
                      <AlertDescription>
                        Adding a meta description can improve click-through rates from search results.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {!results.indexabilityChecks.hasCanonical && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Missing canonical tag</AlertTitle>
                      <AlertDescription>
                        A canonical tag helps prevent duplicate content issues.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {!results.guidance.length && (
                    <Alert variant="default" className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertTitle>No issues detected</AlertTitle>
                      <AlertDescription>
                        This page appears to be configured correctly for indexing.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="problematic">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                These pages have been reported as not being indexed in Google Search Console. 
                Click the button next to each URL to request indexing.
              </p>
              
              <div className="divide-y">
                {problematicPages.map((page) => (
                  <div key={page} className="py-3 flex justify-between items-center">
                    <span className="font-medium">https://quizitt.com{page}</span>
                    <div className="space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setUrl(`https://quizitt.com${page}`);
                          checkUrl();
                        }}
                      >
                        Check
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => {
                          window.open(`https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent('https://quizitt.com')}&url=${encodeURIComponent(`https://quizitt.com${page}`)}`, '_blank');
                        }}
                      >
                        Request Indexing
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="guide">
            <div className="space-y-4 text-sm">
              <h3 className="text-lg font-medium">How to improve indexing</h3>
              
              <div className="space-y-3">
                <h4 className="font-medium">1. Fix Pages with Redirect (3 pages)</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Check redirect chains: Make sure redirects point directly to the final URL</li>
                  <li>Fix unnecessary redirects: Update internal links to point to final URLs</li>
                  <li>Ensure redirected pages use 301 redirects: These indicate permanent moves</li>
                  <li>Check redirect destinations: Make sure they lead to relevant content</li>
                </ul>
                
                <h4 className="font-medium">2. "Discovered - currently not indexed" (7 pages)</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Improve content quality: Google may not index low-value content</li>
                  <li>Check for duplicate content: Make sure the content is unique</li>
                  <li>Improve internal linking: Link to these pages from important pages on your site</li>
                  <li>Add quality backlinks: External links can help signal importance</li>
                  <li>Verify no "noindex" tags: Check HTML and HTTP headers</li>
                  <li>Submit directly for indexing: Use the URL Inspection tool</li>
                </ul>
                
                <h4 className="font-medium">3. General improvements</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Keep your sitemap up to date and submit it to Google</li>
                  <li>Improve site speed: Faster sites get crawled more efficiently</li>
                  <li>Fix mobile usability issues: Google uses mobile-first indexing</li>
                  <li>Improve site architecture: Make content accessible within 3-4 clicks from homepage</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex space-x-2">
          <Button variant="outline" onClick={openGoogleCache}>
            Check Google Cache
          </Button>
          <Button variant="outline" onClick={openGoogleSearchConsole}>
            Open in Search Console
          </Button>
        </div>
        <Button 
          onClick={() => window.open('https://search.google.com/search-console', '_blank')}
        >
          Go to Search Console
        </Button>
      </CardFooter>
    </Card>
  );
};

export default IndexRequestHelper;
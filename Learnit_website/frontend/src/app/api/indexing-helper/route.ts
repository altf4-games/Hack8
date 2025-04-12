import { NextResponse } from 'next/server';

// This API route helps identify potential indexing issues
// It checks common problems like missing metadata, noindex tags, canonical issues, etc.

export async function GET(request: Request) {
  // Get the URL to check from the query string
  const { searchParams } = new URL(request.url);
  const pageUrl = searchParams.get('url');

  if (!pageUrl) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    // Fetch the page content
    const response = await fetch(pageUrl);
    
    if (!response.ok) {
      return NextResponse.json({ 
        error: `Failed to fetch page: ${response.status} ${response.statusText}` 
      }, { status: 500 });
    }

    const html = await response.text();
    
    // Basic checks for indexability
    const indexabilityChecks = {
      hasRobotsNoindex: html.includes('name="robots" content="noindex') || 
                        html.includes('name="robots" content="none'),
      hasMetaDescription: html.includes('name="description"'),
      hasCanonical: html.includes('rel="canonical"'),
      hasTitle: html.includes('<title>') && !html.includes('<title></title>'),
      hasRedirect: response.redirected,
      redirectUrl: response.redirected ? response.url : null,
      statusCode: response.status,
      contentLength: html.length,
    };

    // Provide guidance based on the checks
    let guidance = [];
    
    if (indexabilityChecks.hasRobotsNoindex) {
      guidance.push('Page has noindex directive which prevents Google from indexing it');
    }
    
    if (!indexabilityChecks.hasMetaDescription) {
      guidance.push('Page is missing meta description which can affect click-through rates');
    }
    
    if (!indexabilityChecks.hasTitle) {
      guidance.push('Page is missing title or has empty title tag');
    }
    
    if (indexabilityChecks.hasRedirect) {
      guidance.push(`Page redirects to ${indexabilityChecks.redirectUrl} - update internal links to point directly to the final URL`);
    }
    
    if (!indexabilityChecks.hasCanonical) {
      guidance.push('Page is missing canonical tag which helps prevent duplicate content issues');
    }
    
    return NextResponse.json({
      url: pageUrl,
      indexabilityChecks,
      guidance,
      googleSearchConsoleIndexingUrl: `https://search.google.com/search-console/index?resource_id=${encodeURIComponent(new URL(pageUrl).origin)}&utm_medium=link&utm_campaign=indexing-helper`,
    });
    
  } catch (error) {
    return NextResponse.json({ error: 'Failed to analyze page' }, { status: 500 });
  }
}

// This route can be expanded to also submit URLs to the Google Indexing API
// with proper authentication if you set up the required credentials 
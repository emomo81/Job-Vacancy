import { NextRequest, NextResponse } from 'next/server';
import { MOCK_CANDIDATES } from '../../../../utils/mock-candidates';
import { filterCandidates, sortCandidates } from '../../../../utils/candidate-logic';
import { CandidateFilters, Recommendation, Source } from '../../../../utils/candidate-types';

/**
 * GET /api/candidates/shortlisted
 * Returns a list of shortlisted candidates with optional filtering and sorting
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Build filters from query params
    const filters: CandidateFilters = {
      search: searchParams.get('search') || undefined,
      minScore: searchParams.get('minScore') ? parseInt(searchParams.get('minScore')!) : undefined,
      maxScore: searchParams.get('maxScore') ? parseInt(searchParams.get('maxScore')!) : undefined,
      recommendation: searchParams.get('recommendation')?.split(',') as Recommendation[] || undefined,
      source: searchParams.get('source')?.split(',') as Source[] || undefined,
      skills: searchParams.get('skills')?.split(',') || undefined,
      location: searchParams.get('location')?.split(',') || undefined,
    };

    // Build sort options
    const sortField = searchParams.get('sortBy') || 'score';
    const sortOrder = (searchParams.get('order') || 'desc') as 'asc' | 'desc';

    // Apply filtering and sorting
    let results = filterCandidates(MOCK_CANDIDATES, filters);
    results = sortCandidates(results, { field: sortField as any, order: sortOrder });

    // Pagination (optional, but good for production-ready)
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const paginatedResults = results.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedResults,
      meta: {
        total: results.length,
        page,
        limit,
        totalPages: Math.ceil(results.length / limit)
      }
    });

  } catch (error) {
    console.error('Error in candidates API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

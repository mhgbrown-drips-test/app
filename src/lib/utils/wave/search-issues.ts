import { MeiliSearch } from 'meilisearch';
import { BASE_URL } from '$lib/utils/base-url';
import type { IssueDetailsDto } from './types/issue';
import type { Pagination } from './types/pagination';

const client = new MeiliSearch({
  host: `${BASE_URL}/api/search`,
});

export async function searchIssues(
  query: string,
  page: number = 1,
  limit: number = 20,
): Promise<{ data: IssueDetailsDto[]; pagination: Pagination }> {
  const index = client.index('issues');

  const result = await index.search(query, {
    limit,
    offset: (page - 1) * limit,
  });

  // We need to map the Meilisearch hits to IssueDetailsDto
  // This might require some adjustment depending on what's actually in the index
  const data = result.hits.map((hit) => {
    // Ensure dates are converted
    return {
      ...hit,
      gitHubCreatedAt: new Date(hit.gitHubCreatedAt),
      gitHubUpdatedAt: new Date(hit.gitHubUpdatedAt),
      gitHubClosedAt: hit.gitHubClosedAt ? new Date(hit.gitHubClosedAt) : null,
      createdAt: new Date(hit.createdAt),
      updatedAt: new Date(hit.updatedAt),
    } as unknown as IssueDetailsDto;
  });

  return {
    data,
    pagination: {
      page,
      limit,
      total: result.estimatedTotalHits,
      totalPages: Math.ceil(result.estimatedTotalHits / limit),
      hasNextPage: page * limit < result.estimatedTotalHits,
      hasPreviousPage: page > 1,
    },
  };
}

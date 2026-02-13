import { memorySearch, type MemorySearchResult } from "./memory";

export interface QuickResearchParams {
  query: string;
  sources?: ("memory" | "context7" | "github")[];
  language?: string;
  limit?: number;
}

export interface QuickResearchResult {
  query: string;
  memory?: MemorySearchResult[];
  context7Hint?: string;
  githubHint?: string;
  suggestion: string;
}

export function quickResearch(params: QuickResearchParams): QuickResearchResult {
  const sources = params.sources || ["memory", "context7", "github"];
  const limit = params.limit || 5;
  
  let memoryResults: MemorySearchResult[] | undefined;
  let context7Hint: string | undefined;
  let githubHint: string | undefined;
  
  if (sources.includes("memory")) {
    try {
      memoryResults = memorySearch({ query: params.query, limit });
    } catch {
      // Memory not available
    }
  }
  
  if (sources.includes("context7")) {
    context7Hint = `Use context7 MCP tool: context7_resolve-library-id({ libraryName: "${params.query}" }) then context7_query-docs()`;
  }
  
  if (sources.includes("github")) {
    const langHint = params.language ? ` language:${params.language}` : "";
    githubHint = `Use gh-grep MCP tool: gh-grep_searchGitHub({ query: "${params.query}${langHint}" })`;
  }
  
  const suggestion = buildSuggestion(params.query, memoryResults, sources);
  
  return {
    query: params.query,
    memory: memoryResults,
    context7Hint,
    githubHint,
    suggestion,
  };
}

function buildSuggestion(
  query: string,
  memoryResults?: MemorySearchResult[],
  sources?: string[]
): string {
  const parts: string[] = [];
  
  if (memoryResults && memoryResults.length > 0) {
    parts.push(`Found ${memoryResults.length} relevant observations in memory.`);
    parts.push(`Check memory-get({ ids: "${memoryResults.map(r => r.id).join(",")}" }) for details.`);
  }
  
  if (sources?.includes("context7")) {
    parts.push(`For library docs, run context7_resolve-library-id → context7_query-docs.`);
  }
  
  if (sources?.includes("github")) {
    parts.push(`For code examples, run gh-grep_searchGitHub with your query.`);
  }
  
  if (parts.length === 0) {
    parts.push(`No results found. Try broadening your query or checking different sources.`);
  }
  
  return parts.join(" ");
}

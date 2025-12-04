<script lang="ts">
  import Cross from '$lib/components/icons/Cross.svelte';
  import MagnifyingGlass from '$lib/components/icons/MagnifyingGlass.svelte';
  import { searchIssues } from '$lib/utils/wave/search-issues';
  import type { IssueDetailsDto } from '$lib/utils/wave/types/issue';
  import type { Pagination } from '$lib/utils/wave/types/pagination';

  let {
    query = $bindable(),
    results = $bindable(),
    onclose,
  }: {
    query: string;
    results: { data: IssueDetailsDto[]; pagination: Pagination } | null;
    onclose: () => void;
  } = $props();

  let searchTimeout: ReturnType<typeof setTimeout>;
  let inputElement: HTMLInputElement;

  function handleSearch(q: string) {
    query = q;
    clearTimeout(searchTimeout);

    if (!q) {
      results = null;
      return;
    }

    searchTimeout = setTimeout(async () => {
      try {
        results = await searchIssues(q);
      } catch {
        // fail silently
      }
    }, 300);
  }

  function closeSearch() {
    handleSearch('');
    onclose();
  }

  $effect(() => {
    inputElement?.focus();
  });
</script>

<div class="search-bar" class:active={query}>
  <MagnifyingGlass />
  <input
    bind:this={inputElement}
    value={query}
    oninput={(e) => handleSearch(e.currentTarget.value)}
    placeholder="Search issues"
    type="text"
  />
  <button onclick={closeSearch} aria-label="Clear search">
    <Cross />
  </button>
</div>

<style>
  .search-bar {
    box-shadow: var(--elevation-low);
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    height: 2.25rem;
    display: flex;
    align-items: center;
    padding: 0 0.5rem;
    gap: 0.5rem;
    transition: box-shadow 0.3s;
    background-color: var(--color-background);
    border: 1px solid var(--color-foreground-level-3);
  }

  .search-bar.active {
    box-shadow: var(--elevation-medium);
  }

  .search-bar input {
    border: none;
    background: transparent;
    color: var(--color-foreground);
    width: 100%;
    outline: none;
  }
</style>

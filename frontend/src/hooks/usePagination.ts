import { useState } from "react";

export function usePagination<T>(items: readonly T[], pageSize = 5) {
  if (!Number.isInteger(pageSize) || pageSize < 1)
    throw new Error("El tamaño de página debe ser un entero positivo.");
  const [requestedPage, setRequestedPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);
  const visibleItems = items.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  function goToPage(page: number) {
    setRequestedPage(Math.max(1, Math.min(Math.trunc(page), totalPages)));
  }

  return {
    currentPage,
    pageSize,
    totalPages,
    visibleItems,
    goToPage,
    next: () => goToPage(currentPage + 1),
    previous: () => goToPage(currentPage - 1),
  };
}

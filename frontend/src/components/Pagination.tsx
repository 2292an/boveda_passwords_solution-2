interface Props {
  currentPage: number;
  totalPages: number;
  onGoToPage: (page: number) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function Pagination({ currentPage, totalPages, onGoToPage, onNext, onPrevious }: Props) {
  if (totalPages <= 1) return null;
  return <nav className="pagination" aria-label="Paginación de credenciales">
    <button type="button" disabled={currentPage === 1} onClick={onPrevious}>Anterior</button>
    {Array.from({ length: totalPages }, (_, index) => index + 1).map(page =>
      <button type="button" key={page} aria-label={`Página ${page}`} aria-current={page === currentPage ? "page" : undefined} onClick={() => onGoToPage(page)}>{page}</button>)}
    <button type="button" disabled={currentPage === totalPages} onClick={onNext}>Siguiente</button>
  </nav>;
}

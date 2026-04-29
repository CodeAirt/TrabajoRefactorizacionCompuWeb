export const Helpers = {
  formatearPrecioModerno: (numero: number): string => {
    if (numero == null || isNaN(numero)) return "$0";
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(numero);
  },
  
  paginarLista: (items: any[], page: number, size: number) => {
    if (!items || !Array.isArray(items)) return { items: [], page, totalPages: 0, total: 0, size };
    const paginaActual = Math.max(1, page);
    const tamanoPagina = Math.max(1, size);
    const inicio = (paginaActual - 1) * tamanoPagina;
    return {
      items: items.slice(inicio, inicio + tamanoPagina),
      page: paginaActual,
      totalPages: Math.ceil(items.length / tamanoPagina),
      total: items.length,
      size: tamanoPagina
    };
  },
  
  sortByField: (items: any[], field: string, order: "asc" | "desc") => {
    return [...items].sort((a, b) => {
      if (a[field] === b[field]) return 0;
      return (a[field] < b[field] ? -1 : 1) * (order === "asc" ? 1 : -1);
    });
  }
};
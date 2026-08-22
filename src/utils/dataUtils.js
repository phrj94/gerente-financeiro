/**
 * Converte uma string de data para o formato YYYY-MM-DD
 * Suporta os formatos: YYYY-MM-DD e DD-MM-YYYY
 * @param {string} dataString - String representando a data
 * @returns {string | null} - Data no formato YYYY-MM-DD ou null se inválida
 */
export function normalizarData(dataString) {
  if (!dataString || typeof dataString !== 'string') return null;

  // Remove espaços extras
  dataString = dataString.trim();

  // Regex para YYYY-MM-DD
  const regexAnoMesDia = /^(\d{4})-(\d{2})-(\d{2})$/;
  const matchAnoMesDia = dataString.match(regexAnoMesDia);
  if (matchAnoMesDia) {
    const ano = parseInt(matchAnoMesDia[1], 10);
    const mes = parseInt(matchAnoMesDia[2], 10);
    const dia = parseInt(matchAnoMesDia[3], 10);
    const data = new Date(ano, mes - 1, dia);
    if (data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia) {
      return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    }
    return null;
  }

  // Regex para DD-MM-YYYY
  const regexDiaMesAno = /^(\d{2})-(\d{2})-(\d{4})$/;
  const matchDiaMesAno = dataString.match(regexDiaMesAno);
  if (matchDiaMesAno) {
    const dia = parseInt(matchDiaMesAno[1], 10);
    const mes = parseInt(matchDiaMesAno[2], 10);
    const ano = parseInt(matchDiaMesAno[3], 10);
    const data = new Date(ano, mes - 1, dia);
    if (data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia) {
      return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    }
    return null;
  }

  return null;
}

/**
 * Verifica se uma data é válida
 * @param {string} dataString 
 * @returns {boolean}
 */
export function isDataValida(dataString) {
  return normalizarData(dataString) !== null;
}

/**
 * Retorna a data atual no formato YYYY-MM-DD
 * @returns {string}
 */
export function dataAtualISO() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/**
 * Retorna uma data no passado (dias atrás) no formato YYYY-MM-DD
 * @param {number} dias - Número de dias atrás
 * @returns {string}
 */
export function dataAtrasISO(dias) {
  const data = new Date();
  data.setDate(data.getDate() - dias);
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}
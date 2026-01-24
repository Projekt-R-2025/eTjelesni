/**
 * Formira datum u format: dd.mm.yyyy. hh:mm
 * @param {string} dateString - ISO datumski string
 * @returns {string} Formatirani datum
 */
export const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    const h = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    return `${d}.${m}.${y}. ${h}:${min}`;
};

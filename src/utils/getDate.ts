export const getDate = (): string => {
  return new Date(Date.now()).toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  })
}

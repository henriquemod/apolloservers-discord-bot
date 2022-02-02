export const domainValidation = (input: string): boolean => {
  const domainRegex =
    // eslint-disable-next-line no-useless-escape
    /^([a-z0-9]+([\-a-z0-9]*[a-z0-9]+)?\.){0,}([a-z0-9]+([\-a-z0-9]*[a-z0-9]+)?){1,63}(\.[a-z0-9]{2,7})+$/

  const ipv4Regex = /\d\d?\d?\.\d\d?\d?\.\d\d?\d?\.\d\d?\d?/

  return domainRegex.test(input) || ipv4Regex.test(input)
}

export const portValidation = (port: string): boolean => {
  return port.length < 6 && parseInt(port) > 0 && parseInt(port) < 65535
}

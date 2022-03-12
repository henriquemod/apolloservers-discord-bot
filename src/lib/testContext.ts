export class TestContext {
  public isValidTextChannel: boolean = false

  setIsValidTextChannel = (isValidTextChannel: boolean): void => {
    this.isValidTextChannel = isValidTextChannel
  }

  getIsValidTextChannel = (): boolean => {
    return this.isValidTextChannel
  }
}

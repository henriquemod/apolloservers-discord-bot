import WOKCommands from 'wokcommands'

export class AppContext {
  masterkey: string
  instance: WOKCommands

  setMasterkey(masterkey: string): void {
    this.masterkey = masterkey
  }

  setInstance(instance: WOKCommands): void {
    this.instance = instance
  }
}

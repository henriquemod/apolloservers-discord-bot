import WOKCommands from 'wokcommands'

export class AppContext {
  masterkey: string
  intance: WOKCommands

  setMasterkey(masterkey: string): void {
    this.masterkey = masterkey
  }

  setInstance(instance: WOKCommands): void {
    this.intance = instance
  }
}

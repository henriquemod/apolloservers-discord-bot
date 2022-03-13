import { ScheduleController } from '../controllers/schedule-controller'
import WOKCommands from 'wokcommands'

export class AppContext {
  masterkey: string
  instance: WOKCommands
  schedule: ScheduleController

  setMasterkey(masterkey: string): void {
    this.masterkey = masterkey
  }

  setInstance(instance: WOKCommands): void {
    this.instance = instance
  }

  setScheduleController(controller: ScheduleController): void {
    this.schedule = controller
  }
}

import {Command, flags} from '@oclif/command'
import {GpioMapping, LedMatrix} from 'rpi-led-matrix'

class RpiLedMatrixFire extends Command {
  static description = 'Draws a fire'

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),
    'led-rows': flags.integer({default: 32}),
    'led-cols': flags.integer({default: 64}),
    'led-slowdown-gpio': flags.integer({default: 4}),
  }

  matrix: any;

  i = 0;

  colors = [0x0000FF, 0x42B757, 0x4267B7, 0xAF42B7, 0xA80401, 0x92C621]

  sleep(ms: number) {
    return new Promise(resolve => {
      setTimeout(resolve, ms)
    })
  }

  async run() {
    const {flags} = this.parse(RpiLedMatrixFire)

    this.log(`Building the matrix ${flags['led-cols']}x${flags['led-rows']}...`)

    const matrixOptions = {
      ...LedMatrix.defaultMatrixOptions(),
      rows: flags['led-rows'] as 32 | 16 | 64,
      cols: flags['led-cols'] as 32 | 16 | 64,
      hardwareMapping: GpioMapping.AdafruitHat,
      chainLength: 1 as 4 | 1 | 2 | 3 | 5 | 6 | 7 | 8,
    }

    const runtimeOptions = {
      ...LedMatrix.defaultRuntimeOptions(),
      gpioSlowdown: flags['led-slowdown-gpio'] as 0 | 1 | 2 | 3 | 4,
    }

    this.matrix = new LedMatrix(matrixOptions, runtimeOptions)
    await this.draw()
  }

  async draw() {
    this.log(`Draw - ${(new Date()).toISOString()}`)
    this.matrix
    .clear()            // clear the display
    .brightness(100)    // set the panel brightness to 100%
    .fgColor(this.colors[this.i])  // set the active color to blue
    .fill()             // color the entire diplay blue
    .sync()

    this.i++
    if (this.i > this.colors.length - 1)
      this.i = 0

    await this.sleep(4000)
    this.draw()
  }
}

export = RpiLedMatrixFire


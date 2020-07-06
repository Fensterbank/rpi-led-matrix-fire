import {Command, flags} from '@oclif/command'
import {GpioMapping, LedMatrix} from 'rpi-led-matrix'
import {random} from './utils'
import {COLORS} from './constants'

class RpiLedMatrixFire extends Command {
  static description = 'Draws a fire'

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),
    'led-rows': flags.integer(
      {
        default: 32,
        char: 'r',
        description: 'Rows of your LED panel in default hardware orientation',
      }),
    'led-cols': flags.integer({
      default: 64,
      char: 'c',
      description: 'Columns of your LED panel in default hardware orientation',
    }),
    'led-slowdown-gpio': flags.integer({
      default: 4,
      description: 'Slowdown GPIO. Needed for faster Pis and/or slower panels',
    }),
    brightness: flags.integer({
      default: 100,
      char: 'b',
      description: 'set the led brightness',
    }),
    portrait: flags.boolean({
      default: false,
      char: 'p',
      description: 'render portrait mode, otherwise landscape mode',
    }),
  }

  matrix: any;

  i = 0;

  colors = [0x0000FF, 0x42B757, 0x4267B7, 0xAF42B7, 0xA80401, 0x92C621]

  matrixWidth = 0;

  matrixHeight = 0;

  fireWidth = 0;

  fireHeight = 0;

  brightness = 100;

  intensities: any[] = [];

  drawField: any[] = [];

  portrait = false;

  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async run() {
    const {flags} = this.parse(RpiLedMatrixFire)
    this.portrait = flags.portrait

    // Initialize width and height. Keep in mind we show the fire rotated,
    // w/h of matrix is in default orientation for driver
    this.matrixWidth = flags['led-cols']
    this.matrixHeight = flags['led-rows']
    if (this.portrait) {
      // inverted rows / cols since fire is rotated
      this.fireWidth = flags['led-rows']
      this.fireHeight = flags['led-cols']
    } else {
      this.fireWidth = flags['led-cols']
      this.fireHeight = flags['led-rows']
    }

    this.log(`Building the matrix with ${this.matrixWidth}x${this.matrixHeight}...`)
    this.log(`Turning on fire with ${this.fireWidth}x${this.fireHeight}...`)

    this.brightness = flags.brightness

    const matrixOptions = {
      ...LedMatrix.defaultMatrixOptions(),
      rows: this.matrixHeight as 32 | 16 | 64,
      cols: this.matrixWidth as 32 | 16 | 64,
      hardwareMapping: GpioMapping.AdafruitHat,
      chainLength: 1 as 4 | 1 | 2 | 3 | 5 | 6 | 7 | 8,
    }

    const runtimeOptions = {
      ...LedMatrix.defaultRuntimeOptions(),
      gpioSlowdown: flags['led-slowdown-gpio'] as 0 | 1 | 2 | 3 | 4,
    }

    this.matrix = new LedMatrix(matrixOptions, runtimeOptions)
    this.initialize()
    await this.draw()
  }

  initialize() {
    // Fill up all intensities
    for (let i = 0; i < this.fireWidth * this.fireHeight; i++)
      this.intensities.push(0)

    // Create the fire source with max intensity
    for (let col = 0; col < this.fireWidth; col++) {
      const overFlowPixelIndex = this.fireWidth * this.fireHeight
      const index = (overFlowPixelIndex - this.fireWidth) + col
      this.intensities[index] = COLORS.length - 1
    }
  }

  propagate() {
    let col
    let row
    for (col = 0; col < this.fireWidth; col++) {
      for (row = 1; row < this.fireHeight; row++) {
        this.updatePixelIntensity(col + (this.fireWidth * row))
      }
    }
  }

  updatePixelIntensity(index: number) {
    const belowPixelIndex = index + this.fireWidth

    if (belowPixelIndex >= this.fireWidth * this.fireHeight)
      return

    const decay = random([0, 0, 0, 1, 1, 1, 1, 2, 3])
    const belowPixelIntensity = this.intensities[belowPixelIndex]
    const newIntensity = (belowPixelIntensity - decay >= 0 ? belowPixelIntensity - decay : 0)
    this.intensities[index - decay] = newIntensity
  }

  burn() {
    let col
    let row
    this.drawField = []
    this.propagate()
    for (col = 0; col < this.fireWidth; col++) {
      for (row = 0; row < this.fireHeight; row++) {
        const index = col + (this.fireWidth * row)
        const color = COLORS[this.intensities[index]]
        if (this.portrait) {
          // since we draw the fire rotated, we recalculate some things here
          this.matrix.fgColor(color).setPixel(this.fireHeight - row, col)
        } else {
          // since we draw the fire rotated, we recalculate some things here
          this.matrix.fgColor(color).setPixel(col, row)
        }
      }
    }
  }

  async draw() {
    this.matrix
    .clear()
    .brightness(this.brightness)

    this.burn()
    this.matrix.sync()

    await this.sleep(50)
    this.draw()
  }
}

export = RpiLedMatrixFire


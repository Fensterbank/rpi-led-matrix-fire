import {Command, flags} from '@oclif/command'
import {GpioMapping, LedMatrix} from 'rpi-led-matrix'
import { random } from './utils';
import { COLORS } from './constants';

interface Pixel {
  x: number,
  y: number,
  color: number;
}

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
  matrixWidth: number = 0;
  matrixHeight: number = 0;
  fireWidth: number = 0;
  fireHeight: number = 0;
  intensities: any[] = [];
  drawField: Pixel[] = [];

  sleep(ms: number) {
    return new Promise(resolve => {
      setTimeout(resolve, ms)
    })
  }

  async run() {
    const {flags} = this.parse(RpiLedMatrixFire)

    this.log(`Building the matrix ${flags['led-cols']}x${flags['led-rows']}...`)

    this.fireWidth = 64 // flags['led-cols'];
    this.fireHeight = 32 // flags['led-rows'];
    this.matrixWidth = flags['led-rows']
    this.matrixHeight = flags['led-cols'];

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
    this.initialize();
    await this.draw()
  }

  initialize() {
    // Fill up all intensities
    for (let i = 0; i < this.fireWidth * this.fireHeight; i++)
      this.intensities.push(0);

    // Create the fire source with max intensity
    for (let col = 0; col < this.fireWidth; col++) {
      let overFlowPixelIndex = this.fireWidth * this.fireHeight;
      let index = (overFlowPixelIndex - this.fireWidth) + col;
      this.intensities[index] = COLORS.length - 1;
    }
  }

  propagate() {
    let col, row;
    for (col = 0; col < this.fireWidth; col++) {
      for (row = 1; row < this.fireHeight; row++) {
        this.updatePixelIntensity(col + (this.fireWidth * row))
      }
    }
  }

  updatePixelIntensity(index: number) {
    //this.log(`Update Pixel Intensity ${index}`);
    let belowPixelIndex = index + this.fireWidth;

    if (belowPixelIndex >= this.fireWidth * this.fireHeight)
      return

    let decay = random([0,0,0,1,1,1,1,2,3]);
    let belowPixelIntensity = this.intensities[belowPixelIndex];
    let newIntensity = (belowPixelIntensity - decay >= 0 ? belowPixelIntensity - decay : 0);
    this.intensities[index - decay] = newIntensity;
  }

  burn() {
    let col, row;
    this.drawField = [];
    this.propagate();
    for (col = 0; col < this.fireWidth; col++) {
      for (row = 0; row < this.fireHeight; row++) {
        let index = col + (this.fireWidth * row)
        let color = COLORS[this.intensities[index]];
        this.drawField.push({ x: col, y: row, color: color });
      }
    }
  }

  async draw() {
    this.burn();

    this.matrix
    .clear()            // clear the display
    .brightness(50)    // set the panel brightness to 100%

    // Now we should rotate that to match our hardware
    this.drawField.forEach(pixel => {
      this.matrix.fgColor(pixel.color).setPixel(pixel.x, pixel.y);
    })

    this.matrix.sync()

    await this.sleep(500)
    this.draw()
  }
}

export = RpiLedMatrixFire


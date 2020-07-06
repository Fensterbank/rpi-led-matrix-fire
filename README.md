rpi-led-matrix-fire
===================

A fire for the RGB LED Matrix built on [oclif](https://oclif.io) and [rpi-rgb-led-matrix](https://github.com/hzeller/rpi-rgb-led-matrix).  
The fire is based on the [»Doom Fire algorithm«](https://fabiensanglard.net/doom_fire_psx/) and the code is heavily inspired by [that random gist I found somewhere in the web](https://gist.github.com/coulix/969b8eebada45ab210fbac1e38555cde).


<!-- toc -->
* [Usage](#usage)
* [Options](#options)
* [About this Project](#about)
* [License](#license)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ yarn install
$ sudo su
# ./bin/run
```

# Options
<!-- options -->
```
  -b, --brightness=brightness            [default: 100] set the led brightness
  -c, --led-cols=led-cols                [default: 64] Columns of your LED panel in default hardware orientation
  -h, --help                             show CLI help
  -p, --portrait                         render portrait mode, otherwise landscape
  -r, --led-rows=led-rows                [default: 32] Rows of your LED panel in default hardware orientation
  -v, --version                          show CLI version
  --led-slowdown-gpio=led-slowdown-gpio  [default: 4] Slowdown GPIO. Needed for faster Pis and/or slower panels

```

# About this project
<!-- about -->
After I finally bought an RGB LED Matrix I wanted to create something awesome with it.  
After it became clear that we needed a medieval lantern for our amateur theatre, which was supposed to go out by magic, I had found my project.  

The whole process of creating that lantern is documented here: tbd

# LICENSE
<!-- license -->
MIT
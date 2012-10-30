# nuw - Node Updater for Windows

This is a update script written in Node to update Node on Windows machines. It uses the complete msi packages. There is only one installed version of node at a time - installing a new version will replace the existing one.

nuw is inspired by TJ Holowaychuk's [n](https://github.com/visionmedia/n "n").

## Installation

nuw **should** be installed as a global package.

    C:\Users\me>npm install -g nuw

## Usage

### Output

To output currently installed version and type:

    nuw

To output all versions of node available:

    nuw ls

To output the latest and the latest stable node version available:

    nuw show

To output the latest node version available:

    nuw show latest

To output the latest stable node version available:

    nuw show stable

### Check

To check for newer release (depending on your currently installed type):

	nuw check

### Install

To install the latest or latest stable release (depending on your currently installed type):

	nuw update

To install the latest node release (ignoring your currently installed type):

	nuw latest

To install the latest stable node release (ignoring your currently installed type):

	nuw stable

To install a specific node release (like "0.8.10"):

	nuw 0.8.10

### Help

To display version of nuw:

    nuw ver

To display help:

    nuw help

## Details

nuw runs only on Windows. It will detect your architecture (32bit, 64bit) automatically and install the proper version. 

nuw can currently only update node to newer releases. If you want to downgrade you have to uninstall your current version and then install the older version.

Node releases will be downloaded to your global temp directory (defaults to "C:\Users\You\AppData\Local\Temp").

## License

(The MIT License)

Copyright (c) 2012 Sascha Drews &lt;mail@perfusorius.de&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
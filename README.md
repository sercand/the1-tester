# HOW TO INSTALL
## 1.INSTALL NODE.JS
This application requires node.js for working so you must install node.js firstly.
###WINDOWS AND MAC OS X
Download installer from http://nodejs.org/download/ and install it 
###UBUNTU
Run following code via terminal

	sudo apt-get install nodejs
	
And

	sudo ln -s /usr/bin/nodejs /usr/bin/node
	
    
For more information look https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager
## 2.INSTALL the1-tester VIA NPM
run following code
UBUNTU:

	sudo npm install the1-tester -g

WINDOWS
	
	npm install the1-tester -g
	
    
# USAGE
	the1tester -s

This code builds 'the1.c' and tests for default 100 inputs.

	USAGE: the1tester [OPTIONS] , where
    OPTIONS are:
      -c, --code <arg>              The1 source code
      -g, --generate <arg>          Generate new <arg> inputs for testing
      -s, --save                    Save log file
      -t, --tcc                     force to use tcc instead of gcc on Windows

#EXAMPLE USAGES
creates 250 new inputs for testing and saves log file:
	
    the1tester -g 250

builds mycode.c instead of the1.c and creates 200 inputs

	the1tester -c path/to/mycode.c -g 200



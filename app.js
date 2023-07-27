#!/usr/bin/env node

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

readline.question(`Enter a CIDR block for parsing:\n -> `, block => {
    let ipRegex = /([0-9]{1,3})/gm; // checks for 1-3 digit "chunks" throughout CIDR block
    let octets = block.match(ipRegex); // add chunks to octets array
    if (octets.length !== 5) { // fail fast if CIDR block is not appropriate length
        readline.close();
        return console.error(`\nERROR: CIDR Block should consist of 4 octets followed by a subnet mask.\n\tYou entered: ${block}`);
    } else {
        convertToBinary(octets);
    }
});

function convertToBinary(ipArray) {
    let subnetMask = ipArray.pop();
    let binaryArray = [];

    for (let i = 0; i < ipArray.length; i++) {
        let n = ipArray[i];
        let binaryDigits = [];
        // Verify range of each octet is within 32-bit decimal, otherwise error + close.
        if (0<=n && n<=255) {
            null;
        } else {
            readline.close();
            return console.error(`ERROR: Octets must range 0-255.\nFaulty Octet: ${n}`);
        };

        // decimal -> binary operation found listed @ https://indepth.dev/posts/1019/the-simple-math-behind-decimal-binary-conversion-algorithms#converting-decimal-integer-to-binary
        while (n >= 1) {
            let remainder = n%2
            binaryDigits.push(remainder)
            n = Math.floor(n/2);
        };
        binaryArray.push(binaryDigits.reverse().join(''));
    };

    // if binary -> decimal is not an octet, prepend 0's
    for (let i = 0; i < binaryArray.length; i++) {
        binaryArray[i].length === 8 ? null : binaryArray[i] = binaryArray[i].padStart(8, `0`);
   };
   // Determine the number of bits covered by the subnet mask, and return the network octets in binary.
   getSubnetBinaries(subnetMask, binaryArray);
};

// Replace remaining bits wit 0 to represent network, resulting in 0 bitwise AND comparison after mask.
// Show the user how many IP's are in the carved out subnet.
function getSubnetBinaries(mask, binaryArray) {
    let appendedZeros = 32 - mask;
    let subnetwork = (binaryArray.join(``).slice(0,mask));
    let numHosts = Math.pow(2,(32-mask))
    console.log(`
    ***************************************************
        Total number of hosts in range: ${numHosts}
    ***************************************************
        ` )
    subnetwork = subnetwork.concat('0'.repeat(appendedZeros));
    findNetworkIP(subnetwork);
}

// findNetworkIP finds the network IP address of a subnet mask given a 32-bit binary integer.
function findNetworkIP(subnetwork) {
    let binaryOctets = [];
    let allBins = [];
    for (var num of subnetwork) {
        allBins.push(num);
    };
    for (let i=0; i<allBins.length; i+=8) {
        const oct = allBins.slice(i,i+8);
        const octString = oct.join('');
        binaryOctets.push(octString);
    };

    const networkDecimalValues = binaryOctets.map(octet => parseInt(octet,2));
    
    readline.close();
    return console.log(`The network IP address is: ${networkDecimalValues}`);
}

console.log('console.log from foo.js');

// From https://github.com/bytecodealliance/javy?tab=readme-ov-file#compiling-to-webassembly
// Read input from stdin
const input = readInput();
// Call the function with the input
const result = foo(input);
// Write the result to stdout
writeOutput(1, result);
// Also write the result to stderr
writeOutput(2, result);

// The main function.
function foo(input) {
	return { foo: input.n + 1, newBar: input.bar + '!' };
}

// Read input from stdin
function readInput() {
	const chunkSize = 1024;
	const inputChunks = [];
	let totalBytes = 0;

	// Read all the available bytes
	while (1) {
		const buffer = new Uint8Array(chunkSize);
		// Stdin file descriptor
		const fd = 0;
		const bytesRead = Javy.IO.readSync(fd, buffer);

		totalBytes += bytesRead;
		if (bytesRead === 0) {
			break;
		}
		inputChunks.push(buffer.subarray(0, bytesRead));
	}

	// Assemble input into a single Uint8Array
	const { finalBuffer } = inputChunks.reduce(
		(context, chunk) => {
			context.finalBuffer.set(chunk, context.bufferOffset);
			context.bufferOffset += chunk.length;
			return context;
		},
		{ bufferOffset: 0, finalBuffer: new Uint8Array(totalBytes) },
	);

	return JSON.parse(new TextDecoder().decode(finalBuffer));
}

// Write output to stdout
function writeOutput(fd, output) {
	const encodedOutput = new TextEncoder().encode(JSON.stringify(output));
	const buffer = new Uint8Array(encodedOutput);
	Javy.IO.writeSync(fd, buffer);
}

/**
 * QRCode encoding consists of 7 steps.
 * 
 * 1. Data analysis
 *  - Identifying needed characters encoding to select the needed Mode.
 *  - Convert input data into a binary string.
 *  - If not provided, select minimal Version and ErrorCorrectionLevel
 *  allowing to encode the input data.
 * 
 * 2. Data encoding
 *  - Encode the binary string according to the selected Mode.
 *  - Add ModeIndicator bit sequence, the data, a Terminator bit sequence.
 *  - The bit stream is then split in 8bit codewords.
 *  - Add PaddingCharacters to fill the required number of codewords.
 *  
 * 3. Error correction encoding
 *  - Divide the codeword sequence in to the required number of blocks.
 *  (in preparation of error correction algorithms)
 *  - Generate the EC codewords for each block.
 *  - Append the EC codewords to the end of the data codeword sequence
 * 
 * 4. Message Structuring
 *  - Interleave data and error correction codewords.
 *  - Add remainder bits as necessary.
 * 
 * 5. Module Placement in the QRCode matrix
 *  - Place the codeword modules in the matrix together with:
 *    - Finder Pattern
 *    - Separators
 *    - Timing Pattern
 *    - Alignment Patterns
 * 
 * 6. Masking
 *  - Evaluate and select the masking pattern which optimizes dark/light 
 *  modules ratio.
 *  - Apply the mask
 * 
 * 7. Format and Version information
 *  - Generate the Format and (where applicable) Version Information and complete the symbol.
 */
export * from './public-api.js';

type Bit = boolean;
type Row = [Bit, Bit, Bit, Bit, Bit, Bit, Bit, Bit];
export type Char = [Row, Row, Row, Row, Row, Row, Row, Row];

function blankRow(): Row {
    const b0 = false;
    return [b0, b0, b0, b0, b0, b0, b0, b0];
}

function padZero(value: string, length: number) {
    return value.padStart(length, "0");
}

export function blankChar(): Char {
    return [
        blankRow(),
        blankRow(),
        blankRow(),
        blankRow(),
        blankRow(),
        blankRow(),
        blankRow(),
        blankRow(),
    ];
}

function rowToBits(row: Row): string {
    return row
        .map((bit: Bit) => bit ? "1" : "0")
        .join("");
}

function rowToNumber(row: Row): number {
    return parseInt(rowToBits(row), 2);
}

function rowToHex(row: Row): string {
    return padZero(rowToNumber(row).toString(16), 2);
}

function rowFromBits(bits: string): Row {
    const row = blankRow();
    for (let bit = 0; bit < 8; ++bit) {
        row[bit] = bits[bit] === "1";
    }
    return row;
}

function rowFromHex(hex: string): Row {
    if (hex.length !== 2) {
        throw new Error(
            `invalid row hex value, expected a length of 2, got ${hex.length}`,
        );
    }
    const bits = padZero(parseInt(hex, 16).toString(2), 8);
    return rowFromBits(bits);
}

export function charFromHex(hex: string): Char {
    if (hex.length !== 16) {
        throw new Error(
            `invalid char hex value, expected a length of 16, got ${hex.length}`,
        );
    }
    const char = blankChar();
    for (let row = 0; row < 8; ++row) {
        const rowPos = row * 2;
        const rowHex = hex.slice(rowPos, rowPos + 2);
        char[row] = rowFromHex(rowHex);
    }
    char.reverse();
    return char;
}

export function charToHex(char: Char): string {
    return char
        .map((row) => rowToHex(row))
        .toReversed()
        .join("");
}

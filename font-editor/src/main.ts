import { blankChar, Char, charFromHex, charToHex } from "./char.ts";

type EditorFile = {
    [char: string]: string;
};

type Font = { [char: string]: Char };

class FontEditor {
    private font: Font;
    private grid: HTMLElement;

    constructor(start: Font, grid: HTMLElement) {
        this.font = start;
        this.grid = grid;

        this.render();
    }

    private renderChar(key: string, char: Char): HTMLElement {
        const container = document.createElement("div");
        container.classList.add("char");
        const header = document.createElement("div");
        header.textContent = key;
        header.classList.add("char-header");

        const content = document.createElement("div");
        content.classList.add("char-content");
        content.append(
            ...char.map((row, rowIdx) => {
                const rowElement = document.createElement("div");
                rowElement.classList.add("char-row");
                rowElement.append(...row.map((bit, bitIdx) => {
                    const bitElement = document.createElement("div");
                    bitElement.classList.add(
                        "char-bit",
                        `char-bit-row-${rowIdx}-idx-${bitIdx}`,
                        bit ? "bit-1" : "bit-0",
                    );
                    bitElement.addEventListener("click", () => {
                        char[rowIdx][bitIdx] = !char[rowIdx][bitIdx];
                        const current = char[rowIdx][bitIdx];
                        bitElement.classList.remove("bit-1", "bit-0");
                        if (current) {
                            bitElement.classList.add("bit-1");
                        } else {
                            bitElement.classList.add("bit-0");
                        }
                    });
                    return bitElement;
                }));
                return rowElement;
            }),
        );
        container.append(header, content);
        return container;
    }

    private render() {
        const char = Object.entries(this.font)
            .map(([key, value]) => this.renderChar(key, value));
        this.grid.replaceChildren(...char);
    }

    import(file: EditorFile) {
        const entries = Object.entries(file).map(([key, char]) => {
            return [key, charFromHex(char)];
        });

        this.font = Object.fromEntries(entries);
        this.render();
    }

    export(): EditorFile {
        const entries = Object
            .entries(this.font)
            .map(([key, char]) => [key, charToHex(char)]);
        return Object.fromEntries(entries);
    }
}

function defaultChars(): Font {
    const keys = "abcdefghijklmnopqrstuvwxyzæøå0123456789+-_?";
    const entries = keys
        .split("")
        .flatMap((
            key,
        ) => [[key, blankChar()], [key.toUpperCase(), blankChar()]]);
    return Object.fromEntries(entries);
}

type Elements = {
    exportButton: HTMLElement;
    importButton: HTMLElement;
    importInput: HTMLInputElement;
    charContainer: HTMLElement;
};

function htmlElements(): Elements {
    const exportButton = document.querySelector<HTMLElement>("#export");
    if (!exportButton) {
        throw new Error("unreachable: defined in index.html");
    }
    const importInput = document.querySelector<HTMLInputElement>(
        "#import-input",
    );
    if (!importInput) {
        throw new Error("unreachable: defined in index.html");
    }
    const importButton = document.querySelector<HTMLElement>("#import");
    if (!importButton) {
        throw new Error("unreachable: defined in index.html");
    }

    const charContainer = document.querySelector<HTMLElement>("#chars");
    if (!charContainer) {
        throw new Error("unreachable: defined in index.html");
    }

    return { exportButton, importButton, importInput, charContainer };
}

function download(file: EditorFile) {
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(
        new Blob([JSON.stringify(file)], { type: "application/json" }),
    );
    anchor.download = "font.json";
    anchor.click();
}

function main() {
    const font: Font = defaultChars();
    const { charContainer, importInput, importButton, exportButton } =
        htmlElements();
    const editor = new FontEditor(font, charContainer);

    importButton.addEventListener("click", async () => {
        const files = importInput.files;
        if (!files || files.length === 0) {
            importInput.click();
            return;
        }
        if (files.length > 1) {
            alert("One file at a time!");
            return;
        }
        const file = files[0];
        try {
            const value = JSON.parse(await file.text());
            if (typeof value !== "object") {
                alert(`expected object, got ${typeof value}`);
                return;
            }
            for (const key in value) {
                if (typeof value[key] === "string") {
                    continue;
                }
                alert(
                    `field '${key}' has invalid value type '${value}', expected string`,
                );
                return;
            }
            editor.import(value);
        } catch (error) {
            alert(`an error parsing file: ${error}`);
            return;
        }
    });

    exportButton.addEventListener("click", () => {
        download(editor.export());
    });
}

main();
